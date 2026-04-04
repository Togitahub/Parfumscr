// React
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";

// Icons
import {
	BsArrowLeft,
	BsHeart,
	BsHeartFill,
	BsCart3,
	BsWhatsapp,
	BsBoxSeam,
	BsTag,
	BsLayers,
	BsBookmark,
	BsDroplet,
	BsCheckCircle,
	BsXCircle,
	BsChevronRight,
} from "react-icons/bs";

// Context
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { useStore } from "../hooks/StoreContext";

// GraphQL
import {
	ADD_FAVORITE,
	REMOVE_FAVORITE,
} from "../graphql/favorites/FavoritesMutations";
import { GET_PRODUCT } from "../graphql/product/ProductQueries";
import { ADD_ITEM_TO_CART } from "../graphql/cart/CartMutations";
import { GET_STORE_PRODUCTS } from "../graphql/store/StoreQueries";
import { REGISTER_PRODUCT_VIEW } from "../graphql/store/StoreMutations";
import { GET_USER_FAVORITES } from "../graphql/favorites/FavoritesQueries";

// Components
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Spinner } from "../components/interface/LoadingUi";

// Utils

import { getOptimizedUrl } from "../utils/ImageUtils";
import { useEffect } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

const discountedPrice = (discount, displayPrice) =>
	discount > 0 ? displayPrice * (1 - discount / 100) : displayPrice;

// ── Image gallery ─────────────────────────────────────────────────────────────

const ImageGallery = ({ images = [], name }) => {
	const [active, setActive] = useState(0);
	const [loaded, setLoaded] = useState(false);

	const current = images[active]
		? getOptimizedUrl(images[active], "detail")
		: null;

	return (
		<div className="flex flex-col gap-3">
			{/* Main image */}
			<div
				className="relative overflow-hidden rounded-2xl bg-first/4"
				style={{ aspectRatio: "4/3" }}
			>
				{!loaded && <div className="absolute inset-0 shimmer" />}
				{current ? (
					<img
						key={current}
						src={current}
						alt={name}
						onLoad={() => setLoaded(true)}
						className="w-full h-full object-cover transition-all duration-500"
						style={{ opacity: loaded ? 1 : 0 }}
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-first/15">
						<BsBoxSeam className="w-12 h-12" />
						<span className="text-xs tracking-widest uppercase opacity-60">
							Sin imagen
						</span>
					</div>
				)}

				{/* Overlay gradient */}
				<div
					className="absolute inset-0 pointer-events-none rounded-2xl"
					style={{
						background:
							"linear-gradient(135deg, color-mix(in srgb, var(--color-second) 4%, transparent) 0%, transparent 60%)",
					}}
				/>
			</div>

			{/* Thumbnails */}
			{images.length > 1 && (
				<div className="flex gap-2">
					{images.map((img, i) => (
						<button
							key={i}
							onClick={() => {
								setActive(i);
								setLoaded(false);
							}}
							className={[
								"relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shrink-0",
								i === active
									? "border-second"
									: "border-transparent opacity-50 hover:opacity-80",
							].join(" ")}
						>
							<img src={img} alt="" className="w-full h-full object-cover" />
						</button>
					))}
				</div>
			)}
		</div>
	);
};

// ── Info row ──────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value, to, navigate }) => (
	<div className="flex items-center gap-3 py-2.5 border-b border-second/25 last:border-0">
		<span className="text-first/30 shrink-0">{icon}</span>
		<span className="text-xs text-first/40 w-20 shrink-0">{label}</span>
		{to ? (
			<button
				onClick={() => navigate(to)}
				className="flex items-center gap-1 text-sm font-medium text-second hover:opacity-70 transition-opacity cursor-pointer"
			>
				{value}
				<BsChevronRight className="w-3 h-3" />
			</button>
		) : (
			<span className="text-sm font-medium text-first">{value}</span>
		)}
	</div>
);

// ── Linked product banner ─────────────────────────────────────────────────────

