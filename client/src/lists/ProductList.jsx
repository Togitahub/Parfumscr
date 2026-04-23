/**
 * ProductList Component
 *
 * Lista de productos con filtros, búsqueda y paginación integrados.
 * Soporta modo grilla y modo lista. Animaciones de entrada escalonadas.
 *
 * Props:
 * - products: Product[] — array completo (sin paginar, el componente lo hace)
 * - loading: boolean
 * - locked: object — filtros fijos por contexto ({ brandId, categoryId, segmentId, isDecant })
 * - brands: [{ id, name }]
 * - categories: [{ id, name }]
 * - segments: [{ id, name }]
 * - notes: [{ id, name }]
 * - favorites: string[] — ids de productos favoritos del usuario
 * - onToggleFavorite: (productId) => void
 * - onAddToCart: (productId) => void
 * - showFilters: boolean (default: true)
 * - showAdminActions: boolean (default: false) — muestra botones editar/eliminar
 * - onEdit: (product) => void
 * - onDelete: (product) => void
 * - className: string
 */

import { useState, useEffect, useRef, useMemo } from "react";

import {
	BsBoxSeam,
	BsPencil,
	BsTrash,
	BsDroplet,
	BsShop,
} from "react-icons/bs";

import ProductCard from "../components/Cards/ProductCard";
import Filters from "../components/functional/Filters";
import SearchBar from "../components/functional/SearchBar";
import Pagination from "../components/functional/Pagination";
import EmptyState from "../components/interface/EmptyState";
import Button from "../components/common/Button";

import { useFilters } from "../hooks/FilterContext";

// ── Shimmer skeleton ──────────────────────────────────────────────────────────

const ProductSkeleton = () => (
	<div className="rounded-2xl border border-first/8 overflow-hidden">
		{/* Image */}
		<div className="bg-first/5 shimmer aspect-4/3 w-full" />
		{/* Content */}
		<div className="flex flex-col gap-3 flex-1 p-4">
			<div className="h-2.5 w-1/3 bg-first/8 rounded-full shimmer" />
			<div className="h-4 w-2/3 bg-first/8 rounded-full shimmer" />
			<div className="h-3 w-1/2 bg-first/8 rounded-full shimmer" />
			<div className="mt-auto h-5 w-1/4 bg-first/8 rounded-full shimmer" />
		</div>
	</div>
);

// ── Animated card wrapper ─────────────────────────────────────────────────────

