/**
 * Filters Component
 *
 * Panel de filtros conectado al FilterContext.
 * Los filtros disponibles se adaptan según los `locked` del contexto.
 *
 * Props:
 * - locked: object — filtros ya fijos por el contexto de la vista.
 *     Ej: { categoryId: "abc" } en CategoryView oculta el filtro de categoría.
 *     Ej: { brandId: "xyz" } en BrandView oculta el filtro de marca.
 * - brands: [{ id, name }]
 * - categories: [{ id, name }]
 * - segments: [{ id, name }]
 * - notes: [{ id, name }]
 * - className: string
 */

import { useMemo, useState } from "react";

import { BsSliders, BsX, BsChevronDown, BsChevronUp } from "react-icons/bs";

import Button from "../common/Button";

import { useFilters } from "../../hooks/FilterContext";

// ── Collapsible section ───────────────────────────────────────────────────────

const Section = ({ title, children, defaultOpen = true }) => {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="flex flex-col gap-2 py-3 border-b border-first/8 last:border-0">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-first/40 hover:text-first/70 transition-colors cursor-pointer"
			>
				{title}
				{open ? (
					<BsChevronUp className="w-3 h-3" />
				) : (
					<BsChevronDown className="w-3 h-3" />
				)}
			</button>
			{open && <div className="flex flex-col gap-1.5">{children}</div>}
		</div>
	);
};

// ── Radio option ──────────────────────────────────────────────────────────────

const RadioOption = ({ label, active, onClick }) => (
	<button
		type="button"
		onClick={onClick}
		className={[
			"flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-left w-full",
			active
				? "bg-second/10 text-second font-medium"
				: "text-first/50 hover:text-first/80 hover:bg-first/5",
		].join(" ")}
	>
		<span
			className={[
				"w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
				active ? "border-second" : "border-first/25",
			].join(" ")}
		>
			{active && <span className="w-1.5 h-1.5 rounded-full bg-second" />}
		</span>
		{label}
	</button>
);

// ── Chip option (multi-select) ────────────────────────────────────────────────

const ChipOption = ({ label, active, onClick }) => (
	<button
		type="button"
		onClick={onClick}
		className={[
			"px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer",
			active
				? "bg-second text-main border-second"
				: "bg-transparent text-first/50 border-first/15 hover:border-first/35",
		].join(" ")}
	>
		{label}
	</button>
);

// ── Main component ────────────────────────────────────────────────────────────

