import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import {
	BsArrowLeft,
	BsBoxSeam,
	BsCheckCircle,
	BsClock,
	BsReceipt,
	BsWhatsapp,
	BsXCircle,
} from "react-icons/bs";

import {
	ADD_LAYAWAY_PAYMENT,
	CONFIGURE_ORDER_PURCHASE,
	SET_LAYAWAY_PICKED_UP,
	UPDATE_INSTALLMENT_PAYMENT,
	UPDATE_LAYAWAY_PAYMENT,
	UPDATE_ORDER_STATUS,
} from "../graphql/order/OrderMutations";
import {
	GET_ALL_ORDERS,
	GET_MY_ORDERS,
	GET_ORDER_BY_ID,
} from "../graphql/order/OrderQueries";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import { Spinner } from "../components/interface/LoadingUi";
import {
	formatDate,
	formatPrice,
	getOrderDisplayTotal,
	getOrderStatusMeta,
	getPurchaseModeMeta,
	PAYMENT_METHOD_OPTIONS,
	PURCHASE_MODE_OPTIONS,
	unwrapMutationResult,
} from "../utils/orderUtils";

const ORDER_STEP_INDEX = {
	SOLICITADO_WS: 0,
	EN_PROCESO: 1,
	COMPLETADO: 2,
	CANCELADO: -1,
};

const TIMELINE_STEPS = [
	{ key: "SOLICITADO_WS", label: "Solicitado" },
	{ key: "EN_PROCESO", label: "En proceso" },
	{ key: "COMPLETADO", label: "Completado" },
];

const buildRefetchQueries = (order) => {
	const queries = [{ query: GET_ALL_ORDERS }, { query: GET_ORDER_BY_ID, variables: { id: order?.id } }];

	if (order?.user) {
		queries.push({ query: GET_MY_ORDERS, variables: { userId: order.user } });
	}

	return queries;
};

const buildConfigState = (order) => ({
	purchaseMode: order.purchaseMode ?? "NORMAL",
	installmentCount: String(order.installmentCount || 3),
	layawayDays: String(order.layawayDays || 15),
	initialPayment: "",
	paymentMethod: order.paymentMethod || "EFECTIVO",
	note: "",
});

const buildInstallmentDrafts = (order) => {
	const nextInstallments = {};
	for (const installment of order.installments ?? []) {
		nextInstallments[installment.id] = {
			paidAmount: String(installment.paidAmount ?? 0),
			paymentMethod: installment.paymentMethod || order.paymentMethod || "EFECTIVO",
			note: installment.note || "",
		};
	}
	return nextInstallments;
};

const buildLayawayDrafts = (order) => {
	const nextLayawayPayments = {};
	for (const payment of order.layawayPayments ?? []) {
		nextLayawayPayments[payment.id] = {
			amount: String(payment.amount ?? 0),
			paymentMethod: payment.paymentMethod || order.paymentMethod || "EFECTIVO",
			note: payment.note || "",
		};
	}
	return nextLayawayPayments;
};

