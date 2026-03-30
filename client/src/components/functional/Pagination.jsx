/**
 * Pagination Component
 *
 * Conectado al FilterContext para manejar la página actual.
 *
 * Props:
 * - total: number — total de resultados
 * - totalPages: number — total de páginas
 * - className: string
 */

import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useFilters } from "../../hooks/FilterContext";

// ── Page button ───────────────────────────────────────────────────────────────

const PageButton = ({ children, active, disabled, onClick }) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className={[
			"w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
			"transition-all duration-150",
			active
				? "bg-second text-main cursor-default"
				: disabled
					? "text-first/20 cursor-not-allowed"
					: "text-first/50 hover:bg-first/8 hover:text-first cursor-pointer",
		].join(" ")}
	>
		{children}
	</button>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildPages = (current, total) => {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	const pages = [];

	pages.push(1);

	if (current > 3) pages.push("...");

	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);

	for (let i = start; i <= end; i++) pages.push(i);

	if (current < total - 2) pages.push("...");

	pages.push(total);

	return pages;
};

// ── Component ─────────────────────────────────────────────────────────────────

const Pagination = ({ total = 0, totalPages = 1, className = "" }) => {
	const { page, pageSize, setPage } = useFilters();

	if (totalPages <= 1) return null;

	const pages = buildPages(page, totalPages);
	const from = (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);

	return (
		<div
			className={[
				"flex flex-col sm:flex-row items-center justify-between gap-3",
				className,
			].join(" ")}
		>
			{/* Result count */}
			<p className="text-xs text-first/35 tabular-nums">
				Mostrando{" "}
				<span className="text-first/60 font-medium">
					{from}–{to}
				</span>{" "}
				de <span className="text-first/60 font-medium">{total}</span> resultados
			</p>

			{/* Page buttons */}
			<div className="flex items-center gap-1">
				{/* Prev */}
				<PageButton
					disabled={page === 1}
					onClick={() => setPage(page - 1)}
					aria-label="Página anterior"
				>
					<BsChevronLeft className="w-3.5 h-3.5" />
				</PageButton>

				{/* Page numbers */}
				{pages.map((p, i) =>
					p === "..." ? (
						<span
							key={`ellipsis-${i}`}
							className="w-8 h-8 flex items-center justify-center text-sm text-first/25 select-none"
						>
							…
						</span>
					) : (
						<PageButton key={p} active={p === page} onClick={() => setPage(p)}>
							{p}
						</PageButton>
					),
				)}

				{/* Next */}
				<PageButton
					disabled={page === totalPages}
					onClick={() => setPage(page + 1)}
					aria-label="Página siguiente"
				>
					<BsChevronRight className="w-3.5 h-3.5" />
				</PageButton>
			</div>
		</div>
	);
};

export default Pagination;
