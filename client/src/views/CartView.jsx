import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import {
	BsCart3,
	BsTrash,
	BsPlus,
	BsDash,
	BsArrowLeft,
	BsBoxSeam,
	BsWhatsapp,
} from "react-icons/bs";

import { useAuth } from "../hooks/AuthContext";
import { useCart } from "../hooks/CartContext";
import { useStore } from "../hooks/StoreContext";
import { useToast } from "../hooks/ToastContext";

import { GET_STORE_PRODUCTS } from "../graphql/store/StoreQueries";

import Button from "../components/common/Button";
import { Spinner } from "../components/interface/LoadingUi";
import { ConfirmDialog } from "../components/interface/Modal";
import PurchaseForm from "../components/forms/PurchaseForm";
import { getOptimizedUrl } from "../utils/ImageUtils";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

// ── Empty cart ────────────────────────────────────────────────────────────────

const EmptyCart = () => {
	const navigate = useNavigate();

	return (
		<div
			className="flex flex-col items-center justify-center gap-8 py-24 px-4"
			style={{ animation: "fadeUp 0.6s ease both" }}
		>
			<div className="relative flex items-center justify-center">
				<div
					className="absolute w-28 h-28 rounded-full border"
					style={{
						borderColor:
							"color-mix(in srgb, var(--color-second) 15%, transparent)",
						animation: "heroRotateSlow 20s linear infinite",
					}}
				/>
				<div
					className="absolute w-20 h-20 rounded-full border border-dashed"
					style={{
						borderColor:
							"color-mix(in srgb, var(--color-first) 8%, transparent)",
						animation: "heroRotateSlow 14s linear infinite reverse",
					}}
				/>
				<div
					className="w-14 h-14 rounded-full flex items-center justify-center"
					style={{
						background:
							"color-mix(in srgb, var(--color-second) 6%, transparent)",
						border:
							"1px solid color-mix(in srgb, var(--color-second) 18%, transparent)",
					}}
				>
					<BsCart3
						className="w-5 h-5"
						style={{ color: "var(--color-second)", opacity: 0.7 }}
					/>
				</div>
			</div>

			<div className="flex flex-col items-center gap-3 text-center">
				<h2
					className="text-3xl font-light tracking-wide text-first"
					style={{ fontFamily: "'Cormorant Garamond', serif" }}
				>
					Tu carrito está vacío
				</h2>
				<p
					className="text-sm font-light max-w-xs leading-relaxed"
					style={{
						fontFamily: "'Cormorant Garamond', serif",
						fontSize: "1rem",
						fontStyle: "italic",
						color: "color-mix(in srgb, var(--color-first) 40%, transparent)",
					}}
				>
					Explora nuestro catálogo y agrega las fragancias que te enamoren.
				</p>
			</div>

			<Button
				variant="outline"
				size="md"
				rounded
				onClick={() => navigate("/store")}
				icon={<BsArrowLeft />}
			>
				Explorar catálogo
			</Button>
		</div>
	);
};

// ── Cart item row ─────────────────────────────────────────────────────────────