const StatusTimeline = ({ status }) => {
	const currentStep = ORDER_STEP_INDEX[status] ?? 0;

	if (status === "CANCELADO") {
		return (
			<div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-error/20 bg-error/5">
				<BsXCircle className="w-4 h-4 text-error shrink-0" />
				<p className="text-sm text-error/80">Esta orden fue cancelada.</p>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-0">
			{TIMELINE_STEPS.map((step, index) => {
				const isCompleted = index < currentStep;
				const isActive = index === currentStep;
				const isLast = index === TIMELINE_STEPS.length - 1;

				return (
					<div key={step.key} className="flex flex-col items-center flex-1">
						<div className="flex items-center w-full">
							{index > 0 && (
								<div
									className="flex-1 h-px"
									style={{
										background:
											isCompleted || isActive
												? "var(--color-second)"
												: "color-mix(in srgb, var(--color-first) 12%, transparent)",
									}}
								/>
							)}
							<div
								className={[
									"w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2",
									isActive
										? "border-second bg-second/10"
										: isCompleted
											? "border-second bg-second"
											: "border-first/15 bg-main",
								].join(" ")}
							>
								{isCompleted ? (
									<BsCheckCircle className="w-3.5 h-3.5 text-main" />
								) : (
									<span
										className="w-2.5 h-2.5 rounded-full"
										style={{
											background: isActive
												? "var(--color-second)"
												: "color-mix(in srgb, var(--color-first) 15%, transparent)",
										}}
									/>
								)}
							</div>
							{!isLast && (
								<div
									className="flex-1 h-px"
									style={{
										background: isCompleted
											? "var(--color-second)"
											: "color-mix(in srgb, var(--color-first) 12%, transparent)",
									}}
								/>
							)}
						</div>
						<p
							className={[
								"mt-2 text-[11px] font-medium text-center",
								isActive
									? "text-second"
									: isCompleted
										? "text-first/60"
										: "text-first/25",
							].join(" ")}
						>
							{step.label}
						</p>
					</div>
				);
			})}
		</div>
	);
};

const OrderItemRow = ({ item }) => (
	<div className="flex items-center justify-between gap-4 py-3.5 border-b border-first/6 last:border-0">
		<div className="flex items-center gap-3 min-w-0">
			<span
				className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
				style={{
					background: "color-mix(in srgb, var(--color-second) 12%, transparent)",
					color: "var(--color-second)",
					border: "1px solid color-mix(in srgb, var(--color-second) 25%, transparent)",
				}}
			>
				{item.quantity}
			</span>
			<span className="text-sm font-medium text-first truncate">{item.name}</span>
		</div>

		<div className="flex flex-col items-end gap-0.5 shrink-0">
			<span className="text-sm font-semibold text-first tabular-nums">
				{formatPrice(item.price * item.quantity)}
			</span>
			{item.quantity > 1 && (
				<span className="text-[11px] text-first/35 tabular-nums">
					{formatPrice(item.price)} c/u
				</span>
			)}
		</div>
	</div>
);

const PurchaseManager = ({ order, refreshQueries }) => {
	const toast = useToast();
	const orderTotal = getOrderDisplayTotal(order);
	const isNormalOrder = order.purchaseMode === "NORMAL";

	const [config, setConfig] = useState(() => buildConfigState(order));
	const [layawayPaymentForm, setLayawayPaymentForm] = useState(() => ({
		amount: "",
		paymentMethod: order.paymentMethod || "EFECTIVO",
		note: "",
	}));
	const [installmentDrafts, setInstallmentDrafts] = useState(() =>
		buildInstallmentDrafts(order),
	);
	const [layawayDrafts, setLayawayDrafts] = useState(() =>
		buildLayawayDrafts(order),
	);

	const mutationOptions = {
		refetchQueries: refreshQueries,
		awaitRefetchQueries: true,
		errorPolicy: "none",
	};

	const [configureOrderPurchase, { loading: configuring }] = useMutation(
		CONFIGURE_ORDER_PURCHASE,
		mutationOptions,
	);
	const [updateOrderStatus, { loading: updatingStatus }] = useMutation(
		UPDATE_ORDER_STATUS,
		mutationOptions,
	);
	const [updateInstallmentPayment, { loading: savingInstallment }] = useMutation(
		UPDATE_INSTALLMENT_PAYMENT,
		mutationOptions,
	);
	const [addLayawayPayment, { loading: addingLayawayPayment }] = useMutation(
		ADD_LAYAWAY_PAYMENT,
		mutationOptions,
	);
	const [updateLayawayPayment, { loading: updatingLayawayPayment }] = useMutation(
		UPDATE_LAYAWAY_PAYMENT,
		mutationOptions,
	);
	const [setLayawayPickedUp, { loading: togglingPickup }] = useMutation(
		SET_LAYAWAY_PICKED_UP,
		mutationOptions,
	);

	const handleConfigure = async () => {
		try {
			const response = await configureOrderPurchase({
				variables: {
					id: order.id,
					purchaseMode: config.purchaseMode,
					installmentCount:
						config.purchaseMode === "INSTALLMENTS"
							? Number(config.installmentCount)
							: undefined,
					layawayDays:
						config.purchaseMode === "LAYAWAY"
							? Number(config.layawayDays)
							: undefined,
					initialPayment:
						config.initialPayment === "" ? undefined : Number(config.initialPayment),
					paymentMethod: config.paymentMethod,
					note: config.note || undefined,
				},
			});
			const configuredOrder = unwrapMutationResult(
				response,
				"configureOrderPurchase",
			);
			const resolvedMode = configuredOrder.purchaseMode;
			if (resolvedMode !== config.purchaseMode) {
				throw new Error("La modalidad no se actualizó correctamente.");
			}
			setConfig((current) => ({ ...current, initialPayment: "", note: "" }));
			toast.success("Modalidad actualizada");
		} catch (error) {
			toast.error("No se pudo actualizar la modalidad", {
				description: error.message,
			});
		}
	};

	const handleStatusChange = async (status) => {
		try {
			const response = await updateOrderStatus({
				variables: {
					id: order.id,
					status,
					finalPrice: order.finalPrice ?? order.totalPrice,
				},
			});
			unwrapMutationResult(response, "updateOrderStatus");
			toast.success("Orden actualizada");
		} catch (error) {
			toast.error("No se pudo actualizar la orden", {
				description: error.message,
			});
		}
	};

	const handleInstallmentSave = async (installmentId) => {
		const draft = installmentDrafts[installmentId];
		try {
			const response = await updateInstallmentPayment({
				variables: {
					id: order.id,
					installmentId,
					paidAmount: Number(draft.paidAmount || 0),
					paymentMethod: draft.paymentMethod,
					note: draft.note || undefined,
				},
			});
			unwrapMutationResult(response, "updateInstallmentPayment");
			toast.success("Cuota actualizada");
		} catch (error) {
			toast.error("No se pudo actualizar la cuota", {
				description: error.message,
			});
		}
	};

	const handleAddLayawayPayment = async () => {
		try {
			const response = await addLayawayPayment({
				variables: {
					id: order.id,
					amount: Number(layawayPaymentForm.amount || 0),
					paymentMethod: layawayPaymentForm.paymentMethod,
					note: layawayPaymentForm.note || undefined,
				},
			});
			unwrapMutationResult(response, "addLayawayPayment");
			setLayawayPaymentForm((current) => ({ ...current, amount: "", note: "" }));
			toast.success("Pago registrado");
		} catch (error) {
			toast.error("No se pudo registrar el pago", {
				description: error.message,
			});
		}
	};

	const handleUpdateLayawayPayment = async (paymentId) => {
		const draft = layawayDrafts[paymentId];
		try {
			const response = await updateLayawayPayment({
				variables: {
					id: order.id,
					paymentId,
					amount: Number(draft.amount || 0),
					paymentMethod: draft.paymentMethod,
					note: draft.note || undefined,
				},
			});
			unwrapMutationResult(response, "updateLayawayPayment");
			toast.success("Pago actualizado");
		} catch (error) {
			toast.error("No se pudo actualizar el pago", {
				description: error.message,
			});
		}
	};

	return (
		<div className="flex flex-col gap-6 rounded-2xl border border-first/10 bg-main p-6">
			<div className="flex flex-col gap-1">
				<h2 className="text-lg font-semibold text-first">Gestión interna</h2>
				<p className="text-sm text-first/45">
					Solo el admin de la tienda puede configurar cuotas, apartado y registrar pagos.
				</p>
			</div>

			{isNormalOrder && order.status !== "COMPLETADO" && order.status !== "CANCELADO" && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-first/8 p-4">
					<Select
						label="Modalidad"
						value={config.purchaseMode}
						onChange={(event) =>
							setConfig((current) => ({
								...current,
								purchaseMode: event.target.value,
							}))
						}
						options={PURCHASE_MODE_OPTIONS}
					/>
					<Select
						label="Método de pago"
						value={config.paymentMethod}
						onChange={(event) =>
							setConfig((current) => ({
								...current,
								paymentMethod: event.target.value,
							}))
						}
						options={PAYMENT_METHOD_OPTIONS}
					/>

					{config.purchaseMode === "INSTALLMENTS" && (
						<Input
							label="Cantidad de cuotas"
							type="number"
							min="1"
							value={config.installmentCount}
							onChange={(event) =>
								setConfig((current) => ({
									...current,
									installmentCount: event.target.value,
								}))
							}
						/>
					)}

					{config.purchaseMode === "LAYAWAY" && (
						<Input
							label="Tiempo máximo (días)"
							type="number"
							min="1"
							value={config.layawayDays}
							onChange={(event) =>
								setConfig((current) => ({
									...current,
									layawayDays: event.target.value,
								}))
							}
						/>
					)}

					{config.purchaseMode !== "NORMAL" && (
						<>
							<Input
								label="Pago inicial opcional"
								type="number"
								min="0"
								max={orderTotal}
								value={config.initialPayment}
								onChange={(event) =>
									setConfig((current) => ({
										...current,
										initialPayment: event.target.value,
									}))
								}
								placeholder="0"
							/>
							<Input
								label="Nota opcional"
								value={config.note}
								onChange={(event) =>
									setConfig((current) => ({
										...current,
										note: event.target.value,
									}))
								}
								placeholder="Detalle interno"
							/>
						</>
					)}

					<div className="md:col-span-2 flex justify-end">
						<Button loading={configuring} onClick={handleConfigure}>
							Aplicar modalidad
						</Button>
					</div>
				</div>
			)}

			{order.purchaseMode === "NORMAL" && (
				<div className="flex flex-wrap gap-2">
					{order.status !== "EN_PROCESO" && order.status !== "COMPLETADO" && (
						<Button
							variant="outline"
							size="sm"
							loading={updatingStatus}
							onClick={() => handleStatusChange("EN_PROCESO")}
						>
							Marcar en proceso
						</Button>
					)}
					{order.status !== "COMPLETADO" && (
						<Button
							size="sm"
							loading={updatingStatus}
							onClick={() => handleStatusChange("COMPLETADO")}
						>
							Completar orden
						</Button>
					)}
					{order.status !== "CANCELADO" && (
						<Button
							variant="outline"
							size="sm"
							loading={updatingStatus}
							onClick={() => handleStatusChange("CANCELADO")}
						>
							Cancelar orden
						</Button>
					)}
				</div>
			)}

			{order.purchaseMode === "INSTALLMENTS" && (
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm font-medium text-first">
							Cuotas configuradas: {order.installmentCount}
						</p>
						{order.status !== "CANCELADO" && (
							<Button
								variant="outline"
								size="sm"
								loading={updatingStatus}
								onClick={() => handleStatusChange("CANCELADO")}
							>
								Cancelar orden
							</Button>
						)}
					</div>

					<div className="flex flex-col gap-3">
						{order.installments.map((installment) => {
							const draft = installmentDrafts[installment.id] ?? {
								paidAmount: String(installment.paidAmount ?? 0),
								paymentMethod: installment.paymentMethod || "EFECTIVO",
								note: installment.note || "",
							};

							return (
								<div
									key={installment.id}
									className="grid grid-cols-1 md:grid-cols-[auto_1fr_180px_180px_auto] gap-3 items-end rounded-2xl border border-first/8 p-4"
								>
									<div>
										<p className="text-xs uppercase tracking-wider text-first/35">
											Cuota {installment.number}
										</p>
										<p className="text-sm font-semibold text-first">
											{formatPrice(installment.expectedAmount)}
										</p>
										<p className="text-xs text-first/40">
											Saldo {formatPrice(installment.remainingAmount)}
										</p>
									</div>

									<Input
										label="Pagado"
										type="number"
										min="0"
										value={draft.paidAmount}
										onChange={(event) =>
											setInstallmentDrafts((current) => ({
												...current,
												[installment.id]: {
													...draft,
													paidAmount: event.target.value,
												},
											}))
										}
									/>
									<Select
										label="Método"
										value={draft.paymentMethod}
										onChange={(event) =>
											setInstallmentDrafts((current) => ({
												...current,
												[installment.id]: {
													...draft,
													paymentMethod: event.target.value,
												},
											}))
										}
										options={PAYMENT_METHOD_OPTIONS}
									/>
									<Input
										label="Nota"
										value={draft.note}
										onChange={(event) =>
											setInstallmentDrafts((current) => ({
												...current,
												[installment.id]: {
													...draft,
													note: event.target.value,
												},
											}))
										}
										placeholder="Opcional"
									/>
									<div className="flex flex-col items-end gap-2">
										<Badge
											variant={
												installment.status === "PAID"
													? "success"
													: installment.status === "PARTIAL"
														? "warning"
														: "neutral"
											}
											size="sm"
										>
											{installment.status === "PAID"
												? "Pagada"
												: installment.status === "PARTIAL"
													? "Parcial"
													: "Pendiente"}
										</Badge>
										<Button
											size="sm"
											loading={savingInstallment}
											onClick={() => handleInstallmentSave(installment.id)}
										>
											Guardar
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{order.purchaseMode === "LAYAWAY" && (
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-sm font-medium text-first">
								Vence el {formatDate(order.layawayDeadline)}
							</p>
							<p className="text-xs text-first/40">
								Retiro: {order.layawayPickedUp ? "realizado" : "pendiente"}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								loading={togglingPickup}
								onClick={async () => {
									try {
										const response = await setLayawayPickedUp({
										variables: {
											id: order.id,
											pickedUp: !order.layawayPickedUp,
										},
									});
										unwrapMutationResult(response, "setLayawayPickedUp");
										toast.success(
											order.layawayPickedUp
												? "Retiro marcado como pendiente"
												: "Retiro marcado como realizado",
										);
									} catch (error) {
										toast.error("No se pudo actualizar el retiro", {
											description: error.message,
										});
									}
								}}
							>
								{order.layawayPickedUp ? "Desmarcar retiro" : "Marcar retirado"}
							</Button>
							{order.status !== "CANCELADO" && (
								<Button
									variant="outline"
									size="sm"
									loading={updatingStatus}
									onClick={() => handleStatusChange("CANCELADO")}
								>
									Cancelar orden
								</Button>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-[1fr_180px_1fr_auto] gap-3 items-end rounded-2xl border border-first/8 p-4">
						<Input
							label="Nuevo pago"
							type="number"
							min="0"
							value={layawayPaymentForm.amount}
							onChange={(event) =>
								setLayawayPaymentForm((current) => ({
									...current,
									amount: event.target.value,
								}))
							}
							placeholder="0"
						/>
						<Select
							label="Método"
							value={layawayPaymentForm.paymentMethod}
							onChange={(event) =>
								setLayawayPaymentForm((current) => ({
									...current,
									paymentMethod: event.target.value,
								}))
							}
							options={PAYMENT_METHOD_OPTIONS}
						/>
						<Input
							label="Nota"
							value={layawayPaymentForm.note}
							onChange={(event) =>
								setLayawayPaymentForm((current) => ({
									...current,
									note: event.target.value,
								}))
							}
							placeholder="Opcional"
						/>
						<Button loading={addingLayawayPayment} onClick={handleAddLayawayPayment}>
							Registrar pago
						</Button>
					</div>

					<div className="flex flex-col gap-3">
						{order.layawayPayments.map((payment) => {
							const draft = layawayDrafts[payment.id] ?? {
								amount: String(payment.amount ?? 0),
								paymentMethod: payment.paymentMethod || "EFECTIVO",
								note: payment.note || "",
							};

							return (
								<div
									key={payment.id}
									className="grid grid-cols-1 md:grid-cols-[160px_180px_1fr_auto] gap-3 items-end rounded-2xl border border-first/8 p-4"
								>
									<Input
										label={`Pago ${formatDate(payment.createdAt)}`}
										type="number"
										min="0"
										value={draft.amount}
										onChange={(event) =>
											setLayawayDrafts((current) => ({
												...current,
												[payment.id]: {
													...draft,
													amount: event.target.value,
												},
											}))
										}
									/>
									<Select
										label="Método"
										value={draft.paymentMethod}
										onChange={(event) =>
											setLayawayDrafts((current) => ({
												...current,
												[payment.id]: {
													...draft,
													paymentMethod: event.target.value,
												},
											}))
										}
										options={PAYMENT_METHOD_OPTIONS}
									/>
									<Input
										label="Nota"
										value={draft.note}
										onChange={(event) =>
											setLayawayDrafts((current) => ({
												...current,
												[payment.id]: {
													...draft,
													note: event.target.value,
												},
											}))
										}
									/>
									<Button
										size="sm"
										loading={updatingLayawayPayment}
										onClick={() => handleUpdateLayawayPayment(payment.id)}
									>
										Guardar
									</Button>
								</div>
							);
						})}

						{order.layawayPayments.length === 0 && (
							<p className="text-sm text-first/35 italic">
								Aún no hay pagos registrados para este apartado.
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const OrderView = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
	const isStoreAdmin = user?.role === "ADMIN";

	const { data, loading, error } = useQuery(GET_ORDER_BY_ID, {
		variables: { id },
		skip: !id,
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
	});

	const order = data?.getOrderById;

	if (loading) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center">
				<Spinner size="xl" />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
				<BsXCircle className="w-12 h-12 text-error/40" />
				<p className="text-first/40 text-sm text-center">
					{error ? "Error al cargar la orden." : "Orden no encontrada."}
				</p>
				<Button variant="outline" size="sm" onClick={() => navigate("/store/orders")}>
					Ver órdenes
				</Button>
			</div>
		);
	}

	const statusInfo = getOrderStatusMeta(order.status);
	const purchaseInfo = getPurchaseModeMeta(order.purchaseMode);
	const orderTotal = getOrderDisplayTotal(order);
	const refreshQueries = buildRefetchQueries(order);
	const totalItemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);

	const handleWhatsApp = () => {
		const message = encodeURIComponent(
			`Hola, quiero consultar sobre mi orden *#${order.id.slice(-8).toUpperCase()}*.\n\nTotal: ${formatPrice(orderTotal)}\nPagado: ${formatPrice(order.amountPaid)}\nSaldo: ${formatPrice(order.balanceDue)}\nEstado: ${statusInfo.label}`,
		);
		window.open(`https://wa.me/?text=${message}`, "_blank");
	};

	return (
		<div className="min-h-screen px-4 py-10 md:px-8 lg:px-12">
			<div className="max-w-4xl mx-auto flex flex-col gap-8">
				<button
					onClick={() => navigate(isAdmin ? -1 : "/store/orders")}
					className="flex items-center gap-1.5 text-sm text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
				>
					<BsArrowLeft className="w-3.5 h-3.5" />
					{isAdmin ? "Volver" : "Mis órdenes"}
				</button>

				<div className="rounded-2xl border border-first/10 bg-main p-6 flex flex-col gap-5">
					<div className="flex items-start justify-between gap-4 flex-wrap">
						<div className="flex flex-col gap-1">
							<p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-first/30">
								Orden
							</p>
							<p
								className="text-2xl font-bold text-first font-mono tracking-wider break-all"
								style={{ fontFamily: "'Cinzel', serif" }}
							>
								#{order.id.slice(-8).toUpperCase()}
							</p>
							<p className="text-xs text-first/35 mt-0.5 capitalize">
								{formatDate(order.createdAt, {
									weekday: "long",
									day: "2-digit",
									month: "long",
									year: "numeric",
								})}
							</p>
						</div>

						<div className="flex flex-col items-end gap-2">
							<div className="flex flex-wrap gap-2 justify-end">
								<Badge variant={statusInfo.badge} size="lg" dot>
									{statusInfo.label}
								</Badge>
								<Badge variant={purchaseInfo.badge} size="lg">
									{purchaseInfo.label}
								</Badge>
							</div>
							<p className="text-xs text-first/40 text-right max-w-60 leading-snug">
								{statusInfo.description}
							</p>
						</div>
					</div>

					<div
						className="h-px"
						style={{
							background: "linear-gradient(to right, var(--color-second), transparent)",
							opacity: 0.3,
						}}
					/>

					<StatusTimeline status={order.status} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="rounded-2xl border border-first/10 bg-main p-5">
						<p className="text-xs uppercase tracking-wider text-first/35">Total real</p>
						<p className="text-2xl font-bold text-first mt-2">{formatPrice(orderTotal)}</p>
					</div>
					<div className="rounded-2xl border border-first/10 bg-main p-5">
						<p className="text-xs uppercase tracking-wider text-first/35">Pagado</p>
						<p className="text-2xl font-bold text-first mt-2">
							{formatPrice(order.amountPaid)}
						</p>
					</div>
					<div className="rounded-2xl border border-first/10 bg-main p-5">
						<p className="text-xs uppercase tracking-wider text-first/35">Saldo</p>
						<p className="text-2xl font-bold text-first mt-2">
							{formatPrice(order.balanceDue)}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<BsReceipt className="w-4 h-4 text-second/60" />
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-first/35">
							Productos — {totalItemCount} {totalItemCount === 1 ? "artículo" : "artículos"}
						</p>
						<div className="flex-1 h-px bg-first/6" />
					</div>

					<div className="rounded-2xl border border-first/8 bg-main px-4 overflow-hidden">
						{order.orderItems.map((item, index) => (
							<OrderItemRow key={`${item.name}-${index}`} item={item} />
						))}
					</div>
				</div>

				{isStoreAdmin && (
					<PurchaseManager
						key={JSON.stringify({
							id: order.id,
							status: order.status,
							purchaseMode: order.purchaseMode,
							amountPaid: order.amountPaid,
							balanceDue: order.balanceDue,
							layawayPickedUp: order.layawayPickedUp,
							installments: order.installments.map((installment) => ({
								id: installment.id,
								paidAmount: installment.paidAmount,
								status: installment.status,
							})),
							layawayPayments: order.layawayPayments.map((payment) => ({
								id: payment.id,
								amount: payment.amount,
								updatedAt: payment.updatedAt,
							})),
						})}
						order={order}
						refreshQueries={refreshQueries}
					/>
				)}

				{!isAdmin && (
					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							fullWidth
							variant="outline"
							size="md"
							icon={<BsWhatsapp />}
							onClick={handleWhatsApp}
							className="hover:text-[#25D366]! hover:border-[#25D366]/40!"
						>
							Consultar por WhatsApp
						</Button>
						<Button fullWidth variant="ghost" size="md" onClick={() => navigate("/")}>
							Seguir comprando
						</Button>
					</div>
				)}

				{isAdmin && !isStoreAdmin && (
					<div className="rounded-2xl border border-first/10 bg-main p-5 flex items-start gap-3">
						<BsClock className="w-5 h-5 text-first/35 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-first">Vista de solo lectura</p>
							<p className="text-sm text-first/45">
								La configuración de cuotas y apartado está reservada para el admin dueño de la tienda.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default OrderView;
