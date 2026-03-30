import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["ADMIN", "COSTUMER", "SUPER_ADMIN"],
			default: "COSTUMER",
		},
		phone: {
			type: String,
			required: false,
		},
		address: {
			type: String,
			required: false,
		},
		resetToken: String,
		resetTokenExpiry: Date,
	},
	{ timestamps: true },
);

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model("User", UserSchema, "users");
