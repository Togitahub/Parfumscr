// ── React ────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

// ── Icons ────────────────────────────────────────────────────────────

import {
	BsCash,
	BsCheckCircle,
	BsCreditCard,
	BsDash,
	BsPhone,
	BsPlus,
	BsSearch,
	BsTrash,
	BsX,
} from "react-icons/bs";

// ── GraphQl ────────────────────────────────────────────────────────────

import {
	CONFIGURE_ORDER_PURCHASE,
	CREATE_ORDER,
	UPDATE_ORDER_STATUS,
} from "../graphql/order/OrderMutations";

import {
	GET_DASHBOARD_STATS,
	GET_STORE_PRODUCTS,
} from "../graphql/store/StoreQueries";

import { GET_ALL_ORDERS } from "../graphql/order/OrderQueries";

// ── Context ────────────────────────────────────────────────────────────

import { useToast } from "../hooks/ToastContext";
import { useFilters } from "../hooks/FilterContext";

// ── Components ────────────────────────────────────────────────────────────

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Pagination from "../components/functional/Pagination";
import { Spinner } from "../components/interface/LoadingUi";

// ── Utils ────────────────────────────────────────────────────────────

import {
	formatPrice,
	PAYMENT_METHOD_OPTIONS,
	PURCHASE_MODE_OPTIONS,
	unwrapMutationResult,
} from "../utils/orderUtils";
import Badge from "../components/common/Badge";

// ── Aux ────────────────────────────────────────────────────────────

const PAYMENT_METHOD_ICONS = {
	EFECTIVO: <BsCash className="w-4 h-4" />,
	SINPE: <BsPhone className="w-4 h-4" />,
	TARJETA: <BsCreditCard className="w-4 h-4" />,
};

