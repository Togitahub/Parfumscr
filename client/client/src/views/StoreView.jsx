import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { useStore } from "../hooks/StoreContext";
import { useCart } from "../hooks/CartContext";
import { FilterProvider } from "../hooks/FilterContext";

import {
	ADD_FAVORITE,
	REMOVE_FAVORITE,
} from "../graphql/favorites/FavoritesMutations";
import { GET_STORE_PRODUCTS } from "../graphql/store/StoreQueries";
import { GET_BRANDS } from "../graphql/brand/BrandQueries";
import { GET_CATEGORIES } from "../graphql/category/CategoryQueries";
import { GET_SEGMENTS } from "../graphql/segment/SegmentQueries";
import { GET_NOTES } from "../graphql/note/NoteQueries";
import { GET_USER_FAVORITES } from "../graphql/favorites/FavoritesQueries";

import Hero from "../components/design/Hero";
import ProductList from "../lists/ProductList";
import NotFoundView from "./NotFoundView";

const StoreView = () => {
	const { user, isAuthenticated } = useAuth();
	const { store, loadingStore, storeNotFound } = useStore();
	const { addItem } = useCart();
	const toast = useToast();

	const { data: storeProductsData, loading: loadingProducts } = useQuery(
		GET_STORE_PRODUCTS,
		{
			variables: { storeId: store?.storeId },
			skip: !store?.storeId,
		},
	);

	const { data: brandsData } = useQuery(GET_BRANDS);
	const { data: categoriesData } = useQuery(GET_CATEGORIES);
	const { data: segmentsData } = useQuery(GET_SEGMENTS);
	const { data: notesData } = useQuery(GET_NOTES);

	const { data: favoritesData, refetch: refetchFavorites } = useQuery(
		GET_USER_FAVORITES,
		{
			variables: { userId: user?.id },
			skip: !isAuthenticated || !user?.id,
		},
	);

	const [addFavorite] = useMutation(ADD_FAVORITE);
	const [removeFavorite] = useMutation(REMOVE_FAVORITE);

	const storeProducts = storeProductsData?.getStoreProducts ?? [];
	const products = storeProducts.map((sp) => ({
		...sp.product,
		price: sp.price ?? sp.product.price,
		stock: sp.stock ?? sp.product.stock,
		discount: sp.discount ?? sp.product.discount ?? 0,
	}));

	const brands = brandsData?.getBrands ?? [];
	const categories = categoriesData?.getCategories ?? [];
	const segments = segmentsData?.getSegments ?? [];
	const notes = notesData?.getNotes ?? [];
	const favoriteIds =
		favoritesData?.getUserFavorites?.products?.map((p) => p.id) ?? [];

	const isShopper = !user || user.role === "COSTUMER";

	if (storeNotFound) return <NotFoundView />;

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
		// Find the full product object from our enriched list
		const product = products.find((p) => p.id === productId);
		if (!product) return;
		try {
			await addItem(product, 1);
			toast.success("Agregado al carrito");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	return (
		<div>
			<Hero />
			<div
				id="catalog"
				className="px-4 py-16 md:px-8 lg:px-12"
				style={{ scrollMarginTop: "80px" }}
			>
				<div className="max-w-7xl mx-auto flex flex-col gap-8">
					<div style={{ animation: "fadeUp 0.4s ease both" }}>
						<h2 className="text-2xl font-bold text-first">Catálogo</h2>
						<p className="text-sm text-first/40 mt-1">
							Explora la colección de {store?.storeName ?? "la tienda"}
						</p>
					</div>

					<FilterProvider pageSize={12}>
						<ProductList
							products={products}
							loading={loadingProducts || loadingStore}
							brands={brands}
							categories={categories}
							segments={segments}
							notes={notes}
							favorites={favoriteIds}
							onToggleFavorite={isShopper ? handleToggleFavorite : undefined}
							onAddToCart={isShopper ? handleAddToCart : undefined}
							showFilters
						/>
					</FilterProvider>
				</div>
			</div>
		</div>
	);
};

export default StoreView;
