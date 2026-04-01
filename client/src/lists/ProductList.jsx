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

import { useState, useEffect, useRef } from "react";
import {
	BsGrid3X3Gap,
	BsList,
	BsBoxSeam,
	BsPencil,
	BsTrash,
	BsDroplet,
	BsShop,
} from "react-icons/bs";
import ProductCard from "../components/cards/ProductCard";
import Filters from "../components/functional/Filters";
import SearchBar from "../components/functional/SearchBar";
import Pagination from "../components/functional/Pagination";
import EmptyState from "../components/interface/EmptyState";
import Button from "../components/common/Button";
import { useFilters } from "../hooks/FilterContext";

// ── Shimmer skeleton ──────────────────────────────────────────────────────────

const ProductSkeleton = ({ variant = "grid" }) => (
	<div
		className={[
			"rounded-2xl border border-first/8 overflow-hidden",
			variant === "list" ? "flex gap-4 p-4" : "",
		].join(" ")}
	>
		{/* Image */}
		<div
			className={[
				"bg-first/5 shimmer",
				variant === "list"
					? "w-24 h-24 rounded-xl shrink-0"
					: "aspect-4/3 w-full",
			].join(" ")}
		/>
		{/* Content */}
		<div
			className={[
				"flex flex-col gap-3 flex-1",
				variant === "list" ? "" : "p-4",
			].join(" ")}
		>
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
	const { applyFilters, activeFilterCount, search } = useFilters();
	const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
	const [filtersOpen, setFiltersOpen] = useState(false);
	const prevKeyRef = useRef("");

	const { items, total, totalPages } = applyFilters(products, locked);

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

				{/* View mode toggle */}
				<div className="flex items-center gap-1 p-1 rounded-xl border border-first/10 bg-main shrink-0">
					<button
						onClick={() => setViewMode("grid")}
						className={[
							"w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer",
							viewMode === "grid"
								? "bg-second text-main shadow-sm"
								: "text-first/35 hover:text-first/70",
						].join(" ")}
						aria-label="Vista grilla"
					>
						<BsGrid3X3Gap className="w-3.5 h-3.5" />
					</button>
					<button
						onClick={() => setViewMode("list")}
						className={[
							"w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer",
							viewMode === "list"
								? "bg-second text-main shadow-sm"
								: "text-first/35 hover:text-first/70",
						].join(" ")}
						aria-label="Vista lista"
					>
						<BsList className="w-4 h-4" />
					</button>
				</div>

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

			{/* ── Layout: sidebar + content ── */}
			<div className="flex gap-6 items-start">
				{/* ── Filters sidebar ── */}
				{showFilters && (
					<aside
						className={[
							"shrink-0 w-60",
							// En mobile se muestra/oculta; en desktop siempre visible
							"hidden lg:block",
						].join(" ")}
					>
						<Filters
							locked={locked}
							brands={brands}
							categories={categories}
							segments={segments}
							notes={notes}
						/>
					</aside>
				)}

				{/* ── Mobile filters drawer ── */}
				{showFilters && filtersOpen && (
					<div className="lg:hidden fixed inset-0 z-40 flex">
						{/* Overlay */}
						<div
							className="absolute inset-0 bg-black/50 backdrop-blur-sm"
							onClick={() => setFiltersOpen(false)}
							style={{ animation: "fadeIn 0.2s ease both" }}
						/>
						{/* Panel */}
						<div
							className="relative ml-auto w-72 h-full bg-main overflow-y-auto border-l border-first/10"
							style={{ animation: "fadeUp 0.25s ease both" }}
						>
							<div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-first/10 bg-main z-10">
								<span className="text-sm font-semibold text-first">
									Filtros
								</span>
								<button
									onClick={() => setFiltersOpen(false)}
									className="w-8 h-8 rounded-lg flex items-center justify-center text-first/40 hover:text-first/70 hover:bg-first/8 transition-all cursor-pointer"
								>
									✕
								</button>
							</div>
							<div className="p-4">
								<Filters
									locked={locked}
									brands={brands}
									categories={categories}
									segments={segments}
									notes={notes}
								/>
							</div>
						</div>
					</div>
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
						<div
							className={[
								viewMode === "grid"
									? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
									: "flex flex-col gap-3",
							].join(" ")}
						>
							{Array.from({ length: skeletonCount }).map((_, i) => (
								<ProductSkeleton key={i} variant={viewMode} />
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
							className={[
								viewMode === "grid"
									? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
									: "flex flex-col gap-3",
							].join(" ")}
						>
							{items.map((product, i) => (
								<AnimatedCard key={product.id} index={i}>
									<div className="relative group/item">
										<ProductCard
											product={product}
											variant={viewMode === "list" ? "compact" : "default"}
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
													variant="ghost"
													icon={<BsDroplet />} // ← agregar
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
