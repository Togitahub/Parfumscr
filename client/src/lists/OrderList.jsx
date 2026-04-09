/**
 * OrderList Component
 *
 * Lista de órdenes con búsqueda, filtro por estado y paginación.
 * Animaciones de entrada escalonadas.
 *
 * Props:
 * - orders: Order[]
 * - loading: boolean
 * - variant: "default" | "compact" — compact para el perfil del usuario
 * - className: string
 */

import { useState, useMemo } from "react";
import { BsSearch, BsX, BsReceipt } from "react-icons/bs";
import OrderCard from "../components/cards/OrderCardV2";
import EmptyState from "../components/interface/EmptyState";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = [
	{ value: "ALL", label: "Todos" },
	{ value: "SOLICITADO_WS", label: "Solicitados" },
	{ value: "EN_PROCESO", label: "En proceso" },
	{ value: "COMPLETADO", label: "Completados" },
	{ value: "CANCELADO", label: "Cancelados" },
];

const PAGE_SIZE = 10;

// ── Shimmer skeleton ──────────────────────────────────────────────────────────

const OrderSkeleton = ({ compact }) => (
	<div
		className={[
			"rounded-2xl border border-first/8 flex flex-col gap-4",
			compact ? "p-4" : "p-5",
		].join(" ")}
	>
		{/* Header */}
		<div className="flex items-start justify-between gap-3">
			<div className="flex flex-col gap-1.5">
				<div className="h-2.5 w-12 bg-first/8 rounded-full shimmer" />
				<div className="h-4 w-28 bg-first/8 rounded-full shimmer" />
			</div>
			<div className="h-6 w-20 bg-first/8 rounded-full shimmer" />
		</div>
		{/* Items (solo en default) */}
		{!compact && (
			<div className="flex flex-col gap-2">
				<div className="h-3 w-full bg-first/8 rounded-full shimmer" />
				<div className="h-3 w-3/4 bg-first/8 rounded-full shimmer" />
			</div>
		)}
		{/* Footer */}
		<div className="flex items-center justify-between pt-3 border-t border-first/8">
			<div className="h-3 w-24 bg-first/8 rounded-full shimmer" />
			<div className="h-5 w-20 bg-first/8 rounded-full shimmer" />
		</div>
	</div>
);

// ── Animated item wrapper ─────────────────────────────────────────────────────

const AnimatedItem = ({ children, index }) => (
	<div
		style={{
			animation: "fadeUp 0.4s ease both",
			animationDelay: `${Math.min(index * 60, 400)}ms`,
		}}
	>
		{children}
	</div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const OrderList = ({
	orders = [],
	loading = false,
	variant = "default",
	onDelete,
	className = "",
}) => {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [page, setPage] = useState(1);

	const isCompact = variant === "compact";

	// ── Filter + paginate ─────────────────────────────────────────────────────

	const filtered = useMemo(() => {
		let result = orders;

		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(o) =>
					o.id?.toLowerCase().includes(q) ||
					o.orderItems?.some((item) => item.name?.toLowerCase().includes(q)),
			);
		}

		if (statusFilter !== "ALL") {
			result = result.filter((o) => o.status === statusFilter);
		}

		return result;
	}, [orders, search, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const paginated = filtered.slice(
		(safePage - 1) * PAGE_SIZE,
		safePage * PAGE_SIZE,
	);

	const handleSearch = (val) => {
		setSearch(val);
		setPage(1);
	};
	const handleStatus = (val) => {
		setStatusFilter(val);
		setPage(1);
	};

	const animKey = `${search}-${statusFilter}-${safePage}`;

	return (
		<div className={["flex flex-col gap-5", className].join(" ")}>
			{/* ── Top bar ── */}
			<div className="flex flex-col sm:flex-row gap-3">
				{/* Search */}
				<div className="relative flex items-center flex-1">
					<span className="absolute left-3 text-first/35 pointer-events-none">
						<BsSearch className="w-4 h-4" />
					</span>
					<input
						type="text"
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Buscar por ID o producto..."
						className="w-full h-10 pl-9 pr-9 rounded-xl border border-first/15 bg-main text-sm text-first placeholder:text-first/30 focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second transition-all duration-150"
					/>
					{search && (
						<button
							onClick={() => handleSearch("")}
							className="absolute right-3 text-first/30 hover:text-first/60 transition-colors cursor-pointer"
						>
							<BsX className="w-4 h-4" />
						</button>
					)}
				</div>

				{/* Status filter tabs — solo en modo default */}
				{!isCompact && (
					<div className="flex items-center gap-1 p-1 rounded-xl border border-first/10 bg-main shrink-0 overflow-x-auto">
						{STATUSES.map((s) => (
							<button
								key={s.value}
								onClick={() => handleStatus(s.value)}
								className={[
									"px-3 h-8 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
									statusFilter === s.value
										? "bg-second text-main shadow-sm"
										: "text-first/40 hover:text-first/70",
								].join(" ")}
							>
								{s.label}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Result count */}
			{!loading && (
				<p
					className="text-xs text-first/35"
					style={{ animation: "fadeIn 0.3s ease both" }}
				>
					{filtered.length === 0
						? "Sin órdenes"
						: `${filtered.length} orden${filtered.length !== 1 ? "es" : ""}`}
				</p>
			)}

			{/* Loading skeletons */}
			{loading && (
				<div className="flex flex-col gap-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<OrderSkeleton key={i} compact={isCompact} />
					))}
				</div>
			)}

			{/* Empty state */}
			{!loading && paginated.length === 0 && (
				<div style={{ animation: "fadeUp 0.4s ease both" }}>
					<EmptyState
						icon={<BsReceipt />}
						title="Sin órdenes"
						description={
							search || statusFilter !== "ALL"
								? "Intenta con otros filtros o términos de búsqueda"
								: "Aún no hay órdenes registradas"
						}
					/>
				</div>
			)}

			{/* Orders list */}
			{!loading && paginated.length > 0 && (
				<div key={animKey} className="flex flex-col gap-3">
					{paginated.map((order, i) => (
						<AnimatedItem key={order.id} index={i}>
							<OrderCard
								order={order}
								variant={isCompact ? "compact" : "default"}
								onDelete={onDelete}
							/>
						</AnimatedItem>
					))}
				</div>
			)}

			{/* Pagination */}
			{!loading && totalPages > 1 && (
				<div
					className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
					style={{ animation: "fadeIn 0.4s ease both" }}
				>
					<p className="text-xs text-first/35 tabular-nums">
						Mostrando{" "}
						<span className="text-first/60 font-medium">
							{(safePage - 1) * PAGE_SIZE + 1}–
							{Math.min(safePage * PAGE_SIZE, filtered.length)}
						</span>{" "}
						de{" "}
						<span className="text-first/60 font-medium">{filtered.length}</span>{" "}
						órdenes
					</p>

					<div className="flex items-center gap-1">
						<PageBtn
							disabled={safePage === 1}
							onClick={() => setPage((p) => p - 1)}
						>
							‹
						</PageBtn>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<PageBtn
								key={p}
								active={p === safePage}
								onClick={() => setPage(p)}
							>
								{p}
							</PageBtn>
						))}
						<PageBtn
							disabled={safePage === totalPages}
							onClick={() => setPage((p) => p + 1)}
						>
							›
						</PageBtn>
					</div>
				</div>
			)}
		</div>
	);
};

// ── Internal page button ──────────────────────────────────────────────────────

const PageBtn = ({ children, active, disabled, onClick }) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className={[
			"w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-150",
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

export default OrderList;
