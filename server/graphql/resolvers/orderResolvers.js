import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";

const orderResolvers = {
	Query: {
		getMyOrders: async (_, { userId }, context) => {
			if (!context.user) throw new Error("Not authenticated");
			if (
				context.user.id !== userId &&
				!["ADMIN", "SUPERADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");
			return await Order.find({ user: userId }).sort({ createdAt: -1 });
		},

		getOrderById: async (_, { id }, context) => {
			if (!context.user) throw new Error("Not authenticated");
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");
			if (
				order.user.toString() !== context.user.id &&
				!["ADMIN", "SUPERADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");
			return order;
		},
	},

	Mutation: {
		createOrder: async (_, { userId, totalPrice, items }, context) => {
			if (!context.user) throw new Error("Not authenticated");

			const parsedItems = items.map((item) => JSON.parse(item));

			const order = await Order.create({
				user: userId,
				orderItems: parsedItems,
				totalPrice,
				status: "SOLICITADO_WS",
			});

			await Cart.findOneAndUpdate({ user: userId }, { items: [] });

			return order;
		},
	},
};

export default orderResolvers;
