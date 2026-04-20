import Favorites from "../../models/Favorites.js";
import { AuthError } from "./userResolvers.js";

const PRODUCTS_POPULATE = {
	path: "products",
	populate: [
		{ path: "brand" },
		{ path: "category" },
		{ path: "segment" },
		{ path: "notes" },
	],
};

const favoritesResolvers = {
	Query: {
		getUserFavorites: async (_, { userId }, context) => {
			if (!context.user) throw AuthError();

			return await Favorites.findOne({ user: userId }).populate(
				PRODUCTS_POPULATE,
			);
		},
	},

	Mutation: {
		addToFavorites: async (_, { userId, productId }, context) => {
			if (!context.user) throw AuthError();
			let favs = await Favorites.findOne({ user: userId });
			if (!favs) favs = await Favorites.create({ user: userId, products: [] });

			const alreadyExists = favs.products.some(
				(p) => p.toString() === productId,
			);

			if (!alreadyExists) {
				favs.products.push(productId);
				await favs.save();
			}

			return await Favorites.findOne({ user: userId }).populate(
				PRODUCTS_POPULATE,
			);
		},

		removeFromFavorites: async (_, { userId, productId }, context) => {
			if (!context.user) throw AuthError();
			const favs = await Favorites.findOne({ user: userId });
			if (!favs) throw new Error("Favorites not found");
			favs.products = favs.products.filter((p) => p.toString() !== productId);
			await favs.save();
			return { success: true, message: "Removed from favorites" };
		},
	},
};

export default favoritesResolvers;
