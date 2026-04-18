/**
 * UserList Component
 *
 * Lista de usuarios con búsqueda local, filtro por rol y paginación.
 * Animaciones de entrada escalonadas. Para uso en AdminView.
 *
 * Props:
 * - users: User[]
 * - loading: boolean
 * - onEdit: (user) => void
 * - onDelete: (user) => void
 * - className: string
 */

import { useState, useMemo } from "react";
import { BsSearch, BsX, BsPeople } from "react-icons/bs";
import UserCard from "../components/Cards/UserCard";
import EmptyState from "../components/interface/EmptyState";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = [
	{ value: "ALL", label: "Todos" },
	{ value: "COSTUMER", label: "Clientes" },
	{ value: "ADMIN", label: "Admins" },
	{ value: "SUPER_ADMIN", label: "Super Admins" },
];

const PAGE_SIZE = 12;

// ── Shimmer skeleton ──────────────────────────────────────────────────────────

const UserSkeleton = () => (
	<div className="rounded-2xl border border-first/8 p-5 flex flex-col gap-4">
		<div className="flex items-center gap-3">
			<div className="w-11 h-11 rounded-full bg-first/8 shimmer shrink-0" />
			<div className="flex flex-col gap-2 flex-1">
				<div className="h-4 w-1/2 bg-first/8 rounded-full shimmer" />
				<div className="h-3 w-1/4 bg-first/8 rounded-full shimmer" />
			</div>
		</div>
		<div className="flex flex-col gap-2">
			<div className="h-3 w-3/4 bg-first/8 rounded-full shimmer" />
			<div className="h-3 w-1/2 bg-first/8 rounded-full shimmer" />
			<div className="h-3 w-2/3 bg-first/8 rounded-full shimmer" />
		</div>
	</div>
);

// ── Animated item wrapper ─────────────────────────────────────────────────────

const AnimatedItem = ({ children, index }) => (
	<div
		style={{
			animation: "fadeUp 0.4s ease both",
			animationDelay: `${Math.min(index * 50, 350)}ms`,
		}}
	>
		{children}
	</div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const UserList = ({
	users = [],
	loading = false,
	onEdit,
	onDelete,
	onToggleActive,
	stores = [],
	onTogglePos,
	onToggleHomeShow,
	className = "",
}) => {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");
	const [page, setPage] = useState(1);

	// ── Filter + paginate ─────────────────────────────────────────────────────

	const filtered = useMemo(() => {
		let result = users;

		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(u) =>
					u.name?.toLowerCase().includes(q) ||
					u.email?.toLowerCase().includes(q) ||
					u.phone?.toLowerCase().includes(q),
			);
		}

		if (roleFilter !== "ALL") {
			result = result.filter((u) => u.role === roleFilter);
		}

		return result;
	}, [users, search, roleFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const paginated = filtered.slice(
		(safePage - 1) * PAGE_SIZE,
		safePage * PAGE_SIZE,
	);

	// Reset page when filters change
	const handleSearch = (val) => {
		setSearch(val);
		setPage(1);
	};
	const handleRole = (val) => {
		setRoleFilter(val);
		setPage(1);
	};

	const animKey = `${search}-${roleFilter}-${safePage}`;

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
						placeholder="Buscar por nombre, correo o teléfono..."
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

				{/* Role filter tabs */}
				<div className="flex items-center gap-1 p-1 rounded-xl border border-first/10 bg-main shrink-0">
					{ROLES.map((r) => (
						<button
							key={r.value}
							onClick={() => handleRole(r.value)}
							className={[
								"px-3 h-8 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
								roleFilter === r.value
									? "bg-second text-main shadow-sm"
									: "text-first/40 hover:text-first/70",
							].join(" ")}
						>
							{r.label}
						</button>
					))}
				</div>
			</div>

			{/* Result count */}
			{!loading && (
				<p
					className="text-xs text-first/35"
					style={{ animation: "fadeIn 0.3s ease both" }}
				>
					{filtered.length === 0
						? "Sin resultados"
						: `${filtered.length} usuario${filtered.length !== 1 ? "s" : ""}`}
				</p>
			)}

			{/* Loading skeletons */}
			{loading && (
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<UserSkeleton key={i} />
					))}
				</div>
			)}

			{/* Empty state */}
			{!loading && paginated.length === 0 && (
				<div style={{ animation: "fadeUp 0.4s ease both" }}>
					<EmptyState
						icon={<BsPeople />}
						title="Sin usuarios"
						description={
							search || roleFilter !== "ALL"
								? "Intenta con otros filtros o términos de búsqueda"
								: "Aún no hay usuarios registrados"
						}
					/>
				</div>
			)}

			{/* User grid */}
			{!loading && paginated.length > 0 && (
				<div
					key={animKey}
					className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
				>
					{paginated.map((user, i) => (
						<AnimatedItem key={user.id} index={i}>
							<UserCard
								user={user}
								onEdit={onEdit}
								onDelete={onDelete}
								onToggleActive={onToggleActive}
								onTogglePos={onTogglePos}
								onToggleHomeShow={onToggleHomeShow}
								store={stores.find((s) => s.owner === user.id)}
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
						usuarios
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

export default UserList;
