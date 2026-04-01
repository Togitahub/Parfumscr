/**
 * FilterContext
 *
 * Estado global para búsqueda, filtros y paginación de productos.
 *
 * Exports:
 * - FilterProvider — debe envolver las vistas que usen filtros
 * - useFilters — hook para leer y actualizar filtros
 *
 * Estado:
 * - search: string — texto de búsqueda libre
 * - filters: {
 *     brandId: string,
 *     categoryId: string,
 *     segmentId: string,
 *     noteIds: string[],
 *     inStock: boolean | null,
 *     priceMin: string,
 *     priceMax: string,
 *     isDecant: boolean | null,
 *   }
 * - page: number — página actual (1-indexed)
 * - pageSize: number — resultados por página
 *
 * Helpers:
 * - setSearch(value)
 * - setFilter(key, value)
 * - resetFilters()
 * - setPage(n)
 * - applyFilters(products, locked?) — filtra + pagina un array de productos
 */

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
} from "react";

const FilterContext = createContext(null);

const DEFAULT_FILTERS = {
	brandId: "",
	categoryId: "",
	segmentId: "",
	noteIds: [],
	inStock: null,
	priceMin: "",
	priceMax: "",
	isDecant: null,
};

export const FilterProvider = ({ children, pageSize = 12 }) => {
	const [search, setSearchRaw] = useState("");
	const [filters, setFilters] = useState(DEFAULT_FILTERS);
	const [page, setPageRaw] = useState(1);

	// ── Setters ───────────────────────────────────────────────────────────────

	const setSearch = useCallback((value) => {
		setSearchRaw(value);
		setPageRaw(1);
	}, []);

	const setFilter = useCallback((key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPageRaw(1);
	}, []);

	const toggleNote = useCallback((noteId) => {
		setFilters((prev) => ({
			...prev,
			noteIds: prev.noteIds.includes(noteId)
				? prev.noteIds.filter((id) => id !== noteId)
				: [...prev.noteIds, noteId],
		}));
		setPageRaw(1);
	}, []);

	const resetFilters = useCallback(() => {
		setFilters(DEFAULT_FILTERS);
		setSearchRaw("");
		setPageRaw(1);
	}, []);

	const setPage = useCallback((n) => setPageRaw(n), []);

	// ── Active filter count (excluding locked ones) ────────────────────────────

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.brandId) count++;
		if (filters.categoryId) count++;
		if (filters.segmentId) count++;
		if (filters.noteIds.length > 0) count++;
		if (filters.inStock !== null) count++;
		if (filters.priceMin) count++;
		if (filters.priceMax) count++;
		if (filters.isDecant !== null) count++;
		return count;
	}, [filters]);

	// ── applyFilters ──────────────────────────────────────────────────────────
	// locked: object con keys de DEFAULT_FILTERS que ya están fijos por contexto
	// (ej: { categoryId: "abc123" } en CategoryView)

	const applyFilters = useCallback(
		(products = [], locked = {}) => {
			const mergedFilters = { ...filters, ...locked };

			// 1. Texto libre: busca en nombre, marca, descripción
			let result = products.filter((p) => {
				if (!search.trim()) return true;
				const q = search.toLowerCase();
				return (
					p.name?.toLowerCase().includes(q) ||
					p.brand?.name?.toLowerCase().includes(q) ||
					p.description?.toLowerCase().includes(q)
				);
			});

			// 2. Marca
			if (mergedFilters.brandId) {
				result = result.filter((p) => p.brand?.id === mergedFilters.brandId);
			}

			// 3. Categoría
			if (mergedFilters.categoryId) {
				result = result.filter(
					(p) => p.category?.id === mergedFilters.categoryId,
				);
			}

			// 4. Segmento
			if (mergedFilters.segmentId) {
				result = result.filter(
					(p) => p.segment?.id === mergedFilters.segmentId,
				);
			}

			// 5. Acordes olfativos (el producto debe tener TODOS los acordes seleccionados)
			if (mergedFilters.noteIds.length > 0) {
				result = result.filter((p) =>
					mergedFilters.noteIds.every((noteId) =>
						p.notes?.some((n) => n.id === noteId),
					),
				);
			}

			// 6. Stock
			if (mergedFilters.inStock === true) {
				result = result.filter((p) => p.stock > 0);
			}

			// 7. Precio mínimo
			if (mergedFilters.priceMin !== "") {
				result = result.filter(
					(p) => p.price >= parseFloat(mergedFilters.priceMin),
				);
			}

			// 8. Precio máximo
			if (mergedFilters.priceMax !== "") {
				result = result.filter(
					(p) => p.price <= parseFloat(mergedFilters.priceMax),
				);
			}

			// 9. Decant / Perfume
			if (mergedFilters.isDecant !== null) {
				result = result.filter((p) => p.isDecant === mergedFilters.isDecant);
			}

			// ── Pagination ────────────────────────────────────────────────────
			const total = result.length;
			const totalPages = Math.max(1, Math.ceil(total / pageSize));
			const safePage = Math.min(page, totalPages);
			const start = (safePage - 1) * pageSize;
			const paginated = result.slice(start, start + pageSize);

			return { items: paginated, total, totalPages, currentPage: safePage };
		},
		[search, filters, page, pageSize],
	);

	const value = {
		search,
		filters,
		page,
		pageSize,
		activeFilterCount,
		setSearch,
		setFilter,
		toggleNote,
		resetFilters,
		setPage,
		applyFilters,
	};

	return (
		<FilterContext.Provider value={value}>{children}</FilterContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = () => {
	const ctx = useContext(FilterContext);
	if (!ctx) throw new Error("useFilters must be used within a FilterProvider");
	return ctx;
};