const LinkedProductBanner = ({ product, navigate }) => (
	<button
		onClick={() => navigate(`/store/product/${product.id}`)}
		className="w-full flex items-center gap-3 p-3 rounded-xl border border-first/10 hover:border-second/30 hover:bg-second/4 transition-all duration-200 cursor-pointer text-left group"
	>
		{product.images?.[0] && (
			<div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
				<img
					src={product.images[0]}
					alt={product.name}
					className="w-full h-full object-cover"
				/>
			</div>
		)}
		<div className="flex-1 min-w-0">
			<p className="text-[10px] font-semibold uppercase tracking-widest text-second/60 mb-0.5">
				Perfume original
			</p>
			<p className="text-sm font-semibold text-first truncate">
				{product.name}
			</p>
			{product.brand?.name && (
				<p className="text-xs text-first/40 tracking-widest uppercase">
					{product.brand.name}
				</p>
			)}
		</div>
		<BsChevronRight className="w-4 h-4 text-first/20 group-hover:text-second transition-colors shrink-0" />
	</button>
);

// ── ProductView ───────────────────────────────────────────────────────────────

const ProductView = () => {
	const toast = useToast();
	const navigate = useNavigate();

	const { id } = useParams();

	const { store } = useStore();
	const { user, isAuthenticated } = useAuth();

	const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

	const [selectedDecant, setSelectedDecant] = useState(null);
	const [qty, setQty] = useState(1);

	// ── Queries ───────────────────────────────────────────────────────────────

	const { data, loading, error } = useQuery(GET_PRODUCT, {
		variables: { id },
		skip: !id,
		onCompleted: (d) => {
			const decants = d?.getProduct?.decants ?? [];
			if (decants.length > 0) {
				const first = decants.find((d) => d.stock > 0) ?? decants[0];
				setSelectedDecant(first);
			}
		},
	});

	const { data: storeProductsData } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId: store?.storeId },
		skip: !store?.storeId,
	});

	const { data: favoritesData, refetch: refetchFavorites } = useQuery(
		GET_USER_FAVORITES,
		{
			variables: { userId: user?.id },
			skip: !isAuthenticated || !user?.id,
		},
	);

	// ── Mutations ─────────────────────────────────────────────────────────────

	const [addFavorite, { loading: togglingFav }] = useMutation(ADD_FAVORITE);
	const [removeFavorite] = useMutation(REMOVE_FAVORITE);
	const [addToCart, { loading: addingCart }] = useMutation(ADD_ITEM_TO_CART);
	const [registerView] = useMutation(REGISTER_PRODUCT_VIEW);

	// ── Derived data ──────────────────────────────────────────────────────────

	const product = data?.getProduct;

	const storeProductIds = new Set(
		storeProductsData?.getStoreProducts?.map((sp) => sp.product.id) ?? [],
	);
	const storeProduct = storeProductsData?.getStoreProducts?.find(
		(sp) => sp.product.id === id,
	);

	const storePrice = storeProduct?.price ?? product?.price ?? 0;
	const storeStock = storeProduct?.stock ?? product?.stock ?? 0;

	const favoriteIds =
		favoritesData?.getUserFavorites?.products?.map((p) => p.id) ?? [];
	const isFavorite = favoriteIds.includes(id);

	const decants = (product?.decants ?? [])
		.filter((d) => storeProductIds.has(d.id))
		.map((d) => {
			const sp = storeProductsData?.getStoreProducts?.find(
				(sp) => sp.product.id === d.id,
			);
			return {
				...d,
				price: sp?.price ?? d.price,
				stock: sp?.stock ?? d.stock,
				discount: sp?.discount ?? d.discount ?? 0,
			};
		});

	const hasDecants = decants.length > 0;
	const isOutOfStock = storeStock === 0;

	// Precio y producto a agregar al carrito
	const displayPrice = selectedDecant
		? (storeProductsData?.getStoreProducts?.find(
				(sp) => sp.product.id === selectedDecant.id,
			)?.price ?? selectedDecant.price)
		: storePrice;

	const discount = storeProduct?.discount ?? product?.discount ?? 0;

	const hasDiscount = discount > 0;

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleToggleFavorite = async () => {
		if (!isAuthenticated) {
			toast.info("Inicia sesión para guardar favoritos");
			return;
		}
		try {
			if (isFavorite) {
				await removeFavorite({ variables: { userId: user.id, productId: id } });
				toast.success("Eliminado de favoritos");
			} else {
				await addFavorite({ variables: { userId: user.id, productId: id } });
				toast.success("Agregado a favoritos");
			}
			refetchFavorites();
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const handleAddToCart = async () => {
		if (!isAuthenticated) {
			toast.info("Inicia sesión para agregar al carrito");
			return;
		}
		const productId = selectedDecant?.id ?? id;
		try {
			await addToCart({
				variables: { userId: user.id, productId, quantity: qty },
			});
			toast.success("Agregado al carrito", {
				description: `${product.name}${selectedDecant?.size ? ` · ${selectedDecant.size}` : ""} × ${qty}`,
			});
		} catch (err) {
			toast.error("Error al agregar", { description: err.message });
		}
	};

	const handleWhatsApp = () => {
		const item = selectedDecant ?? product;
		const msg = encodeURIComponent(
			`Hola! Me interesa este perfume:\n\n*${product.name}*${item?.size ? ` (${item.size})` : ""}\nPrecio: ${formatPrice(discountedPrice)}\n\n¿Está disponible?`,
		);
		window.open(`https://wa.me/?text=${msg}`, "_blank");
	};

	// ── Register View ───────────────────────────────────────────────────────────────

	useEffect(() => {
		if (id) registerView({ variables: { productId: id } });
	}, [id, registerView]);

	// ── Loading ───────────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center">
				<Spinner size="xl" />
			</div>
		);
	}

	// ── Error / not found ─────────────────────────────────────────────────────

	if (error || !product) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
				<BsXCircle className="w-12 h-12 text-error/40" />
				<p className="text-first/40 text-sm text-center">
					{error ? "Error al cargar el producto." : "Producto no encontrado."}
				</p>
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					Volver
				</Button>
			</div>
		);
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div
			className="min-h-screen px-4 py-10 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-6xl mx-auto flex flex-col gap-10">
				{/* ── Back button ── */}
				<button
					onClick={() => navigate(-1)}
					className="flex items-center gap-1.5 text-sm text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<BsArrowLeft className="w-3.5 h-3.5" />
					Volver
				</button>

				{/* ── Main grid ── */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
					{/* ── Left: Gallery ── */}
					<div
						style={{
							animation: "fadeUp 0.5s ease both",
							animationDelay: "60ms",
						}}
					>
						<ImageGallery images={product.images} name={product.name} />
					</div>

					{/* ── Right: Details ── */}
					<div
						className="flex flex-col gap-6"
						style={{
							animation: "fadeUp 0.5s ease both",
							animationDelay: "120ms",
						}}
					>
						{/* Header */}
						<div className="flex flex-col gap-3">
							{/* Eyebrow: brand + badges */}
							<div className="flex items-center justify-between gap-3 flex-wrap">
								<button
									onClick={() => navigate(`/store/brand/${product.brand?.id}`)}
									className="text-[11px] font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-70 cursor-pointer"
									style={{ color: "var(--color-second)" }}
								>
									{product.brand?.name ?? "—"}
								</button>
								<div className="flex items-center gap-1.5 flex-wrap">
									{product.isDecant && (
										<Badge variant="info" size="sm" dot>
											Decant
										</Badge>
									)}
									{hasDiscount && (
										<Badge variant="error" size="sm">
											{discount}% Descuento
										</Badge>
									)}
									{isOutOfStock && !hasDecants && (
										<Badge variant="neutral" size="sm">
											Agotado
										</Badge>
									)}
								</div>
							</div>

							{/* Product name */}
							<h1
								className="font-light text-first leading-tight"
								style={{
									fontFamily: "'Cormorant Garamond', serif",
									fontSize: "clamp(2rem, 4vw, 3rem)",
									letterSpacing: "-0.01em",
								}}
							>
								{product.name}
							</h1>

							{/* Size */}
							{product.size && (
								<p className="text-sm text-first/40 tracking-wide">
									{product.size}
								</p>
							)}

							{/* Decorative line */}
							<div
								className="h-px w-16"
								style={{
									background:
										"linear-gradient(to right, var(--color-second), transparent)",
									opacity: 0.5,
								}}
							/>
						</div>

						{/* Linked product (decant pointing to parent) */}
						{product.isDecant && product.linkedProduct && (
							<LinkedProductBanner
								product={product.linkedProduct}
								navigate={navigate}
							/>
						)}

						{/* Price block */}
						<div className="flex flex-col gap-1">
							<div className="flex items-baseline gap-3">
								<span
									className="font-semibold text-first tabular-nums"
									style={{
										fontFamily: "'Cinzel', serif",
										fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
									}}
								>
									{formatPrice(discountedPrice(discount, displayPrice))}
								</span>
								{hasDiscount && (
									<span className="text-base text-first/30 line-through tabular-nums">
										{formatPrice(displayPrice)}
									</span>
								)}
							</div>

							{/* Stock indicator — perfume (no decants) */}
							{!hasDecants && (
								<div className="flex items-center gap-2 text-xs">
									{isOutOfStock ? (
										<>
											<BsXCircle className="w-3.5 h-3.5 text-error/60" />
											<span className="text-error/60">
												Sin stock disponible
											</span>
										</>
									) : (
										<>
											<BsCheckCircle className="w-3.5 h-3.5 text-success" />
											<span className="text-first/40">
												{storeStock <= 5
													? `Solo ${storeStock} disponible${storeStock !== 1 ? "s" : ""}`
													: "En stock"}
											</span>
										</>
									)}
								</div>
							)}
						</div>

						{/* Quantity + CTA */}
						{!isAdmin && (
							<div className="flex flex-col gap-3">
								{/* Qty row */}
								{!hasDecants && !isOutOfStock && (
									<div className="flex items-center gap-3">
										<span className="text-xs text-first/40 font-medium uppercase tracking-wider">
											Cantidad
										</span>
										<div className="flex items-center gap-2 rounded-xl border border-first/10 px-3 py-1.5">
											<button
												onClick={() => setQty((q) => Math.max(1, q - 1))}
												className="w-6 h-6 flex items-center justify-center text-first/40 hover:text-first transition-colors cursor-pointer text-lg leading-none"
											>
												−
											</button>
											<span className="text-sm font-semibold text-first tabular-nums w-6 text-center">
												{qty}
											</span>
											<button
												onClick={() =>
													setQty((q) => Math.min(product.stock, q + 1))
												}
												className="w-6 h-6 flex items-center justify-center text-first/40 hover:text-first transition-colors cursor-pointer text-lg leading-none"
											>
												+
											</button>
										</div>
									</div>
								)}

								{/* Action buttons */}
								<div className="flex gap-2">
									<Button
										fullWidth
										size="lg"
										icon={<BsCart3 />}
										onClick={handleAddToCart}
										loading={addingCart}
										disabled={isOutOfStock}
									>
										Agregar al carrito
									</Button>

									{/* Favorite */}
									<button
										onClick={handleToggleFavorite}
										disabled={togglingFav}
										aria-label={
											isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
										}
										className={[
											"w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0",
											isFavorite
												? "border-error/40 bg-error/8 text-error"
												: "border-first/12 text-first/30 hover:border-error/30 hover:text-error hover:bg-error/5",
										].join(" ")}
									>
										{isFavorite ? (
											<BsHeartFill className="w-4 h-4" />
										) : (
											<BsHeart className="w-4 h-4" />
										)}
									</button>

									{/* WhatsApp */}
									<button
										onClick={handleWhatsApp}
										aria-label="Consultar por WhatsApp"
										className="w-12 h-12 rounded-xl border border-first/12 flex items-center justify-center text-first/30 hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all duration-200 cursor-pointer shrink-0"
									>
										<BsWhatsapp className="w-4 h-4" />
									</button>
								</div>
							</div>
						)}

						{/* Info table */}
						<div className="rounded-xl overflow-hidden">
							<InfoRow
								icon={<BsBookmark className="w-3.5 h-3.5" />}
								label="Marca"
								value={product.brand?.name}
								to={`/store/brand/${product.brand?.id}`}
								navigate={navigate}
							/>
							<InfoRow
								icon={<BsTag className="w-3.5 h-3.5" />}
								label="Categoría"
								value={product.category?.name}
								to={`/store/category/${product.category?.id}`}
								navigate={navigate}
							/>
							<InfoRow
								icon={<BsLayers className="w-3.5 h-3.5" />}
								label="Segmento"
								value={product.segment?.name}
								to={`/store/segment/${product.segment?.id}`}
								navigate={navigate}
							/>
							{product.size && !hasDecants && (
								<InfoRow
									icon={<BsBoxSeam className="w-3.5 h-3.5" />}
									label="Tamaño"
									value={product.size}
								/>
							)}
						</div>

						{/* Olfactory notes */}
						{product.notes?.length > 0 && (
							<div className="flex flex-col gap-2">
								<p className="text-xs font-semibold uppercase tracking-widest text-first/40 flex items-center gap-2">
									<BsDroplet className="w-3.5 h-3.5" />
									Acordes Olfativos
								</p>
								<div className="flex flex-wrap gap-1.5">
									{product.notes.map((note) => (
										<button
											key={note.id}
											onClick={() => navigate(`/store/note/${note.id}`)}
											className="px-2.5 py-1 rounded-full text-xs font-medium border border-first/10 text-first/50 hover:text-second hover:border-second/25 hover:bg-second/6 transition-all duration-150 cursor-pointer"
										>
											{note.name}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* ── Description ── */}
				{product.description && (
					<div
						className="flex flex-col gap-4 pt-6 border-t border-first/8"
						style={{
							animation: "fadeUp 0.5s ease both",
							animationDelay: "200ms",
						}}
					>
						<h2
							className="text-lg font-semibold text-first/70"
							style={{
								fontFamily: "'Cormorant Garamond', serif",
								fontWeight: 600,
							}}
						>
							Descripción
						</h2>
						<p className="text-sm text-first/55 leading-relaxed max-w-2xl">
							{product.description}
						</p>
					</div>
				)}

				{/* ── Decants list (if viewing a parent perfume) ── */}
				{hasDecants && (
					<div
						className="flex flex-col gap-5 pt-6 border-t border-first/8"
						style={{
							animation: "fadeUp 0.5s ease both",
							animationDelay: "240ms",
						}}
					>
						<div className="flex items-center gap-2">
							<BsDroplet className="w-4 h-4 text-second/60" />
							<h2
								className="text-lg font-semibold text-first/70"
								style={{ fontFamily: "'Cormorant Garamond', serif" }}
							>
								Decants disponibles
							</h2>
							<span className="text-xs bg-second/10 text-second border border-second/20 rounded-full px-2 py-0.5 font-medium">
								{decants.length}
							</span>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
							{decants.map((d, i) => (
								<button
									key={d.id}
									onClick={() => navigate(`/store/product/${d.id}`)}
									className="flex flex-col gap-2 p-4 rounded-xl border border-first/8 hover:border-second/30 hover:bg-second/4 transition-all duration-200 cursor-pointer text-left group"
									style={{
										animation: "fadeUp 0.4s ease both",
										animationDelay: `${i * 50}ms`,
									}}
								>
									<div className="flex items-center justify-between">
										<span className="text-sm font-bold text-first">
											{d.size}
										</span>
										{d.stock === 0 ? (
											<Badge variant="neutral" size="sm">
												Agotado
											</Badge>
										) : d.stock <= 5 ? (
											<Badge variant="warning" size="sm">
												{d.stock} disp.
											</Badge>
										) : (
											<Badge variant="success" size="sm">
												Stock
											</Badge>
										)}
									</div>
									<div className="flex items-baseline gap-3">
										<span
											className="font-semibold text-first tabular-nums"
											style={{
												fontFamily: "'Cinzel', serif",
												fontSize: "clamp(1.5rem, 3vw, 2rem)",
											}}
										>
											{formatPrice(discountedPrice(d.discount, d.price))}
										</span>
										{hasDiscount && (
											<span className="text-base text-first/30 line-through tabular-nums">
												{formatPrice(d.price)}
											</span>
										)}
									</div>
									<span
										className="text-xs font-medium transition-colors"
										style={{ color: "var(--color-second)", opacity: 0 }}
									>
										Ver detalle →
									</span>
									<style>{`button:hover > span:last-child { opacity: 0.7 !important; }`}</style>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductView;
