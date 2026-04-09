import mongoose from "mongoose";

import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Store from "../../models/Store.js";
import {
	ensureAdminOrderAccess,
	ensureOrderAccess,
	ensureStockDiscounted,
	prepareInstallmentPlan,
	prepareLayawayPlan,
	PURCHASE_MODES,
	recalculateOrderState,
	restoreStockIfNeeded,
	resolveOrderTotal,
} from "./orderHelpers.js";

const getManagedStore = async (context) => {
	if (!context.user || !["ADMIN", "SUPER_ADMIN"].includes(context.user.role)) {
		throw new Error("Not authorized");
	}

	if (context.user.role === "SUPER_ADMIN") return null;
	return Store.findOne({ owner: context.user._id });
};

const normalizeFinalPrice = (value) =>
	value === undefined || value === null ? null : Number(value);

const canRestoreStockOnCancellation = (order) =>
	order.purchaseMode !== PURCHASE_MODES.INSTALLMENTS;

const orderResolvers = {
	Installment: {
		remainingAmount: (installment) =>
			Math.max(
				(installment.expectedAmount ?? 0) - (installment.paidAmount ?? 0),
				0,
			),
	},

	Query: {
		getMyOrders: async (_, { userId }, context) => {
			if (!context.user) throw new Error("Not authenticated");
			if (
				context.user.id !== userId &&
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			) {
				throw new Error("Not authorized");
			}

			return Order.find({ user: userId }).sort({ createdAt: -1 });
		},

		getOrderById: async (_, { id }, context) => {
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");
			await ensureOrderAccess(context, order);
			return order;
		},

		getAllOrders: async (_, __, context) => {
			const store = await getManagedStore(context);

			if (context.user.role === "SUPER_ADMIN") {
				return Order.find().sort({ createdAt: -1 });
			}

			if (!store) return [];
			return Order.find({ store: store._id }).sort({ createdAt: -1 });
		},
	},

	Mutation: {
		createOrder: async (_, { userId, storeId, totalPrice, items }) => {
			const parsedItems = items.map((item) => JSON.parse(item));

			const order = new Order({
				user: userId ?? null,
				store: storeId ?? null,
				orderItems: parsedItems,
				totalPrice,
				status: "SOLICITADO_WS",
				balanceDue: totalPrice,
			});

			recalculateOrderState(order);
			await order.save();

			if (userId) {
				await Cart.findOneAndUpdate({ user: userId }, { items: [] });
			}

			return order;
		},

		updateOrderStatus: async (_, { id, status, finalPrice }, context) => {
			if (!context.user || !["ADMIN", "SUPER_ADMIN"].includes(context.user.role)) {
				throw new Error("Not authorized");
			}

			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureOrderAccess(context, order);

			if (finalPrice !== undefined) {
				order.finalPrice = normalizeFinalPrice(finalPrice);
			}

			if (
				status === "COMPLETADO" &&
				order.purchaseMode === PURCHASE_MODES.INSTALLMENTS
			) {
				throw new Error("Las órdenes a cuotas se completan automáticamente.");
			}

			if (status === "COMPLETADO") {
				if (order.purchaseMode === PURCHASE_MODES.LAYAWAY) {
					recalculateOrderState(order);
					if (order.balanceDue > 0 || !order.layawayPickedUp) {
						throw new Error(
							"El apartado solo se completa cuando está pagado y retirado.",
						);
					}
				}

				await ensureStockDiscounted(order);
				order.status = "COMPLETADO";
				order.confirmedAt = new Date();

				if (order.purchaseMode === PURCHASE_MODES.NORMAL) {
					order.amountPaid = resolveOrderTotal(order);
					order.balanceDue = 0;
				}
			}

			if (status === "CANCELADO") {
				if (canRestoreStockOnCancellation(order)) {
					await restoreStockIfNeeded(order);
				}
				order.status = "CANCELADO";
				order.confirmedAt = null;
			}

			if (status === "EN_PROCESO" || status === "SOLICITADO_WS") {
				if (order.purchaseMode !== PURCHASE_MODES.NORMAL) {
					throw new Error(
						"Las órdenes a cuotas o apartado cambian de estado automáticamente.",
					);
				}

				if (status === "SOLICITADO_WS") {
					await restoreStockIfNeeded(order);
				}

				order.status = status;
				recalculateOrderState(order);
			}

			await order.save();
			return order;
		},

		configureOrderPurchase: async (
			_,
			{
				id,
				purchaseMode,
				installmentCount,
				layawayDays,
				initialPayment,
				paymentMethod,
				note,
			},
			context,
		) => {
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureAdminOrderAccess(context, order);

			if (order.status === "CANCELADO") {
				throw new Error("No puedes configurar una orden cancelada.");
			}

			if (purchaseMode === PURCHASE_MODES.NORMAL) {
				order.purchaseMode = PURCHASE_MODES.NORMAL;
				order.paymentMethod = paymentMethod ?? order.paymentMethod;
				recalculateOrderState(order);
			} else if (purchaseMode === PURCHASE_MODES.INSTALLMENTS) {
				if (!installmentCount || installmentCount < 1) {
					throw new Error("Debes indicar la cantidad de cuotas.");
				}

				prepareInstallmentPlan(
					order,
					installmentCount,
					Number(initialPayment) || 0,
					paymentMethod ?? null,
				);
				await ensureStockDiscounted(order);
			} else if (purchaseMode === PURCHASE_MODES.LAYAWAY) {
				if (!layawayDays || layawayDays < 1) {
					throw new Error("Debes indicar el tiempo máximo del apartado.");
				}

				prepareLayawayPlan(
					order,
					layawayDays,
					Number(initialPayment) || 0,
					paymentMethod ?? null,
					note ?? "",
				);
				await ensureStockDiscounted(order);
			} else {
				throw new Error("Modo de compra inválido.");
			}

			await order.save();
			return order;
		},

		updateInstallmentPayment: async (
			_,
			{ id, installmentId, paidAmount, paymentMethod, note },
			context,
		) => {
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureAdminOrderAccess(context, order);

			if (order.purchaseMode !== PURCHASE_MODES.INSTALLMENTS) {
				throw new Error("La orden no está configurada a cuotas.");
			}

			const installment = order.installments.id(
				new mongoose.Types.ObjectId(installmentId),
			);
			if (!installment) throw new Error("Cuota no encontrada.");

			installment.paidAmount = Number(paidAmount) || 0;
			if (paymentMethod !== undefined) installment.paymentMethod = paymentMethod;
			if (note !== undefined) installment.note = note;

			recalculateOrderState(order);
			await order.save();
			return order;
		},

		addLayawayPayment: async (
			_,
			{ id, amount, paymentMethod, note },
			context,
		) => {
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureAdminOrderAccess(context, order);

			if (order.purchaseMode !== PURCHASE_MODES.LAYAWAY) {
				throw new Error("La orden no está configurada como apartado.");
			}

			if (Number(amount) <= 0) {
				throw new Error("El pago debe ser mayor que cero.");
			}

			order.layawayPayments.push({
				amount: Number(amount),
				paymentMethod: paymentMethod ?? null,
				note: note ?? "",
			});

			recalculateOrderState(order);
			await order.save();
			return order;
		},

		updateLayawayPayment: async (
			_,
			{ id, paymentId, amount, paymentMethod, note },
			context,
		) => {
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureAdminOrderAccess(context, order);

			if (order.purchaseMode !== PURCHASE_MODES.LAYAWAY) {
				throw new Error("La orden no está configurada como apartado.");
			}

			const payment = order.layawayPayments.id(
				new mongoose.Types.ObjectId(paymentId),
			);
			if (!payment) throw new Error("Pago no encontrado.");

			payment.amount = Number(amount) || 0;
			if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
			if (note !== undefined) payment.note = note;

			recalculateOrderState(order);
			await order.save();
			return order;
		},

		setLayawayPickedUp: async (_, { id, pickedUp }, context) => {
			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureAdminOrderAccess(context, order);

			if (order.purchaseMode !== PURCHASE_MODES.LAYAWAY) {
				throw new Error("La orden no está configurada como apartado.");
			}

			order.layawayPickedUp = pickedUp;
			recalculateOrderState(order);
			await order.save();
			return order;
		},

		deleteOrder: async (_, { id }, context) => {
			if (!context.user || !["ADMIN", "SUPER_ADMIN"].includes(context.user.role)) {
				throw new Error("Not authorized");
			}

			const order = await Order.findById(id);
			if (!order) throw new Error("Order not found");

			await ensureOrderAccess(context, order);

			if (canRestoreStockOnCancellation(order)) {
				await restoreStockIfNeeded(order);
			}

			await Order.findByIdAndDelete(id);
			return { success: true, message: "Order deleted" };
		},
	},
};

export default orderResolvers;
