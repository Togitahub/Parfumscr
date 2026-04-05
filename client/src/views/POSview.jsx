import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import {
	BsSearch,
	BsX,
	BsPlus,
	BsDash,
	BsTrash,
	BsCheckCircle,
	BsCash,
	BsCreditCard,
	BsPhone,
} from "react-icons/bs";

import {
	CREATE_ORDER,
	UPDATE_ORDER_STATUS,
} from "../graphql/order/OrderMutations";
import {
	GET_DASHBOARD_STATS,
	GET_STORE_PRODUCTS,
} from "../graphql/store/StoreQueries";

import { useToast } from "../hooks/ToastContext";

import Button from "../components/common/Button";
import { Spinner } from "../components/interface/LoadingUi";
import { GET_ALL_ORDERS } from "../graphql/order/OrderQueries";

// import { getOptimizedUrl } from "../utils/ImageUtils";

const PAYMENT_METHODS = [
	{ key: "SINPE", label: "SINPE", icon: <BsPhone className="w-4 h-4" /> },
	{ key: "EFECTIVO", label: "Efectivo", icon: <BsCash className="w-4 h-4" /> },
	{
		key: "TARJETA",
		label: "Tarjeta",
		icon: <BsCreditCard className="w-4 h-4" />,
	},
];

const formatPrice = (p) =>
	`₡${p?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

const POSView = ({ storeId }) => {
	const toast = useToast();

	const [search, setSearch] = useState("");
	const [cart, setCart] = useState([]);
	const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");
	const [confirming, setConfirming] = useState(false);
	const [finalPriceOverride, setFinalPriceOverride] = useState("");
	const [done, setDone] = useState(false);

	const { data, loading } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId },
		skip: !storeId,
	});

	const updateDashboard = [
		{ query: GET_STORE_PRODUCTS, variables: { storeId: storeId } },
		{
			query: GET_DASHBOARD_STATS,
			variables: { storeId: storeId, period: "week" },
		},
		{
			query: GET_DASHBOARD_STATS,
			variables: { storeId: storeId, period: "month" },
		},
		{
			query: GET_DASHBOARD_STATS,
			variables: { storeId: storeId, period: "year" },
		},
		{
			query: GET_DASHBOARD_STATS,
			variables: { storeId: storeId, period: null },
		},
	];

	const [createOrder] = useMutation(CREATE_ORDER, {
		refetchQueries: [
			{ query: GET_ALL_ORDERS },
			...(storeId ? updateDashboard : []),
		],
	});
	const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
		refetchQueries: [
			{ query: GET_ALL_ORDERS },
			...(storeId ? updateDashboard : []),
		],
	});

	const products = useMemo(() => {
		const all = data?.getStoreProducts ?? [];
		const q = search.trim().toLowerCase();
		return q
			? all.filter(
					(sp) =>
						sp.product.name.toLowerCase().includes(q) ||
						sp.product.brand?.name?.toLowerCase().includes(q),
				)
			: all;
	}, [data, search]);

	// ── Cart helpers ──────────────────────────────────────────────────────────

	const addToCart = (sp) => {
		const price = sp.price ?? sp.product.price;
		const stock = sp.stock ?? sp.product.stock ?? 0;
		setCart((prev) => {
			const existing = prev.find((i) => i.productId === sp.product.id);
			if (existing) {
				if (existing.qty >= stock) {
					toast.warning("Sin stock suficiente");
					return prev;
				}
				return prev.map((i) =>
					i.productId === sp.product.id ? { ...i, qty: i.qty + 1 } : i,
				);
			}
			if (stock === 0) {
				toast.warning("Producto sin stock");
				return prev;
			}
			return [
				...prev,
				{
					productId: sp.product.id,
					name: sp.product.name,
					size: sp.product.size,
					image: sp.product.images?.[0] ?? null,
					price,
					stock,
					qty: 1,
				},
			];
		});
	};

	const changeQty = (productId, delta) => {
		setCart((prev) =>
			prev
				.map((i) =>
					i.productId === productId ? { ...i, qty: i.qty + delta } : i,
				)
				.filter((i) => i.qty > 0),
		);
	};

	const removeFromCart = (productId) =>
		setCart((prev) => prev.filter((i) => i.productId !== productId));

	const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

	// ── Confirm sale ──────────────────────────────────────────────────────────

	const handleConfirm = async () => {
		if (cart.length === 0) return;
		setConfirming(true);
		try {
			const items = cart.map((i) =>
				JSON.stringify({
					productId: i.productId,
					name: i.name + (i.size ? ` (${i.size})` : ""),
					quantity: i.qty,
					price: i.price,
				}),
			);

			const resolvedTotal =
				finalPriceOverride !== "" ? parseFloat(finalPriceOverride) : total;
			const { data: orderData } = await createOrder({
				variables: { storeId, totalPrice: resolvedTotal, items },
			});
			const orderId = orderData.createOrder.id;
			await updateOrderStatus({
				variables: {
					id: orderId,
					status: "COMPLETADO",
					finalPrice: resolvedTotal,
				},
			});

			setDone(true);
			setCart([]);
			setSearch("");
		} catch (err) {
			toast.error("Error al procesar la venta", { description: err.message });
		} finally {
			setConfirming(false);
		}
	};

	// ── Done screen ───────────────────────────────────────────────────────────

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
						Venta completada
					</h2>
					<p className="text-sm text-first/40">
						La orden fue registrada y el stock fue descontado.
					</p>
				</div>
				<Button
					onClick={() => {
						setDone(false);
						setFinalPriceOverride("");
					}}
				>
					Nueva venta
				</Button>
			</div>
		);
	}

	// ── Main layout ───────────────────────────────────────────────────────────

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
			{/* ── Left: product catalog ── */}
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="text-base font-semibold text-first">Punto de Venta</h2>
					<p className="text-xs text-first/40">
						Selecciona los productos de la venta
					</p>
				</div>

				{/* Search */}
				<div className="relative flex items-center">
					<span className="absolute left-3 text-first/35 pointer-events-none">
						<BsSearch className="w-4 h-4" />
					</span>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
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

				{/* Product grid */}
				{loading ? (
					<div className="flex items-center justify-center py-10">
						<Spinner size="md" />
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
						{products.map((sp) => {
							const price = sp.price ?? sp.product.price;
							const stock = sp.stock ?? sp.product.stock ?? 0;
							const inCart = cart.find((i) => i.productId === sp.product.id);
							const outOfStock = stock === 0;

							return (
								<button
									key={sp.product.id}
									onClick={() => !outOfStock && addToCart(sp)}
									disabled={outOfStock}
									className={[
										"flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150",
										outOfStock
											? "border-first/8 opacity-40 cursor-not-allowed"
											: inCart
												? "border-second/50 bg-second/5 cursor-pointer"
												: "border-first/10 hover:border-second/30 hover:bg-second/4 cursor-pointer",
									].join(" ")}
								>
									{/* {sp.product.images?.[0] && (
										<div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-first/5">
											<img
												src={getOptimizedUrl(sp.product.images[0], "thumb")}
												alt={sp.product.name}
												className="w-full h-full object-cover"
											/>
										</div>
									)} */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-first truncate">
											{sp.product.name}
										</p>
										<p className="text-xs text-first/40 truncate">
											{sp.product.brand?.name}
											{sp.product.size && ` · ${sp.product.size}`}
										</p>
										<div className="flex items-center justify-between mt-1">
											<span
												className="text-sm font-bold"
												style={{ color: "var(--color-second)" }}
											>
												{formatPrice(price)}
											</span>
											<span className="text-[10px] text-first/30">
												Stock: {stock}
											</span>
										</div>
									</div>
									{inCart && (
										<span
											className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-main"
											style={{ background: "var(--color-second)" }}
										>
											{inCart.qty}
										</span>
									)}
								</button>
							);
						})}
						{products.length === 0 && !loading && (
							<p className="col-span-full text-sm text-first/30 text-center py-10 italic">
								Sin productos
							</p>
						)}
					</div>
				)}
			</div>

			{/* ── Right: cart + payment ── */}
			<div className="lg:sticky lg:top-24 rounded-2xl border border-first/10 bg-main p-5 flex flex-col gap-4">
				<p
					className="text-[10px] font-semibold uppercase tracking-[0.2em] text-first/35"
					style={{ fontFamily: "'Cinzel', serif" }}
				>
					Carrito de venta
				</p>

				{cart.length === 0 ? (
					<p className="text-sm text-first/25 italic text-center py-6">
						Agrega productos desde el catálogo
					</p>
				) : (
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
				)}

				{cart.length > 0 && (
					<>
						<div className="flex flex-col gap-2 pt-2 border-t border-first/8">
							<div className="flex items-center justify-between">
								<span className="text-xs text-first/35">Subtotal</span>
								<span className="text-sm text-first/50 tabular-nums">
									{formatPrice(total)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<label className="text-xs font-medium text-first/50 uppercase tracking-wider shrink-0">
									Precio final
								</label>
								<input
									type="number"
									placeholder={total}
									value={finalPriceOverride}
									onChange={(e) => setFinalPriceOverride(e.target.value)}
									className="flex-1 h-8 px-2 rounded-lg border border-second/30 bg-main text-first text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-second/30 text-right"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<p className="text-xs text-first/40 font-medium uppercase tracking-wider">
								Método de pago
							</p>
							<div className="grid grid-cols-3 gap-2">
								{PAYMENT_METHODS.map((m) => (
									<button
										key={m.key}
										onClick={() => setPaymentMethod(m.key)}
										className={[
											"flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer",
											paymentMethod === m.key
												? "border-second bg-second/10 text-second"
												: "border-first/10 text-first/40 hover:border-first/25 hover:text-first/70",
										].join(" ")}
									>
										{m.icon}
										{m.label}
									</button>
								))}
							</div>
						</div>
						<Button
							fullWidth
							size="md"
							loading={confirming}
							onClick={handleConfirm}
							icon={<BsCheckCircle />}
						>
							Confirmar venta
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default POSView;
