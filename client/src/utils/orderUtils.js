export const PAYMENT_METHOD_OPTIONS = [
	{ value: "EFECTIVO", label: "Efectivo" },
	{ value: "SINPE", label: "SINPE" },
	{ value: "TARJETA", label: "Tarjeta" },
];

export const PURCHASE_MODE_OPTIONS = [
	{ value: "NORMAL", label: "Normal" },
	{ value: "INSTALLMENTS", label: "Cuotas" },
	{ value: "LAYAWAY", label: "Apartado" },
];

export const PURCHASE_MODE_META = {
	NORMAL: { label: "Normal", shortLabel: "Normal", badge: "neutral" },
	INSTALLMENTS: { label: "Pago a cuotas", shortLabel: "Cuotas", badge: "warning" },
	LAYAWAY: { label: "Apartado", shortLabel: "Apartado", badge: "info" },
};

export const ORDER_STATUS_META = {
	SOLICITADO_WS: {
		label: "Solicitado por WhatsApp",
		shortLabel: "Solicitado",
		badge: "info",
		description: "Tu solicitud fue recibida. El equipo confirmará pronto.",
	},
	EN_PROCESO: {
		label: "En proceso",
		shortLabel: "En proceso",
		badge: "warning",
		description: "Tu pedido está siendo preparado o gestionado.",
	},
	COMPLETADO: {
		label: "Completado",
		shortLabel: "Completado",
		badge: "success",
		description: "Tu pedido fue entregado con éxito.",
	},
	CANCELADO: {
		label: "Cancelado",
		shortLabel: "Cancelado",
		badge: "error",
		description: "Esta orden fue cancelada.",
	},
};

export const formatPrice = (price) =>
	`¢${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

export const formatDate = (value, options = {}) => {
	if (!value) return "—";

	const date = new Date(isNaN(Number(value)) ? value : Number(value));
	return date.toLocaleDateString("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		...options,
	});
};

export const getOrderDisplayTotal = (order) =>
	order?.finalPrice ?? order?.totalPrice ?? 0;

export const getPurchaseModeMeta = (purchaseMode) =>
	PURCHASE_MODE_META[purchaseMode] ?? {
		label: purchaseMode ?? "Normal",
		shortLabel: purchaseMode ?? "Normal",
		badge: "neutral",
	};

export const getOrderStatusMeta = (status) =>
	ORDER_STATUS_META[status] ?? {
		label: status ?? "Desconocido",
		shortLabel: status ?? "Desconocido",
		badge: "neutral",
		description: "",
	};

export const unwrapMutationResult = (result, fieldName) => {
	if (result?.error) {
		throw new Error(result.error.message);
	}

	if (result?.errors?.length) {
		throw new Error(result.errors.map((error) => error.message).join(" | "));
	}

	const payload = result?.data?.[fieldName];
	if (!payload) {
		throw new Error("La operación no devolvió datos.");
	}

	return payload;
};
