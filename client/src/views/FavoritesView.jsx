import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

// Context

import { useAuth } from "../hooks/AuthContext";
import { useStore } from "../hooks/StoreContext";
import { useToast } from "../hooks/ToastContext";
import { FilterProvider } from "../hooks/FilterContext";

// GraphQL

import {
	ADD_FAVORITE,
	REMOVE_FAVORITE,
} from "../graphql/favorites/FavoritesMutations";

import { GET_NOTES } from "../graphql/note/NoteQueries";
import { GET_BRANDS } from "../graphql/brand/BrandQueries";
import { GET_SEGMENTS } from "../graphql/segment/SegmentQueries";
import { ADD_ITEM_TO_CART } from "../graphql/cart/CartMutations";
import { GET_STORE_PRODUCTS } from "../graphql/store/StoreQueries";
import { GET_CATEGORIES } from "../graphql/category/CategoryQueries";
import { GET_USER_FAVORITES } from "../graphql/favorites/FavoritesQueries";

// Componentes

import ProductList from "../lists/ProductList";
import Button from "../components/common/Button";

// Iconos

import { BsHeart, BsArrowLeft } from "react-icons/bs";

// ── Empty state elegante ──────────────────────────────────────────────────────

const FavoritesEmpty = () => {
	const navigate = useNavigate();

	return (
		<div
			className="flex flex-col items-center justify-center gap-8 py-24 px-4"
			style={{ animation: "fadeUp 0.6s ease both" }}
		>
			{/* Icono ornamental */}
			<div className="relative flex items-center justify-center">
				{/* Anillo exterior */}
				<div
					className="absolute w-28 h-28 rounded-full border"
					style={{
						borderColor:
							"color-mix(in srgb, var(--color-second) 15%, transparent)",
						animation: "heroRotateSlow 18s linear infinite",
					}}
				/>
				{/* Anillo interior punteado */}
				<div
					className="absolute w-20 h-20 rounded-full border border-dashed"
					style={{
						borderColor:
							"color-mix(in srgb, var(--color-first) 10%, transparent)",
						animation: "heroRotateSlow 12s linear infinite reverse",
					}}
				/>
				{/* Corazón central */}
				<div
					className="w-14 h-14 rounded-full flex items-center justify-center"
					style={{
						background:
							"color-mix(in srgb, var(--color-second) 8%, transparent)",
						border:
							"1px solid color-mix(in srgb, var(--color-second) 20%, transparent)",
					}}
				>
					<BsHeart
						className="w-5 h-5"
						style={{ color: "var(--color-second)", opacity: 0.7 }}
					/>
				</div>
			</div>

			{/* Texto */}
			<div className="flex flex-col items-center gap-3 text-center">
				<h2
					className="text-3xl font-light tracking-wide text-first"
					style={{ fontFamily: "'Cormorant Garamond', serif" }}
				>
					Sin favoritos aún
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
					Guarda las fragancias que despiertan tu curiosidad y encuéntralas aquí
					cuando estés listo.
				</p>
			</div>

			<Button
				variant="outline"
				size="md"
				rounded
				onClick={() => navigate("/")}
				icon={<BsArrowLeft />}
			>
				Explorar catálogo
			</Button>
		</div>
	);
};

// ── FavoritesView ─────────────────────────────────────────────────────────────

