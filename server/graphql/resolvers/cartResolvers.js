import Cart from "../../models/Cart.js";

import { AuthError } from "./userResolvers";

const PRODUCT_POPULATE = {
	path: "items.product",
	populate: [{ path: "brand" }],
};

const cartResolvers = {
	Query: {
		getUserCart: async (_, { userId }, context) => {
			if (!context.user) throw AuthError();

			return await Cart.findOne({ user: userId }).populate(PRODUCT_POPULATE);
		},
	},

	Mutation: {
		addItemToCart: async (_, { userId, productId, quantity }, context) => {
			if (!context.user) throw AuthError();
			let cart = await Cart.findOne({ user: userId });
			if (!cart) cart = await Cart.create({ user: userId, items: [] });

			const existingItem = cart.items.find(
				(i) => i.product.toString() === productId,
			);
			if (existingItem) {
				existingItem.quantity += quantity;
			} else {
				cart.items.push({ product: productId, quantity });
			}

			await cart.save();
			return await cart.populate(PRODUCT_POPULATE);
		},

		removeItemFromCart: async (_, { userId, productId }, context) => {
			if (!context.user) throw AuthError();
			const cart = await Cart.findOne({ user: userId });
			if (!cart) throw new Error("Cart not found");
			cart.items = cart.items.filter((i) => i.product.toString() !== productId);
			await cart.save();
			return { success: true, message: "Item removed from cart" };
		},

		clearCart: async (_, { userId }, context) => {
			if (!context.user) throw AuthError();
			await Cart.findOneAndUpdate({ user: userId }, { items: [] });
			return { success: true, message: "Cart cleared" };
		},
	},
};

export default cartResolvers;
