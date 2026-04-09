import mongoose from "mongoose";

const InstallmentSchema = new mongoose.Schema(
	{
		number: { type: Number, required: true },
		expectedAmount: { type: Number, required: true },
		paidAmount: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ["PENDING", "PARTIAL", "PAID"],
			default: "PENDING",
		},
		paymentMethod: { type: String, default: null },
		note: { type: String, default: "" },
	},
	{ _id: true },
);

const LayawayPaymentSchema = new mongoose.Schema(
	{
		amount: { type: Number, required: true },
		paymentMethod: { type: String, default: null },
		note: { type: String, default: "" },
	},
	{ _id: true, timestamps: true },
);

const OrderSchema = new mongoose.Schema(
	{
		orderNumber: {
			type: String,
			unique: true,
			required: true,
		},
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		store: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			default: null,
		},
		orderItems: [
			{
				productId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					default: null,
				},
				name: { type: String, required: true },
				quantity: { type: Number, required: true },
				price: { type: Number, required: true },
			},
		],
		totalPrice: { type: Number, required: true },
		status: { type: String, default: "SOLICITADO_WS" },
		confirmedAt: { type: Date, default: null },
		finalPrice: { type: Number, default: null },
		purchaseMode: {
			type: String,
			enum: ["NORMAL", "INSTALLMENTS", "LAYAWAY"],
			default: "NORMAL",
		},
		paymentMethod: { type: String, default: null },
		amountPaid: { type: Number, default: 0 },
		balanceDue: { type: Number, default: 0 },
		stockDiscounted: { type: Boolean, default: false },
		installmentCount: { type: Number, default: 0 },
		installments: [InstallmentSchema],
		layawayDays: { type: Number, default: null },
		layawayDeadline: { type: Date, default: null },
		layawayPickedUp: { type: Boolean, default: false },
		layawayPayments: [LayawayPaymentSchema],
	},
	{ timestamps: true },
);

OrderSchema.pre("validate", function generateOrderNumber() {
	if (!this.orderNumber) {
		const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
		this.orderNumber = `ORD-${Date.now()}-${randomSuffix}`;
	}
});

export default mongoose.model("Order", OrderSchema, "orders");
