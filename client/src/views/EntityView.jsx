import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { FilterProvider } from "../hooks/FilterContext";
import { useStore } from "../hooks/StoreContext";

import { GET_STORE_PRODUCTS } from "../graphql/store/StoreQueries";
import { GET_NOTE } from "../graphql/note/NoteQueries";
import { GET_BRAND } from "../graphql/brand/BrandQueries";
import { GET_CATEGORY } from "../graphql/category/CategoryQueries";
import { GET_SEGMENT } from "../graphql/segment/SegmentQueries";
import { GET_BRANDS } from "../graphql/brand/BrandQueries";
import { GET_CATEGORIES } from "../graphql/category/CategoryQueries";
import { GET_SEGMENTS } from "../graphql/segment/SegmentQueries";
import { GET_NOTES } from "../graphql/note/NoteQueries";
import { GET_USER_FAVORITES } from "../graphql/favorites/FavoritesQueries";
import {
	ADD_FAVORITE,
	REMOVE_FAVORITE,
} from "../graphql/favorites/FavoritesMutations";
import { ADD_ITEM_TO_CART } from "../graphql/cart/CartMutations";

import ProductList from "../lists/ProductList";
import { Spinner } from "../components/interface/LoadingUi";
import Button from "../components/common/Button";
import { BsArrowLeft } from "react-icons/bs";

// ── Configuración por tipo de entidad ────────────────────────────────────────

const CONFIG = {
	brand: {
		query: GET_BRAND,
		dataKey: "getBrand",
		lockedKey: "brandId",
		emptyText: "Esta marca no tiene productos aún",
	},
	category: {
		query: GET_CATEGORY,
		dataKey: "getCategory",
		lockedKey: "categoryId",
		emptyText: "Esta categoría no tiene productos aún",
	},
	segment: {
		query: GET_SEGMENT,
		dataKey: "getSegment",
		lockedKey: "segmentId",
		emptyText: "Este segmento no tiene productos aún",
	},
	note: {
		query: GET_NOTE,
		dataKey: "getNote",
		lockedKey: "noteId",
		emptyText: "Esta nota no tiene productos aún",
	},
};

// ── EntityView ────────────────────────────────────────────────────────────────

/**
 * EntityView
 *
 * Vista reutilizable para Brand, Category y Segment.
 * Recibe `type`: "brand" | "category" | "segment"
 *
 * Uso en App.jsx:
 *   <Route path="/brands/:id"     element={<EntityView type="brand" />} />
 *   <Route path="/categories/:id" element={<EntityView type="category" />} />
 *   <Route path="/segments/:id"   element={<EntityView type="segment" />} />
 */
const EntityView = ({ type }) => {
	const { id } = useParams();

	const navigate = useNavigate();

	const toast = useToast();
	const { store } = useStore();
	const { user, isAuthenticated } = useAuth();

	const config = CONFIG[type];

	// ── Query de la entidad principal ─────────────────────────────────────────
	const { data, loading, error } = useQuery(config.query, {
		variables: { id },
		skip: !id,
	});

	// ── Queries auxiliares para filtros ───────────────────────────────────────
	const { data: brandsData } = useQuery(GET_BRANDS);
	const { data: categoriesData } = useQuery(GET_CATEGORIES);
	const { data: segmentsData } = useQuery(GET_SEGMENTS);
	const { data: notesData } = useQuery(GET_NOTES);

	// ── Store ─────────────────────────────────────────────────────────────\
	const { data: storeProductsData } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId: store?.storeId },
		skip: !store?.storeId,
	});

	// ── Favoritos ─────────────────────────────────────────────────────────────
	const { data: favoritesData, refetch: refetchFavorites } = useQuery(
		GET_USER_FAVORITES,
		{
			variables: { userId: user?.id },
			skip: !isAuthenticated || !user?.id,
		},
	);

	// ── Mutations ─────────────────────────────────────────────────────────────
	const [addFavorite] = useMutation(ADD_FAVORITE);
	const [removeFavorite] = useMutation(REMOVE_FAVORITE);
	const [addToCart] = useMutation(ADD_ITEM_TO_CART);

	// ── Datos derivados ───────────────────────────────────────────────────────
	const entity = data?.[config.dataKey];
	const brands = brandsData?.getBrands ?? [];
	const categories = categoriesData?.getCategories ?? [];
	const segments = segmentsData?.getSegments ?? [];
	const notes = notesData?.getNotes ?? [];
	const favoriteIds =
		favoritesData?.getUserFavorites?.products?.map((p) => p.id) ?? [];

	const storeProductIds = new Set(
		storeProductsData?.getStoreProducts?.map((sp) => sp.product.id) ?? [],
	);

	const allEntityProducts = entity?.products ?? [];

	const products = allEntityProducts
		.filter((p) => storeProductIds.has(p.id))
		.map((p) => {
			const storeProduct = storeProductsData?.getStoreProducts?.find(
				(sp) => sp.product.id === p.id,
			);
			return {
				...p,
				price: storeProduct?.price ?? p.price,
				stock: storeProduct?.stock ?? p.stock,
			};
		});

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleToggleFavorite = async (productId) => {
		if (!isAuthenticated) {
			toast.info("Inicia sesión para guardar favoritos");
			return;
		}
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
		if (!isAuthenticated) {
			toast.info("Inicia sesión para agregar al carrito");
			return;
		}
		try {
			await addToCart({
				variables: { userId: user.id, productId, quantity: 1 },
			});
			toast.success("Agregado al carrito");
		} catch (err) {
			toast.error("Error", { description: err.message });
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

	// ── Error / not found ─────────────────────────────────────────────────────
	if (error || !entity) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
				<p className="text-first/40 text-sm">
					{error
						? "Ocurrió un error al cargar."
						: "No se encontró el elemento."}
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
			<div className="max-w-7xl mx-auto flex flex-col gap-8">
				{/* ── Header ── */}
				<div
					className="flex flex-col gap-4"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					{/* Botón volver */}
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-1.5 text-sm text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
					>
						<BsArrowLeft className="w-3.5 h-3.5" />
						Volver
					</button>

					{/* Nombre de la entidad */}
					<div className="flex flex-col gap-1">
						<p className="text-xs font-semibold uppercase tracking-widest text-second/70">
							{type === "brand"
								? "Marca"
								: type === "category"
									? "Categoría"
									: type === "segment"
										? "Segmento"
										: "Nota olfativa"}
						</p>
						<h1 className="text-3xl font-bold text-first tracking-tight">
							{entity.name}
						</h1>
						<p className="text-sm text-first/40 mt-0.5">
							{products.length === 0
								? config.emptyText
								: `${products.length} producto${products.length !== 1 ? "s" : ""} disponible${products.length !== 1 ? "s" : ""}`}
						</p>
					</div>
				</div>

				{/* ── Lista de productos ── */}
				<FilterProvider pageSize={12}>
					<ProductList
						products={products}
						loading={false}
						locked={{ [config.lockedKey]: id }}
						brands={type !== "brand" ? brands : []}
						categories={type !== "category" ? categories : []}
						segments={type !== "segment" ? segments : []}
						notes={notes}
						favorites={favoriteIds}
						onToggleFavorite={handleToggleFavorite}
						onAddToCart={handleAddToCart}
						showFilters
					/>
				</FilterProvider>
			</div>
		</div>
	);
};

export default EntityView;
