import Store from "../../models/Store.js";
import StoreProduct from "../../models/StoreProduct.js";

export const PURCHASE_MODES = {
	NORMAL: "NORMAL",
	INSTALLMENTS: "INSTALLMENTS",
	LAYAWAY: "LAYAWAY",
};

const INSTALLMENT_STATUSES = {
	PENDING: "PENDING",
	PARTIAL: "PARTIAL",
	PAID: "PAID",
};

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const resolveOrderTotal = (order) =>
	roundMoney(order?.finalPrice ?? order?.totalPrice ?? 0);

const sumInstallmentPaid = (installments = []) =>
	roundMoney(
		installments.reduce(
			(total, installment) => total + (Number(installment.paidAmount) || 0),
			0,
		),
	);

const sumLayawayPayments = (payments = []) =>
	roundMoney(
		payments.reduce((total, payment) => total + (Number(payment.amount) || 0), 0),
	);

export const splitInstallments = (total, count) => {
	const safeCount = Math.max(1, Number(count) || 1);
	const totalCents = Math.round((Number(total) || 0) * 100);
	const baseAmount = Math.floor(totalCents / safeCount);
	const remainder = totalCents - baseAmount * safeCount;

	return Array.from({ length: safeCount }, (_, index) => ({
		number: index + 1,
		expectedAmount: (baseAmount + (index < remainder ? 1 : 0)) / 100,
		paidAmount: 0,
		status: INSTALLMENT_STATUSES.PENDING,
		paymentMethod: null,
		note: "",
	}));
};

const distributeInitialPayment = (installments, initialPayment, paymentMethod) => {
	let remaining = roundMoney(initialPayment);
	if (remaining <= 0) return installments;

	return installments.map((installment) => {
		if (remaining <= 0) return installment;

		const applicableAmount = Math.min(installment.expectedAmount, remaining);
		remaining = roundMoney(remaining - applicableAmount);

		return {
			...installment,
			paidAmount: applicableAmount,
			paymentMethod: applicableAmount > 0 ? paymentMethod ?? null : null,
			status:
				applicableAmount >= installment.expectedAmount
					? INSTALLMENT_STATUSES.PAID
					: INSTALLMENT_STATUSES.PARTIAL,
		};
	});
};

export const recalculateOrderState = (order) => {
	const total = resolveOrderTotal(order);

	if (order.purchaseMode === PURCHASE_MODES.INSTALLMENTS) {
		for (const installment of order.installments) {
			const expected = roundMoney(installment.expectedAmount);
			const paid = roundMoney(installment.paidAmount);

			installment.expectedAmount = expected;
			installment.paidAmount = paid;
			installment.status =
				paid <= 0
					? INSTALLMENT_STATUSES.PENDING
					: paid >= expected
						? INSTALLMENT_STATUSES.PAID
						: INSTALLMENT_STATUSES.PARTIAL;
		}

		order.installmentCount = order.installments.length;
		order.amountPaid = sumInstallmentPaid(order.installments);
		order.balanceDue = Math.max(roundMoney(total - order.amountPaid), 0);

		if (
			order.installments.length > 0 &&
			order.installments.every(
				(installment) => installment.status === INSTALLMENT_STATUSES.PAID,
			)
		) {
			order.status = "COMPLETADO";
			order.confirmedAt = order.confirmedAt ?? new Date();
		} else if (order.status !== "CANCELADO") {
			order.status = "EN_PROCESO";
			order.confirmedAt = null;
		}

		return order;
	}

	if (order.purchaseMode === PURCHASE_MODES.LAYAWAY) {
		order.amountPaid = sumLayawayPayments(order.layawayPayments);
		order.balanceDue = Math.max(roundMoney(total - order.amountPaid), 0);

		if (
			order.layawayPickedUp &&
			order.balanceDue <= 0 &&
			order.status !== "CANCELADO"
		) {
			order.status = "COMPLETADO";
			order.confirmedAt = order.confirmedAt ?? new Date();
		} else if (order.status !== "CANCELADO") {
			order.status = "EN_PROCESO";
			order.confirmedAt = null;
		}

		return order;
	}

	if (order.status === "COMPLETADO") {
		order.amountPaid = total;
		order.balanceDue = 0;
		order.confirmedAt = order.confirmedAt ?? new Date();
	} else if (order.status === "CANCELADO") {
		order.amountPaid = 0;
		order.balanceDue = total;
		order.confirmedAt = null;
	} else {
		order.amountPaid = 0;
		order.balanceDue = total;
		order.confirmedAt = null;
	}

	order.installmentCount = 0;
	order.installments = [];
	order.layawayDays = null;
	order.layawayDeadline = null;
	order.layawayPickedUp = false;
	order.layawayPayments = [];

	return order;
};