const CartItemRow = ({ item, onIncrease, onDecrease, onRemove, index }) => {
	const { product, quantity } = item;
	const subtotal = product.price * quantity;

	return (
		<div
			className="group flex items-center gap-4 py-4 border-b border-first/8 last:border-0"
			style={{
				animation: "fadeUp 0.4s ease both",
				animationDelay: `${index * 60}ms`,
			}}
		>
			{/* Image */}
			<div className="w-16 h-16 rounded-xl overflow-hidden bg-first/5 shrink-0">
				{product.images?.[0] ? (
					<img
						src={getOptimizedUrl(product.images[0], "thumb")}
						alt={product.name}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<BsBoxSeam className="w-5 h-5 text-first/20" />
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-first truncate">
					{product.name}
				</p>
				<div className="flex items-center gap-1.5 mt-0.5">
					{product.brand?.name && (
						<span
							className="text-[10px] font-semibold tracking-widest uppercase"
							style={{ color: "var(--color-second)", opacity: 0.8 }}
						>
							{product.brand.name}
						</span>
					)}
					{product.size && (
						<>
							<span className="text-first/20 text-[10px]">·</span>
							<span className="text-[11px] text-first/35">{product.size}</span>
						</>
					)}
					{product.isDecant && (
						<>
							<span className="text-first/20 text-[10px]">·</span>
							<span
								className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
								style={{
									background:
										"color-mix(in srgb, var(--color-second) 12%, transparent)",
									color: "var(--color-second)",
									border:
										"1px solid color-mix(in srgb, var(--color-second) 25%, transparent)",
								}}
							>
								Decant
							</span>
						</>
					)}
				</div>
				<p className="text-xs text-first/35 mt-1 tabular-nums">
					{formatPrice(product.price)} c/u
				</p>
			</div>

			{/* Qty controls */}
			<div className="flex items-center gap-1 shrink-0">
				<button
					onClick={() => onDecrease(product.id, quantity)}
					className="w-7 h-7 rounded-lg border border-first/12 flex items-center justify-center text-first/40 hover:text-first hover:border-first/30 transition-all duration-150 cursor-pointer"
					aria-label="Reducir cantidad"
				>
					<BsDash className="w-3 h-3" />
				</button>

				<span className="w-8 text-center text-sm font-semibold text-first tabular-nums">
					{quantity}
				</span>

				<button
					onClick={() => onIncrease(product)}
					className="w-7 h-7 rounded-lg border border-first/12 flex items-center justify-center text-first/40 hover:text-first hover:border-first/30 transition-all duration-150 cursor-pointer"
					aria-label="Aumentar cantidad"
				>
					<BsPlus className="w-3 h-3" />
				</button>
			</div>

			{/* Subtotal */}
			<div className="flex items-center gap-3 shrink-0">
				<span className="text-base font-bold text-first tabular-nums w-24 text-right hidden sm:block">
					{formatPrice(subtotal)}
				</span>
				<button
					onClick={() => onRemove(product.id)}
					className="w-7 h-7 rounded-lg flex items-center justify-center text-first/25 hover:text-error hover:bg-error/8 transition-all duration-150 cursor-pointer"
					aria-label="Eliminar del carrito"
				>
					<BsTrash className="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
	);
};

// ── CartView ──────────────────────────────────────────────────────────────────

const CartView = () => {
	const { user, isAuthenticated } = useAuth();
	const { store } = useStore();
	const toast = useToast();
	const navigate = useNavigate();

	const {
		items: rawCartItems,
		totalItems,
		loading,
		isGuest,
		addItem,
		removeItem,
		decreaseItem,
		clearCart,
	} = useCart();

	const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
	const [purchaseOpen, setPurchaseOpen] = useState(false);
	const [clearing, setClearing] = useState(false);

	// Enrich prices with store-specific overrides
	const { data: storeProductsData } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId: store?.storeId },
		skip: !store?.storeId,
	});

	const cartItems = rawCartItems.map((item) => {
		const storeProduct = storeProductsData?.getStoreProducts?.find(
			(sp) => sp.product.id === item.product.id,
		);
		const basePrice = storeProduct?.price ?? item.product.price;
		const discount = storeProduct?.discount ?? item.product.discount ?? 0;
		const effectivePrice =
			discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

		return {
			...item,
			product: {
				...item.product,
				price: effectivePrice,
				originalPrice: discount > 0 ? basePrice : null,
				discount,
			},
		};
	});

	const totalPrice = cartItems.reduce(
		(acc, i) => acc + i.product.price * i.quantity,
		0,
	);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleIncrease = async (product) => {
		try {
			await addItem(product, 1);
		} catch (err) {
			toast.error("Error al actualizar", { description: err.message });
		}
	};

	const handleDecrease = async (productId, quantity) => {
		try {
			await decreaseItem(productId, quantity);
		} catch (err) {
			toast.error("Error al actualizar", { description: err.message });
		}
	};

	const handleRemove = async (productId) => {
		try {
			await removeItem(productId);
			toast.success("Producto eliminado del carrito");
		} catch (err) {
			toast.error("Error al eliminar", { description: err.message });
		}
	};

	const handleClearCart = async () => {
		try {
			setClearing(true);
			await clearCart();
			toast.success("Carrito vaciado");
			setClearConfirmOpen(false);
		} catch (err) {
			toast.error("Error al vaciar el carrito", { description: err.message });
		} finally {
			setClearing(false);
		}
	};

	// ── Loading ───────────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div
			className="min-h-screen px-4 py-10 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-4xl mx-auto flex flex-col gap-8">
				{/* ── Page header ── */}
				<div
					className="flex flex-col gap-2"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<p
						className="text-[10px] font-semibold uppercase tracking-[0.3em]"
						style={{
							color: "var(--color-second)",
							fontFamily: "'Cinzel', serif",
						}}
					>
						Mi compra
					</p>
					<div className="flex items-end gap-4">
						<h1
							className="text-4xl font-light tracking-tight text-first leading-none"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							Carrito
						</h1>
						{cartItems.length > 0 && (
							<span
								className="mb-1 text-sm font-light"
								style={{
									fontFamily: "'Cormorant Garamond', serif",
									fontStyle: "italic",
									color:
										"color-mix(in srgb, var(--color-first) 35%, transparent)",
								}}
							>
								{totalItems} {totalItems === 1 ? "artículo" : "artículos"}
							</span>
						)}
					</div>
					<div
						className="mt-1 h-px w-24"
						style={{
							background:
								"linear-gradient(to right, var(--color-second), transparent)",
							opacity: 0.5,
						}}
					/>

					{/* Guest notice */}
					{isGuest && (
						<div
							className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl border"
							style={{
								background:
									"color-mix(in srgb, var(--color-second) 6%, transparent)",
								borderColor:
									"color-mix(in srgb, var(--color-second) 20%, transparent)",
							}}
						>
							<p className="text-xs text-first/60 leading-relaxed">
								Estás comprando como{" "}
								<span className="font-semibold text-first/80">invitado</span>.{" "}
								<button
									onClick={() => navigate("/auth")}
									className="underline underline-offset-2 cursor-pointer"
									style={{ color: "var(--color-second)" }}
								>
									Inicia sesión
								</button>{" "}
								para guardar tu historial de órdenes y favoritos.
							</p>
						</div>
					)}
				</div>

				{/* ── Empty state ── */}
				{cartItems.length === 0 ? (
					<EmptyCart />
				) : (
					<div className="flex flex-col lg:flex-row gap-6 items-start">
						{/* ── Items list ── */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between mb-2 px-1">
								<p className="text-xs font-medium text-first/40 uppercase tracking-widest">
									Productos
								</p>
								<button
									onClick={() => setClearConfirmOpen(true)}
									className="flex items-center gap-1.5 text-xs text-first/30 hover:text-error transition-colors duration-150 cursor-pointer"
								>
									<BsTrash className="w-3 h-3" />
									Vaciar carrito
								</button>
							</div>

							<div className="rounded-2xl border border-first/8 bg-main px-4 overflow-hidden">
								{cartItems.map((item, i) => (
									<CartItemRow
										key={item.product.id}
										item={item}
										index={i}
										onIncrease={handleIncrease}
										onDecrease={handleDecrease}
										onRemove={handleRemove}
									/>
								))}
							</div>

							{/* Mobile subtotals */}
							<div className="sm:hidden mt-4 flex flex-col gap-2 px-1">
								{cartItems.map((item) => (
									<div
										key={item.product.id}
										className="flex items-center justify-between text-xs text-first/40"
									>
										<span className="truncate max-w-[60%]">
											{item.product.name}
										</span>
										<span className="tabular-nums font-medium text-first/60">
											{formatPrice(item.product.price * item.quantity)}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* ── Order summary sidebar ── */}
						<div
							className="w-full lg:w-72 shrink-0 rounded-2xl border border-first/10 bg-main p-5 flex flex-col gap-4 sticky top-24"
							style={{
								animation: "fadeUp 0.5s ease both",
								animationDelay: "100ms",
							}}
						>
							<p
								className="text-[10px] font-semibold uppercase tracking-[0.2em] text-first/35"
								style={{ fontFamily: "'Cinzel', serif" }}
							>
								Resumen
							</p>

							<div className="flex flex-col gap-2">
								{cartItems.map((item) => (
									<div
										key={item.product.id}
										className="flex items-center justify-between gap-2 text-sm"
									>
										<span className="text-first/50 truncate text-xs">
											{item.product.name}
											{item.quantity > 1 && (
												<span className="text-first/30"> ×{item.quantity}</span>
											)}
										</span>
										<span className="text-first/60 tabular-nums text-xs shrink-0">
											{formatPrice(item.product.price * item.quantity)}
										</span>
									</div>
								))}
							</div>

							<div className="h-px bg-first/8" />

							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-first/50 uppercase tracking-wider">
									Total
								</span>
								<span
									className="text-2xl font-bold text-first tabular-nums"
									style={{ fontFamily: "'Cinzel', serif" }}
								>
									{formatPrice(totalPrice)}
								</span>
							</div>

							<Button
								fullWidth
								size="md"
								icon={<BsWhatsapp />}
								onClick={() => setPurchaseOpen(true)}
								className="mt-1"
							>
								Comprar por WhatsApp
							</Button>

							<p className="text-[11px] text-center text-first/25 leading-snug">
								Recibirás confirmación de tu pedido por WhatsApp
							</p>
						</div>
					</div>
				)}
			</div>

			{/* ── Confirm clear ── */}
			<ConfirmDialog
				isOpen={clearConfirmOpen}
				onClose={() => setClearConfirmOpen(false)}
				onConfirm={handleClearCart}
				loading={clearing}
				title="¿Vaciar carrito?"
				description="Se eliminarán todos los productos. Esta acción no se puede deshacer."
				confirmLabel="Vaciar"
			/>

			{/* ── Purchase form ── */}
			<PurchaseForm
				isOpen={purchaseOpen}
				onClose={() => setPurchaseOpen(false)}
				cartItems={cartItems}
				totalPrice={totalPrice}
				user={isAuthenticated ? user : null}
				isGuest={isGuest}
				onSuccess={() => clearCart()}
			/>
		</div>
	);
};

export default CartView;