const POSView = ({ storeId }) => {
	// ── States ────────────────────────────────────────────────────────────
	const [cart, setCart] = useState([]);
	const [done, setDone] = useState(false);
	const [saleMode, setSaleMode] = useState("NORMAL");
	const [confirming, setConfirming] = useState(false);
	const [layawayDays, setLayawayDays] = useState("15");
	const [initialPayment, setInitialPayment] = useState("");
	const [installmentCount, setInstallmentCount] = useState("3");
	const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
	const [finalPriceOverride, setFinalPriceOverride] = useState("");

	// ── Context ────────────────────────────────────────────────────────────
	const toast = useToast();
	const { search, setSearch, setPage, applyFilters } = useFilters();

	// ── Queries and Mutations ────────────────────────────────────────────────────────────

	const { data, loading } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId },
		skip: !storeId,
	});

	const dashboardQueries = [
		{ query: GET_STORE_PRODUCTS, variables: { storeId } },
		{ query: GET_DASHBOARD_STATS, variables: { storeId, period: "day" } },
		{ query: GET_DASHBOARD_STATS, variables: { storeId, period: "week" } },
		{ query: GET_DASHBOARD_STATS, variables: { storeId, period: "month" } },
		{ query: GET_DASHBOARD_STATS, variables: { storeId, period: "year" } },
		{ query: GET_DASHBOARD_STATS, variables: { storeId, period: null } },
	];

	const [createOrder] = useMutation(CREATE_ORDER, {
		refetchQueries: [{ query: GET_ALL_ORDERS }, ...dashboardQueries],
		awaitRefetchQueries: true,
		errorPolicy: "none",
	});
	const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
		refetchQueries: [{ query: GET_ALL_ORDERS }, ...dashboardQueries],
		awaitRefetchQueries: true,
		errorPolicy: "none",
	});
	const [configureOrderPurchase] = useMutation(CONFIGURE_ORDER_PURCHASE, {
		refetchQueries: [{ query: GET_ALL_ORDERS }, ...dashboardQueries],
		awaitRefetchQueries: true,
		errorPolicy: "none",
	});

	// ── Filters Config ────────────────────────────────────────────────────────────

	const adaptedProducts = useMemo(() => {
		return (data?.getStoreProducts ?? []).map((sp) => ({
			...sp.product,
			price: sp.price ?? sp.product.price,
			stock: sp.stock ?? sp.product.stock ?? 0,
			discount: sp.discount ?? 0,
			originalData: sp,
		}));
	}, [data]);

	const {
		items: filteredItems,
		totalPages,
		currentPage,
	} = applyFilters(adaptedProducts);

	// ── Totals ────────────────────────────────────────────────────────────

	const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
	const resolvedTotal =
		finalPriceOverride !== "" ? Number(finalPriceOverride || 0) : total;

	// ── Auxiliary Functions ────────────────────────────────────────────────────────────

	const getDiscountedPrice = (price, discount) => {
		const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

		return discountedPrice;
	};

	const addToCart = (storeProduct) => {
		const price = getDiscountedPrice(
			storeProduct.price ?? storeProduct.product.price,
			storeProduct.discount,
		);
		const stock = storeProduct.stock ?? storeProduct.product.stock ?? 0;

		setCart((current) => {
			const existing = current.find(
				(item) => item.productId === storeProduct.product.id,
			);
			if (existing) {
				if (existing.qty >= stock) {
					toast.warning("Sin stock suficiente");
					return current;
				}

				return current.map((item) =>
					item.productId === storeProduct.product.id
						? { ...item, qty: item.qty + 1 }
						: item,
				);
			}

			if (stock <= 0) {
				toast.warning("Producto sin stock");
				return current;
			}

			return [
				...current,
				{
					productId: storeProduct.product.id,
					name: storeProduct.product.name,
					size: storeProduct.product.size,
					price,
					stock,
					qty: 1,
				},
			];
		});
	};

	const changeQty = (productId, delta) => {
		setCart((current) =>
			current
				.map((item) =>
					item.productId === productId
						? { ...item, qty: item.qty + delta }
						: item,
				)
				.filter((item) => item.qty > 0),
		);
	};

	const removeFromCart = (productId) =>
		setCart((current) =>
			current.filter((item) => item.productId !== productId),
		);

	const resetPos = () => {
		setDone(false);
		setCart([]);
		setSearch("");
		setFinalPriceOverride("");
		setInitialPayment("");
		setSaleMode("NORMAL");
		setInstallmentCount("3");
		setLayawayDays("15");
		setPaymentMethod("EFECTIVO");
	};

	const handleConfirm = async () => {
		if (cart.length === 0) return;
		setConfirming(true);

		try {
			const items = cart.map((item) =>
				JSON.stringify({
					productId: item.productId,
					name: item.name + (item.size ? ` (${item.size})` : ""),
					quantity: item.qty,
					price: item.price,
				}),
			);

			const orderResponse = await createOrder({
				variables: { storeId, totalPrice: resolvedTotal, items },
			});
			const createdOrder = unwrapMutationResult(orderResponse, "createOrder");
			const orderId = createdOrder.id;

			if (saleMode === "NORMAL") {
				const updateResponse = await updateOrderStatus({
					variables: {
						id: orderId,
						status: "COMPLETADO",
						finalPrice: resolvedTotal,
					},
				});
				unwrapMutationResult(updateResponse, "updateOrderStatus");
			} else {
				const configureResponse = await configureOrderPurchase({
					variables: {
						id: orderId,
						purchaseMode: saleMode,
						installmentCount:
							saleMode === "INSTALLMENTS"
								? Number(installmentCount)
								: undefined,
						layawayDays:
							saleMode === "LAYAWAY" ? Number(layawayDays) : undefined,
						initialPayment:
							initialPayment === "" ? undefined : Number(initialPayment || 0),
						paymentMethod,
					},
				});
				const configuredOrder = unwrapMutationResult(
					configureResponse,
					"configureOrderPurchase",
				);
				const resolvedMode = configuredOrder.purchaseMode;
				if (resolvedMode !== saleMode) {
					throw new Error("La orden no devolvió la modalidad esperada.");
				}
			}

			setDone(true);
		} catch (error) {
			toast.error("Error al procesar la venta", {
				description: error.message,
			});
		} finally {
			setConfirming(false);
		}
	};

	if (done) {
		return (
			<div className="flex flex-col items-center justify-center gap-6 py-24">
				<div
					className="w-20 h-20 rounded-full flex items-center justify-center"
					style={{
						background:
							"color-mix(in srgb, var(--color-success) 10%, transparent)",
						border:
							"1px solid color-mix(in srgb, var(--color-success) 25%, transparent)",
					}}
				>
					<BsCheckCircle
						className="w-8 h-8"
						style={{ color: "var(--color-success)" }}
					/>
				</div>
				<div className="flex flex-col items-center gap-2 text-center">
					<h2
						className="text-2xl font-light text-first"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						{saleMode === "NORMAL"
							? "Venta completada"
							: saleMode === "INSTALLMENTS"
								? "Venta a cuotas registrada"
								: "Apartado registrado"}
					</h2>
					<p className="text-sm text-first/40 max-w-md">
						{saleMode === "NORMAL"
							? "La orden quedó completada y el stock fue descontado."
							: "La orden quedó en proceso, el stock fue descontado y ya puedes seguirla desde Órdenes."}
					</p>
				</div>
				<Button onClick={resetPos}>Nueva venta</Button>
			</div>
		);
	}

	// ── Auxiliary Components ────────────────────────────────────────────────────────────

	const ProductGrid = () => {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
				{filteredItems.map((product) => {
					const inCart = cart.find((item) => item.productId === product.id);
					const outOfStock = product.stock === 0;

					return (
						<button
							key={product.id}
							onClick={() => !outOfStock && addToCart(product.originalData)}
							disabled={outOfStock}
							className={[
								"flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150",
								outOfStock
									? "border-first/8 opacity-40"
									: inCart
										? "border-second/50 bg-second/5"
										: "border-first/10",
							].join(" ")}
						>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-first truncate">
									{product.name}{" "}
									{product.discount > 0 && (
										<span className="ms-2">
											<Badge
												variant="success"
												children={`-${product.discount}%`}
											/>
										</span>
									)}
								</p>
								<p className="text-xs text-first/40 truncate">
									{product.brand?.name} {product.size && ` · ${product.size}`}
								</p>
								<div className="flex items-center justify-between mt-1">
									<div className="flex gap-1">
										<span
											className="text-sm font-bold"
											style={{ color: "var(--color-second)" }}
										>
											{formatPrice(
												getDiscountedPrice(product.price, product.discount),
											)}
										</span>
										<span className="text-[10px] line-through">
											{product.discount > 0 && formatPrice(product.price)}
										</span>
									</div>
									<span className="text-[10px]">Stock: {product.stock}</span>
								</div>
							</div>
						</button>
					);
				})}
			</div>
		);
	};

	const ItemsInformation = () => {
		return (
			<div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
				{cart.map((item) => (
					<div
						key={item.productId}
						className="flex items-center gap-2 py-2 border-b border-first/6 last:border-0"
					>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium text-first truncate">
								{item.name}
								{item.size && (
									<span className="text-first/35"> · {item.size}</span>
								)}
							</p>
							<p className="text-xs text-first/40 tabular-nums">
								{formatPrice(item.price)} c/u
							</p>
						</div>
						<div className="flex items-center gap-1 shrink-0">
							<button
								onClick={() => changeQty(item.productId, -1)}
								className="w-6 h-6 rounded-md border border-first/12 flex items-center justify-center text-first/40 hover:text-first transition-all cursor-pointer"
							>
								<BsDash className="w-3 h-3" />
							</button>
							<span className="w-6 text-center text-xs font-bold text-first tabular-nums">
								{item.qty}
							</span>
							<button
								onClick={() => {
									if (item.qty >= item.stock) {
										toast.warning("Sin stock suficiente");
										return;
									}
									changeQty(item.productId, 1);
								}}
								className="w-6 h-6 rounded-md border border-first/12 flex items-center justify-center text-first/40 hover:text-first transition-all cursor-pointer"
							>
								<BsPlus className="w-3 h-3" />
							</button>
						</div>
						<span className="text-xs font-semibold text-first tabular-nums w-16 text-right shrink-0">
							{formatPrice(item.price * item.qty)}
						</span>
						<button
							onClick={() => removeFromCart(item.productId)}
							className="text-first/20 hover:text-error transition-colors cursor-pointer"
						>
							<BsTrash className="w-3 h-3" />
						</button>
					</div>
				))}
			</div>
		);
	};

	const CartSummary = () => {
		return (
			<div className="lg:sticky lg:top-24 rounded-2xl border border-first/10 bg-main p-5 flex flex-col gap-4">
				{/* Title */}
				<p
					className="text-[10px] font-semibold uppercase tracking-[0.2em] text-first/35"
					style={{ fontFamily: "'Cinzel', serif" }}
				>
					Carrito de venta
				</p>

				{/* Items Information */}
				{cart.length === 0 ? (
					<p className="text-sm text-first/25 italic text-center py-6">
						Agrega productos desde el catálogo
					</p>
				) : (
					<ItemsInformation />
				)}

				{/* Summary and Payment Options */}
				{cart.length > 0 && (
					<>
						<div className="flex flex-col gap-3 pt-2 border-t border-first/8">
							<div className="flex items-center justify-between">
								<span className="text-xs text-first/35">Subtotal</span>
								<span className="text-sm text-first/50 tabular-nums">
									{formatPrice(total)}
								</span>
							</div>

							<Input
								label="Precio final"
								type="number"
								placeholder={String(total)}
								value={finalPriceOverride}
								onChange={(event) => setFinalPriceOverride(event.target.value)}
							/>

							<Select
								label="Modalidad de compra"
								value={saleMode}
								onChange={(event) => setSaleMode(event.target.value)}
								options={PURCHASE_MODE_OPTIONS}
							/>

							<Select
								label="Método de pago"
								value={paymentMethod}
								onChange={(event) => setPaymentMethod(event.target.value)}
								options={PAYMENT_METHOD_OPTIONS}
							/>

							{saleMode === "INSTALLMENTS" && (
								<Input
									label="Cantidad de cuotas"
									type="number"
									min="1"
									value={installmentCount}
									onChange={(event) => setInstallmentCount(event.target.value)}
								/>
							)}

							{saleMode === "LAYAWAY" && (
								<Input
									label="Tiempo máximo del apartado (días)"
									type="number"
									min="1"
									value={layawayDays}
									onChange={(event) => setLayawayDays(event.target.value)}
								/>
							)}

							{saleMode !== "NORMAL" && (
								<Input
									label="Pago inicial opcional"
									type="number"
									min="0"
									max={resolvedTotal}
									value={initialPayment}
									onChange={(event) => setInitialPayment(event.target.value)}
									placeholder="0"
								/>
							)}
						</div>

						<div className="rounded-xl border border-first/8 p-3 flex items-center justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-wider text-first/35">
									Resumen
								</p>
								<p className="text-sm text-first/55">
									{saleMode === "NORMAL"
										? "Se completará de inmediato."
										: saleMode === "INSTALLMENTS"
											? "Quedará en proceso y se descontará el stock."
											: "Quedará en proceso con stock reservado."}
								</p>
							</div>
							<div className="flex items-center gap-2 text-first/55">
								{PAYMENT_METHOD_ICONS[paymentMethod]}
								<span className="text-sm font-medium">{paymentMethod}</span>
							</div>
						</div>

						<Button
							fullWidth
							size="md"
							loading={confirming}
							onClick={handleConfirm}
							icon={<BsCheckCircle />}
						>
							{saleMode === "NORMAL"
								? "Confirmar venta"
								: saleMode === "INSTALLMENTS"
									? "Registrar a cuotas"
									: "Registrar apartado"}
						</Button>
					</>
				)}
			</div>
		);
	};

	// ── Render ────────────────────────────────────────────────────────────

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
			<CartSummary />
			<div className="flex flex-col gap-4">
				{/* Header */}
				<div className="flex flex-col gap-1">
					<h2 className="text-base font-semibold text-first">Punto de venta</h2>
					<p className="text-xs text-first/40">
						Selecciona los productos y define si será venta normal, a cuotas o
						apartado.
					</p>
				</div>

				{/* Search Bar */}
				<div className="relative flex items-center">
					<span className="absolute left-3 text-first/35 pointer-events-none">
						<BsSearch className="w-4 h-4" />
					</span>
					<input
						type="text"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Buscar producto o marca..."
						className="w-full h-10 pl-9 pr-9 rounded-xl border border-first/15 bg-main text-sm text-first placeholder:text-first/30 focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second transition-all"
					/>
					{search && (
						<button
							onClick={() => setSearch("")}
							className="absolute right-3 text-first/30 hover:text-first/60 cursor-pointer"
						>
							<BsX className="w-4 h-4" />
						</button>
					)}
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-10">
						<Spinner size="md" />
					</div>
				) : (
					<ProductGrid />
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-6 flex justify-center">
						<Pagination
							currentPage={currentPage} // Aquí es donde se usa el estado del context
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default POSView;