export const prepareInstallmentPlan = (
	order,
	installmentCount,
	initialPayment = 0,
	paymentMethod = null,
) => {
	const total = resolveOrderTotal(order);
	const installments = splitInstallments(total, installmentCount);
	order.installments = distributeInitialPayment(
		installments,
		initialPayment,
		paymentMethod,
	);
	order.purchaseMode = PURCHASE_MODES.INSTALLMENTS;
	order.paymentMethod = paymentMethod ?? order.paymentMethod;
	order.layawayDays = null;
	order.layawayDeadline = null;
	order.layawayPickedUp = false;
	order.layawayPayments = [];
	return recalculateOrderState(order);
};

export const prepareLayawayPlan = (
	order,
	layawayDays,
	initialPayment = 0,
	paymentMethod = null,
	note = "",
) => {
	order.purchaseMode = PURCHASE_MODES.LAYAWAY;
	order.paymentMethod = paymentMethod ?? order.paymentMethod;
	order.installmentCount = 0;
	order.installments = [];
	order.layawayDays = Math.max(1, Number(layawayDays) || 1);
	order.layawayDeadline = new Date(
		Date.now() + order.layawayDays * 24 * 60 * 60 * 1000,
	);
	order.layawayPickedUp = false;
	order.layawayPayments =
		initialPayment > 0
			? [
					{
						amount: roundMoney(initialPayment),
						paymentMethod: paymentMethod ?? null,
						note,
					},
				]
			: [];
	return recalculateOrderState(order);
};

export const ensureAdminOrderAccess = async (context, order) => {
	if (!context.user || context.user.role !== "ADMIN")
		throw new Error("Not authorized");

	const store = await Store.findOne({ owner: context.user._id });
	if (!store) throw new Error("Store not found");
	if (!order.store || order.store.toString() !== store._id.toString())
		throw new Error("Not authorized");

	return store;
};

export const ensureOrderAccess = async (context, order) => {
	if (!context.user) throw new Error("Not authenticated");

	if (context.user.role === "SUPER_ADMIN") return null;
	if (context.user.role === "ADMIN") {
		return ensureAdminOrderAccess(context, order);
	}

	if (order.user?.toString() !== context.user.id) {
		throw new Error("Not authorized");
	}

	return null;
};

const findStoreProductForItem = async (order, item) => {
	if (!order.store || !item.productId) return null;
	return StoreProduct.findOne({
		store: order.store,
		product: item.productId,
	});
};

export const ensureStockAvailable = async (order) => {
	for (const item of order.orderItems) {
		if (!item.productId) continue;

		const storeProduct = await findStoreProductForItem(order, item);
		if (!storeProduct)
			throw new Error(`No se encontró stock para "${item.name}" en la tienda.`);

		const availableStock = Number(storeProduct.stock ?? 0);
		if (availableStock < item.quantity) {
			throw new Error(`Stock insuficiente para "${item.name}".`);
		}
	}
};

const adjustStock = async (order, direction) => {
	for (const item of order.orderItems) {
		if (!item.productId) continue;
		await StoreProduct.updateOne(
			{ store: order.store, product: item.productId },
			{ $inc: { stock: direction * item.quantity } },
		);
	}
};

export const ensureStockDiscounted = async (order) => {
	if (order.stockDiscounted) return;
	await ensureStockAvailable(order);
	await adjustStock(order, -1);
	order.stockDiscounted = true;
};

export const restoreStockIfNeeded = async (order) => {
	if (!order.stockDiscounted) return;
	await adjustStock(order, 1);
	order.stockDiscounted = false;
};
