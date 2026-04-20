import StoreProduct from "../../models/StoreProduct.js";
import Favorites from "../../models/Favorites.js";
import Store from "../../models/Store.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { GraphQLError } from "graphql";

import { deleteImage, extractPublicId } from "../../config/cloudinary.js";

import { sendResetPasswordEmail } from "../../config/nodemailer.js";
import {
	clearRefreshTokenCookieOptions,
	refreshTokenCookieOptions,
} from "../../config/cookieConfig.js";

export const AuthError = () =>
	new GraphQLError("Not authenticated", {
		extensions: { code: "UNAUTHENTICATED" },
	});

const userResolvers = {
	Query: {
		getUser: async (_, { id }, { user }) => {
			if (!user) throw AuthError();
			if (user.role !== "SUPER_ADMIN" && user.id !== id)
				throw new Error("Unauthorized");

			const foundUser = await User.findById(id);
			if (!foundUser) throw new Error("User not found");
			return foundUser;
		},

		getUsers: async (_, __, { user }) => {
			if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
			return await User.find();
		},
	},

	Mutation: {
		register: async (_, args) => {
			const existing = await User.findOne({ email: args.email.toLowerCase() });
			if (existing) throw new Error("Email already in use");

			const newUser = new User({ ...args, email: args.email.toLowerCase() });

			await newUser.save();
			return newUser;
		},

		login: async (_, { email, password }, { res }) => {
			const user = await User.findOne({ email: email.toLowerCase() });
			if (!user) throw new Error("Invalid credentials");

			const valid = await bcrypt.compare(password, user.password);
			if (!valid) throw new Error("Invalid credentials");
			if (!user.active) throw new Error("Account suspended");

			const isDefaultAdmin =
				user.role === "SUPER_ADMIN" &&
				email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();

			const token = jwt.sign(
				{ id: user._id, role: user.role },
				process.env.JWT_SECRET,
				{ expiresIn: "30s" },
			);

			const refreshToken = jwt.sign(
				{ id: user._id },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: "7d" },
			);

			res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

			return { token, user, isDefaultAdmin };
		},

		logout: async (_, __, { res }) => {
			res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
			return { success: true, message: "Logged out" };
		},

		updateUser: async (_, { id, ...args }, { user }) => {
			if (!user) throw AuthError();
			const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
			if (!isAdmin && user.id !== id) throw new Error("Unauthorized");

			if (args.role && user.role !== "SUPER_ADMIN")
				throw new Error("Unauthorized to change roles");
			return await User.findByIdAndUpdate(id, args, {
				new: true,
				runValidators: true,
			});
		},

		deleteUser: async (_, { id }, { user }) => {
			if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

			const targetUser = await User.findById(id);
			if (!targetUser) throw new Error("User not found");

			if (targetUser.role === "ADMIN") {
				const store = await Store.findOne({ owner: id });
				if (store) {
					if (store.logo) {
						const publicId = extractPublicId(store.logo);
						if (publicId) await deleteImage(publicId);
					}
					await StoreProduct.deleteMany({ store: store._id });
					await Store.findByIdAndDelete(store._id);
				}
			}

			await Favorites.deleteMany({ user: id });
			await User.findByIdAndDelete(id);

			return { success: true, message: "User deleted" };
		},

		toggleUserActive: async (_, { id, active }, { user }) => {
			if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
			const target = await User.findById(id);
			if (!target) throw new Error("User not found");
			if (target.role === "SUPER_ADMIN")
				throw new Error("Cannot suspend a Super Admin");

			// Si es ADMIN, propagar el estado a su store
			if (target.role === "ADMIN") {
				await Store.findOneAndUpdate({ owner: id }, { active });
			}

			return await User.findByIdAndUpdate(id, { active }, { new: true });
		},

		requestPasswordReset: async (_, { email }) => {
			const user = await User.findOne({ email: email.toLowerCase() });
			if (!user)
				return {
					success: true,
					message: "If the email exists, a reset link was sent",
				};

			const token = crypto.randomBytes(32).toString("hex");
			const hashedToken = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");
			const expiry = Date.now() + 3600000;

			user.resetToken = hashedToken;
			user.resetTokenExpiry = expiry;

			await user.save();
			await sendResetPasswordEmail(email, token);

			return { success: true, message: "Reset email sent" };
		},

		resetPassword: async (_, { token, newPassword }) => {
			const hashedToken = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");
			const user = await User.findOne({
				resetToken: hashedToken,
				resetTokenExpiry: { $gt: Date.now() },
			});
			if (!user) throw new Error("Invalid or expired token");
			user.password = newPassword; // el pre("save") hook lo hashea
			user.resetToken = undefined;
			user.resetTokenExpiry = undefined;
			await user.save();
			return { success: true, message: "Password updated successfully" };
		},

		changePassword: async (_, { currentPassword, newPassword }, { user }) => {
			if (!user) throw AuthError();
			const found = await User.findById(user._id);
			if (!found) throw new Error("User not found");
			const valid = await bcrypt.compare(currentPassword, found.password);
			if (!valid) throw new Error("Contraseña actual incorrecta");
			found.password = newPassword;
			await found.save();
			return { success: true, message: "Password updated" };
		},
	},
};

export default userResolvers;
