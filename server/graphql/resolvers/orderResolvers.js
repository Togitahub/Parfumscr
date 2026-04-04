import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Store from "../../models/Store.js";
import StoreProduct from "../../models/StoreProduct.js";

const orderResolvers = {
	Query: {
		getMyOrders: async (_, { userId }, context) => {
			if (!context.user) throw new Error("Not authenticated");
			if (
				context.user.id !== userId &&
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");
			return await Order.find({ user: userId }).sort({ createdAt: -1 });
		},

		getOrderById: async (_, { id }, context) => {
			if (!context.user) throw new Error("Not authenticated");
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");
			if (
				order.user?.toString() !== context.user.id &&
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");
			return order;
		},

		getAllOrders: async (_, __, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");

			if (context.user.role === "SUPER_ADMIN") {
				return await Order.find().sort({ createdAt: -1 });
			}

			// ADMIN: solo órdenes de su tienda
			const store = await Store.findOne({ owner: context.user._id });
			if (!store) return [];
			return await Order.find({ store: store._id }).sort({ createdAt: -1 });
		},
	},

	Mutation: {
		createOrder: async (_, { userId, storeId, totalPrice, items }, context) => {
			const parsedItems = items.map((item) => JSON.parse(item));

			const order = await Order.create({
				user: userId ?? null,
				store: storeId ?? null,
				orderItems: parsedItems,
				totalPrice,
				status: "SOLICITADO_WS",
			});

			if (userId) {
				await Cart.findOneAndUpdate({ user: userId }, { items: [] });
			}

			return order;
		},

		updateOrderStatus: async (_, { id, status, finalPrice }, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");

			const update = { status };
			if (status === "COMPLETADO") {
				update.confirmedAt = new Date();
				if (finalPrice !== undefined && finalPrice !== null) {
					update.finalPrice = finalPrice;
				}

				const order = await Order.findById(id);
				if (order && order.status !== "COMPLETADO") {
					for (const item of order.orderItems) {
						if (!item.productId) continue;
						await StoreProduct.updateOne(
							{ store: order.store, product: item.productId },
							{ $inc: { stock: -item.quantity } },
						);
					}
				}
			}

			return await Order.findByIdAndUpdate(id, update, { new: true });
		},

		deleteOrder: async (_, { id }, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");

			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await Order.findByIdAndDelete(id);
			return { success: true, message: "Order deleted" };
		},
	},
};

export default orderResolvers;