const FavoritesView = () => {
	const toast = useToast();

	const navigate = useNavigate();

	const { user } = useAuth();
	const { store } = useStore();

	// ── Queries ───────────────────────────────────────────────────────────────

	const {
		data: favoritesData,
		loading: loadingFavorites,
		refetch: refetchFavorites,
	} = useQuery(GET_USER_FAVORITES, {
		variables: { userId: user?.id },
		skip: !user?.id,
	});

	const { data: storeProductsData } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId: store?.storeId },
		skip: !store?.storeId,
	});

	const { data: brandsData } = useQuery(GET_BRANDS);
	const { data: categoriesData } = useQuery(GET_CATEGORIES);
	const { data: segmentsData } = useQuery(GET_SEGMENTS);
	const { data: notesData } = useQuery(GET_NOTES);

	// ── Mutations ─────────────────────────────────────────────────────────────

	const [addFavorite] = useMutation(ADD_FAVORITE);
	const [removeFavorite] = useMutation(REMOVE_FAVORITE);
	const [addToCart] = useMutation(ADD_ITEM_TO_CART);

	// ── Datos derivados ───────────────────────────────────────────────────────

	// Los productos favoritos vienen del campo `products` del documento Favorites.
	// La query GET_USER_FAVORITES solo trae id/name/brand, así que necesitamos
	// enriquecer los datos. Por eso usamos una query dedicada que traiga todo.
	const rawFavoriteProducts = favoritesData?.getUserFavorites?.products ?? [];

	const storeProductsMap = Object.fromEntries(
		(storeProductsData?.getStoreProducts ?? [])
			.filter((sp) => sp?.product)
			.map((sp) => [sp.product.id, sp]),
	);

	const favoriteProducts = rawFavoriteProducts
		.filter((p) => storeProductsMap[p.id])
		.map((p) => {
			const sp = storeProductsMap[p.id];
			return {
				...p,
				price: sp.price ?? p.price,
				stock: sp.stock ?? p.stock,
				discount: sp.discount ?? p.discount ?? 0,
			};
		});

	const favoriteIds = favoriteProducts.map((p) => p.id);

	const brands = brandsData?.getBrands ?? [];
	const categories = categoriesData?.getCategories ?? [];
	const segments = segmentsData?.getSegments ?? [];
	const notes = notesData?.getNotes ?? [];

	// ── Solo para consumidores ──────────────────────────────────────────────────────────────
	if (!user && user.role === "COSTUMER") {
		navigate("/store", { replace: true });
		return null;
	}

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleToggleFavorite = async (productId) => {
		const isFav = favoriteIds.includes(productId);
		try {
			if (isFav) {
				await removeFavorite({ variables: { userId: user.id, productId } });
				toast.success("Eliminado de favoritos");
			} else {
				await addFavorite({ variables: { userId: user.id, productId } });
				toast.success("Agregado a favoritos");
			}
			refetchFavorites();
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const handleAddToCart = async (productId) => {
		try {
			await addToCart({
				variables: { userId: user.id, productId, quantity: 1 },
			});
			toast.success("Agregado al carrito");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div
			className="min-h-screen px-4 py-10 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-7xl mx-auto flex flex-col gap-8">
				{/* ── Header ── */}
				<div
					className="flex flex-col gap-2"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-1.5 mb-4 text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
						style={{ animation: "fadeUp 0.4s ease both" }}
					>
						<BsArrowLeft className="w-4 h-4" />
						Volver
					</button>

					{/* Eyebrow */}
					<p
						className="text-[10px] font-semibold uppercase tracking-[0.3em]"
						style={{
							color: "var(--color-second)",
							fontFamily: "'Cinzel', serif",
						}}
					>
						Mi colección
					</p>

					{/* Título */}
					<div className="flex items-end gap-4">
						<h1
							className="text-4xl font-light tracking-tight text-first leading-none"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							Favoritos
						</h1>

						{/* Contador de favoritos */}
						{!loadingFavorites && favoriteProducts.length > 0 && (
							<span
								className="mb-1 text-sm font-light"
								style={{
									fontFamily: "'Cormorant Garamond', serif",
									fontStyle: "italic",
									color:
										"color-mix(in srgb, var(--color-first) 35%, transparent)",
								}}
							>
								{favoriteProducts.length}{" "}
								{favoriteProducts.length === 1 ? "fragancia" : "fragancias"}
							</span>
						)}
					</div>

					{/* Línea decorativa */}
					<div
						className="mt-1 h-px w-24"
						style={{
							background:
								"linear-gradient(to right, var(--color-second), transparent)",
							opacity: 0.5,
						}}
					/>
				</div>

				{/* ── Contenido ── */}
				{!loadingFavorites && favoriteProducts.length === 0 ? (
					<FavoritesEmpty />
				) : (
					<FilterProvider pageSize={12}>
						<ProductList
							products={favoriteProducts}
							loading={loadingFavorites}
							brands={brands}
							categories={categories}
							segments={segments}
							notes={notes}
							favorites={favoriteIds}
							onToggleFavorite={handleToggleFavorite}
							onAddToCart={handleAddToCart}
							showFilters
						/>
					</FilterProvider>
				)}
			</div>
		</div>
	);
};

export default FavoritesView;