const AnimatedCard = ({ children, index }) => (
	<div
		style={{
			animation: `fadeUp 0.4s ease both`,
			animationDelay: `${Math.min(index * 60, 400)}ms`,
		}}
	>
		{children}
	</div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const ProductList = ({
	products = [],
	loading = false,
	locked = {},
	brands = [],
	categories = [],
	segments = [],
	notes = [],
	favorites = [],
	onToggleFavorite,
	onAddToCart,
	showFilters = true,
	showAdminActions = false,
	onToggleStore,
	storeProductIds,
	onEdit,
	onDelete,
	onAddDecant,
	className = "",
}) => {
	const { applyFilters, activeFilterCount, search, filterKey } = useFilters();
	const [filtersOpen, setFiltersOpen] = useState(false);
	const prevKeyRef = useRef("");

	const { items, total, totalPages } = useMemo(
		() => applyFilters(products, locked),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filterKey, products],
	);

	// Reset animation key cuando cambian los resultados
	const animKey = `${search}-${total}-${JSON.stringify(locked)}`;
	useEffect(() => {
		prevKeyRef.current = animKey;
	}, [animKey]);

	const skeletonCount = 8;

	return (
		<div className={["flex flex-col gap-6", className].join(" ")}>
			{/* ── Top bar: search + view toggle + filter toggle ── */}
			<div className="flex items-center gap-3">
				<SearchBar className="flex-1" />

				{/* Filter toggle (mobile / sidebar trigger) */}
				{showFilters && (
					<button
						onClick={() => setFiltersOpen((v) => !v)}
						className={[
							"lg:hidden flex items-center gap-2 h-10 px-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer shrink-0",
							filtersOpen || activeFilterCount > 0
								? "border-second text-second bg-second/5"
								: "border-first/10 text-first/50 hover:border-first/25",
						].join(" ")}
					>
						Filtros
						{activeFilterCount > 0 && (
							<span className="w-5 h-5 rounded-full bg-second text-main text-xs font-bold flex items-center justify-center">
								{activeFilterCount}
							</span>
						)}
					</button>
				)}
			</div>

			{/* ── Mobile filters drawer ── */}
			{showFilters && filtersOpen && (
				<div className="lg:hidden">
					<Filters
						locked={locked}
						brands={brands}
						categories={categories}
						segments={segments}
						notes={notes}
					/>
				</div>
			)}

			{/* ── Layout: sidebar + content ── */}
			<div className="flex gap-6 items-start">
				{/* ── Filters sidebar ── */}
				{showFilters && (
					<aside className={["shrink-0 w-60", "hidden lg:block"].join(" ")}>
						<Filters
							locked={locked}
							brands={brands}
							categories={categories}
							segments={segments}
							notes={notes}
						/>
					</aside>
				)}

				{/* ── Product grid / list ── */}
				<div className="flex-1 min-w-0 flex flex-col gap-6">
					{/* Result count */}
					{!loading && (
						<p
							className="text-xs text-first/35"
							style={{ animation: "fadeIn 0.3s ease both" }}
						>
							{total === 0
								? "Sin resultados"
								: `${total} producto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
						</p>
					)}

					{/* Loading skeletons */}
					{loading && (
						<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
							{Array.from({ length: skeletonCount }).map((_, i) => (
								<ProductSkeleton key={i} />
							))}
						</div>
					)}

					{/* Empty state */}
					{!loading && items.length === 0 && (
						<div style={{ animation: "fadeUp 0.4s ease both" }}>
							<EmptyState
								icon={<BsBoxSeam />}
								title="Sin resultados"
								description="Intenta con otros filtros o términos de búsqueda"
								size="md"
							/>
						</div>
					)}

					{/* Products */}
					{!loading && items.length > 0 && (
						<div
							key={animKey}
							className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
						>
							{items.map((product, i) => (
								<AnimatedCard key={product.id} index={i}>
									<div className="relative group/item">
										<ProductCard
											product={product}
											variant={"default"}
											isFavorite={favorites.includes(product.id)}
											onToggleFavorite={onToggleFavorite}
											onAddToCart={onAddToCart}
										/>
										{/* Admin action overlay */}
										{showAdminActions && (
											<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 z-20">
												{onEdit && (
													<Button
														iconOnly
														size="xs"
														variant="secondary"
														icon={<BsPencil />}
														onClick={(e) => {
															e.stopPropagation();
															onEdit?.(product);
														}}
														aria-label="Editar producto"
													/>
												)}
												{onDelete && (
													<Button
														iconOnly
														size="xs"
														variant="danger"
														icon={<BsTrash />}
														onClick={(e) => {
															e.stopPropagation();
															onDelete?.(product);
														}}
														aria-label="Eliminar producto"
													/>
												)}
												<Button
													iconOnly
													size="xs"
													variant="primary"
													icon={<BsDroplet />}
													onClick={(e) => {
														e.stopPropagation();
														onAddDecant?.(product);
													}}
													aria-label="Crear decant"
												/>
												{onToggleStore && (
													<Button
														iconOnly
														size="xs"
														variant={
															storeProductIds?.has(product.id)
																? "primary"
																: "outline"
														}
														icon={<BsShop />}
														onClick={(e) => {
															e.stopPropagation();
															onToggleStore?.(product);
														}}
														aria-label={
															storeProductIds?.has(product.id)
																? "Quitar de tienda"
																: "Agregar a tienda"
														}
													/>
												)}
											</div>
										)}
									</div>
								</AnimatedCard>
							))}
						</div>
					)}

					{/* Pagination */}
					{!loading && totalPages > 1 && (
						<div style={{ animation: "fadeIn 0.4s ease both" }}>
							<Pagination total={total} totalPages={totalPages} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProductList;