const Filters = ({
	locked = {},
	brands = [],
	categories = [],
	segments = [],
	notes = [],
	className = "",
}) => {
	const { filters, setFilter, toggleNote, resetFilters, activeFilterCount } =
		useFilters();

	// Calcula cuántos filtros activos hay excluyendo los locked
	const lockedKeys = Object.keys(locked);
	const freeActiveCount =
		activeFilterCount -
		lockedKeys.filter((k) => filters[k] && filters[k] !== "").length;

	const sortedBrands = useMemo(() => {
		return [...brands].sort((a, b) => a.name.localeCompare(b.name));
	}, [brands]);

	const sortedNotes = useMemo(() => {
		return [...notes].sort((a, b) => a.name.localeCompare(b.name));
	}, [notes]);

	return (
		<div
			className={[
				"flex flex-col rounded-2xl border border-first/10 bg-main overflow-hidden",
				className,
			].join(" ")}
		>
			{/* ── Header ── */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-first/10">
				<div className="flex items-center gap-2">
					<BsSliders className="w-4 h-4 text-first/40" />
					<span className="text-sm font-semibold text-first/70">Filtros</span>
					{freeActiveCount > 0 && (
						<span className="text-xs bg-second text-main rounded-full px-1.5 py-0.5 font-bold leading-none">
							{freeActiveCount}
						</span>
					)}
				</div>
				{freeActiveCount > 0 && (
					<Button
						variant="ghost"
						size="xs"
						icon={<BsX />}
						onClick={resetFilters}
					>
						Limpiar
					</Button>
				)}
			</div>

			{/* ── Filter sections ── */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col px-4 gap-x-4 overflow-y-auto">
				{/* Tipo: Perfume / Decant — oculto si locked.isDecant está definido */}
				{locked.isDecant === undefined && (
					<Section title="Tipo">
						<RadioOption
							label="Todos"
							active={filters.isDecant === null}
							onClick={() => setFilter("isDecant", null)}
						/>
						<RadioOption
							label="Perfumes"
							active={filters.isDecant === false}
							onClick={() => setFilter("isDecant", false)}
						/>
						<RadioOption
							label="Decants"
							active={filters.isDecant === true}
							onClick={() => setFilter("isDecant", true)}
						/>
					</Section>
				)}

				{/* Disponibilidad */}
				<Section title="Disponibilidad">
					<RadioOption
						label="Todos"
						active={filters.inStock === null}
						onClick={() => setFilter("inStock", null)}
					/>
					<RadioOption
						label="En stock"
						active={filters.inStock === true}
						onClick={() => setFilter("inStock", true)}
					/>
				</Section>

				{/* Precio */}
				<Section title="Precio (₡)" defaultOpen={false}>
					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col gap-1">
							<label className="text-xs text-first/35">Mínimo</label>
							<input
								type="number"
								placeholder="0"
								value={filters.priceMin}
								onChange={(e) => setFilter("priceMin", e.target.value)}
								className="w-full h-8 px-2 rounded-lg border border-first/15 bg-main text-first text-xs focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second placeholder:text-first/25"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-xs text-first/35">Máximo</label>
							<input
								type="number"
								placeholder="∞"
								value={filters.priceMax}
								onChange={(e) => setFilter("priceMax", e.target.value)}
								className="w-full h-8 px-2 rounded-lg border border-first/15 bg-main text-first text-xs focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second placeholder:text-first/25"
							/>
						</div>
					</div>
				</Section>

				{/* Marca — oculto si locked.brandId */}
				{!locked.brandId && brands.length > 0 && (
					<Section title="Marca" defaultOpen={false}>
						<div className="h-50 overflow-y-auto nav-notes-scroll">
							<RadioOption
								label="Todas"
								active={!filters.brandId}
								onClick={() => setFilter("brandId", "")}
							/>
							{sortedBrands.map((b) => (
								<RadioOption
									key={b.id}
									label={b.name}
									active={filters.brandId === b.id}
									onClick={() =>
										setFilter("brandId", filters.brandId === b.id ? "" : b.id)
									}
								/>
							))}
						</div>
					</Section>
				)}

				{/* Categoría — oculto si locked.categoryId */}
				{!locked.categoryId && categories.length > 0 && (
					<Section title="Categoría" defaultOpen={false}>
						<RadioOption
							label="Todas"
							active={!filters.categoryId}
							onClick={() => setFilter("categoryId", "")}
						/>
						{categories.map((c) => (
							<RadioOption
								key={c.id}
								label={c.name}
								active={filters.categoryId === c.id}
								onClick={() =>
									setFilter(
										"categoryId",
										filters.categoryId === c.id ? "" : c.id,
									)
								}
							/>
						))}
					</Section>
				)}

				{/* Segmento — oculto si locked.segmentId */}
				{!locked.segmentId && segments.length > 0 && (
					<Section title="Segmento" defaultOpen={false}>
						<RadioOption
							label="Todos"
							active={!filters.segmentId}
							onClick={() => setFilter("segmentId", "")}
						/>
						{segments.map((s) => (
							<RadioOption
								key={s.id}
								label={s.name}
								active={filters.segmentId === s.id}
								onClick={() =>
									setFilter("segmentId", filters.segmentId === s.id ? "" : s.id)
								}
							/>
						))}
					</Section>
				)}

				{/* Acordes olfativos — chips multi-select */}
				{notes.length > 0 && (
					<div className="col-span-full lg:col-auto">
						<Section title="Acordes olfativos" defaultOpen={false}>
							<div className="flex flex-wrap gap-1.5 pt-1">
								{sortedNotes.map((n) => (
									<ChipOption
										key={n.id}
										label={n.name}
										active={filters.noteIds.includes(n.id)}
										onClick={() => toggleNote(n.id)}
									/>
								))}
							</div>
							{filters.noteIds.length > 0 && (
								<p className="text-xs text-first/35 mt-1">
									Mostrando perfumes con{" "}
									<span className="text-second font-medium">todos</span> los
									acordes seleccionadas
								</p>
							)}
						</Section>
					</div>
				)}
			</div>
		</div>
	);
};

export default Filters;
