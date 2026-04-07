import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
	BsPlus,
	BsSearch,
	BsX,
	BsPencil,
	BsTrash,
	BsWallet2,
	BsTag,
	BsCalendar,
} from "react-icons/bs";

import { useToast } from "../hooks/ToastContext";

import {
	GET_EXPENSES,
	GET_EXPENSE_SUMMARY,
} from "../graphql/expense/ExpenseQueries";
import { DELETE_EXPENSE } from "../graphql/expense/ExpenseMutations";

import Button from "../components/common/Button";
import { Modal, ConfirmDialog } from "../components/interface/Modal";
import { Spinner } from "../components/interface/LoadingUi";
import EmptyState from "../components/interface/EmptyState";
import Badge from "../components/common/Badge";
import ExpenseForm from "../components/forms/ExpenseForm";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
	Inventario: { badge: "info", emoji: "📦" },
	Envíos: { badge: "warning", emoji: "🚚" },
	Marketing: { badge: "error", emoji: "📣" },
	Operativo: { badge: "neutral", emoji: "⚙️" },
	Otro: { badge: "neutral", emoji: "📝" },
};

const PERIODS = [
	{ key: "week", label: "Esta semana" },
	{ key: "month", label: "Este mes" },
	{ key: "year", label: "Este año" },
	{ key: "all", label: "Todo" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (p) =>
	`₡${(p ?? 0).toLocaleString("es-CR", { minimumFractionDigits: 0 })}`;

const formatDate = (dateStr) => {
	if (!dateStr) return "—";
	const d = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr));
	return d.toLocaleDateString("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

// ── Summary cards ─────────────────────────────────────────────────────────────

const SummaryCard = ({ icon, label, value, sub, delay = 0 }) => (
	<div
		className="flex flex-col gap-2 p-5 rounded-2xl border border-first/10 bg-main"
		style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${delay}ms` }}
	>
		<div className="flex items-center justify-between">
			<span className="text-xs font-semibold uppercase tracking-widest text-first/35">
				{label}
			</span>
			<span style={{ color: "var(--color-second)", opacity: 0.6 }}>{icon}</span>
		</div>
		<p
			className="text-2xl font-bold text-first tabular-nums"
			style={{ fontFamily: "'Cinzel', serif" }}
		>
			{value}
		</p>
		{sub && <p className="text-xs text-first/35">{sub}</p>}
	</div>
);

// ── Category breakdown ────────────────────────────────────────────────────────

const CategoryBar = ({ category, total, count, maxTotal }) => {
	const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
	const cfg = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Otro"];

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between gap-3 text-sm">
				<div className="flex items-center gap-2 min-w-0">
					<span>{cfg.emoji}</span>
					<span className="font-medium text-first truncate">{category}</span>
					<span className="text-xs text-first/30">({count})</span>
				</div>
				<span className="font-semibold text-first tabular-nums shrink-0">
					{formatPrice(total)}
				</span>
			</div>
			<div className="w-full h-1.5 rounded-full bg-first/8 overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-700"
					style={{
						width: `${pct}%`,
						background: "var(--color-second)",
						opacity: 0.7,
					}}
				/>
			</div>
		</div>
	);
};

// ── Expense row ───────────────────────────────────────────────────────────────

const ExpenseRow = ({ expense, index, onEdit, onDelete }) => {
	const cfg = CATEGORY_COLORS[expense.category] ?? CATEGORY_COLORS["Otro"];

	return (
		<div
			className="group flex items-center gap-4 py-3.5 border-b border-first/6 last:border-0"
			style={{
				animation: "fadeUp 0.35s ease both",
				animationDelay: `${Math.min(index * 40, 300)}ms`,
			}}
		>
			{/* Category emoji */}
			<div
				className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
				style={{
					background: "color-mix(in srgb, var(--color-second) 8%, transparent)",
					border:
						"1px solid color-mix(in srgb, var(--color-second) 18%, transparent)",
				}}
			>
				{cfg.emoji}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-first truncate">
					{expense.description}
				</p>
				<div className="flex items-center gap-2 mt-0.5">
					<Badge variant={cfg.badge} size="sm">
						{expense.category}
					</Badge>
					<span className="text-xs text-first/35 flex items-center gap-1">
						<BsCalendar className="w-2.5 h-2.5" />
						{formatDate(expense.date)}
					</span>
				</div>
				{expense.notes && (
					<p className="text-xs text-first/35 mt-0.5 truncate italic">
						{expense.notes}
					</p>
				)}
			</div>

			{/* Amount */}
			<span
				className="text-base font-bold text-first tabular-nums shrink-0"
				style={{ fontFamily: "'Cinzel', serif" }}
			>
				{formatPrice(expense.amount)}
			</span>

			{/* Actions */}
			<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
				<Button
					iconOnly
					variant="ghost"
					size="sm"
					icon={<BsPencil />}
					onClick={() => onEdit(expense)}
					aria-label="Editar"
				/>
				<Button
					iconOnly
					variant="ghost"
					size="sm"
					icon={<BsTrash />}
					onClick={() => onDelete(expense)}
					aria-label="Eliminar"
					className="hover:text-error!"
				/>
			</div>
		</div>
	);
};

// ── ExpensesView ──────────────────────────────────────────────────────────────

const ExpensesView = ({ storeId }) => {
	const toast = useToast();

	const [period, setPeriod] = useState("month");
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("ALL");
	const [modalOpen, setModalOpen] = useState(false);
	const [editExpense, setEditExpense] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	const variables = { storeId, period: period === "all" ? null : period };

	const { data: expensesData, loading: loadingExpenses } = useQuery(
		GET_EXPENSES,
		{ variables, skip: !storeId },
	);

	const { data: summaryData, loading: loadingSummary } = useQuery(
		GET_EXPENSE_SUMMARY,
		{ variables, skip: !storeId },
	);

	const [deleteExpense, { loading: deleting }] = useMutation(DELETE_EXPENSE, {
		refetchQueries: [
			{ query: GET_EXPENSES, variables },
			{ query: GET_EXPENSE_SUMMARY, variables },
		],
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const expenses = expensesData?.getExpenses ?? [];
	const summary = summaryData?.getExpenseSummary;
	const totalExpenses = summary?.totalExpenses ?? 0;
	const byCategory = summary?.byCategory ?? [];
	const maxCategoryTotal = Math.max(...byCategory.map((c) => c.total), 1);

	// Unique categories in current data
	const availableCategories = useMemo(() => {
		const cats = [...new Set(expenses.map((e) => e.category))];
		return cats;
	}, [expenses]);

	// Filter expenses
	const filtered = useMemo(() => {
		let result = expenses;
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(e) =>
					e.description.toLowerCase().includes(q) ||
					e.category.toLowerCase().includes(q) ||
					e.notes?.toLowerCase().includes(q),
			);
		}
		if (categoryFilter !== "ALL") {
			result = result.filter((e) => e.category === categoryFilter);
		}
		return result;
	}, [expenses, search, categoryFilter]);

	// Handlers
	const handleEdit = (expense) => {
		setEditExpense(expense);
		setModalOpen(true);
	};

	const handleDelete = (expense) => setDeleteTarget(expense);

	const handleConfirmDelete = async () => {
		try {
			await deleteExpense({ variables: { id: deleteTarget.id } });
			toast.success("Gasto eliminado");
			setDeleteTarget(null);
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setEditExpense(null);
	};

	return (
		<div className="flex flex-col gap-6">
			{/* ── Header ── */}
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div>
					<h2 className="text-base font-semibold text-first">
						Registro de Gastos
					</h2>
					<p className="text-xs text-first/40 mt-0.5">
						{loadingExpenses
							? "Cargando..."
							: `${expenses.length} gasto${expenses.length !== 1 ? "s" : ""} registrado${expenses.length !== 1 ? "s" : ""}`}
					</p>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					{/* Period selector */}
					<div className="flex items-center gap-1 p-1 rounded-xl border border-first/10 bg-main">
						{PERIODS.map((p) => (
							<button
								key={p.key}
								onClick={() => setPeriod(p.key)}
								className={[
									"px-3 h-8 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
									period === p.key
										? "bg-second text-main shadow-sm"
										: "text-first/40 hover:text-first/70",
								].join(" ")}
							>
								{p.label}
							</button>
						))}
					</div>

					<Button
						size="sm"
						icon={<BsPlus />}
						onClick={() => {
							setEditExpense(null);
							setModalOpen(true);
						}}
					>
						Nuevo gasto
					</Button>
				</div>
			</div>

			{/* ── Summary cards ── */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<SummaryCard
					icon={<BsWallet2 className="w-4 h-4" />}
					label="Total gastos"
					value={loadingSummary ? "—" : formatPrice(totalExpenses)}
					sub={`${expenses.length} registro${expenses.length !== 1 ? "s" : ""}`}
					delay={0}
				/>
				<SummaryCard
					icon={<BsTag className="w-4 h-4" />}
					label="Mayor categoría"
					value={
						loadingSummary
							? "—"
							: (byCategory.sort((a, b) => b.total - a.total)[0]?.category ??
								"—")
					}
					sub={
						byCategory[0]
							? formatPrice(
									byCategory.sort((a, b) => b.total - a.total)[0]?.total,
								)
							: "Sin datos"
					}
					delay={60}
				/>
				<SummaryCard
					icon={<BsCalendar className="w-4 h-4" />}
					label="Promedio por gasto"
					value={
						loadingSummary || expenses.length === 0
							? "—"
							: formatPrice(totalExpenses / expenses.length)
					}
					sub="Basado en el período"
					delay={120}
				/>
			</div>

			{/* ── Category breakdown ── */}
			{byCategory.length > 0 && (
				<div
					className="rounded-2xl border border-first/10 bg-main p-5 flex flex-col gap-4"
					style={{ animation: "fadeUp 0.4s ease both", animationDelay: "80ms" }}
				>
					<p className="text-xs font-semibold uppercase tracking-widest text-first/40">
						Distribución por categoría
					</p>
					<div className="flex flex-col gap-3">
						{[...byCategory]
							.sort((a, b) => b.total - a.total)
							.map((cat) => (
								<CategoryBar
									key={cat.category}
									{...cat}
									maxTotal={maxCategoryTotal}
								/>
							))}
					</div>
				</div>
			)}

			{/* ── Filters ── */}
			<div className="flex flex-col sm:flex-row gap-3">
				{/* Search */}
				<div className="relative flex items-center flex-1">
					<span className="absolute left-3 text-first/35 pointer-events-none">
						<BsSearch className="w-4 h-4" />
					</span>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por descripción, categoría o notas..."
						className="w-full h-10 pl-9 pr-9 rounded-xl border border-first/15 bg-main text-sm text-first placeholder:text-first/30 focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second transition-all duration-150"
					/>
					{search && (
						<button
							onClick={() => setSearch("")}
							className="absolute right-3 text-first/30 hover:text-first/60 cursor-pointer"
						>
							<BsX className="w-4 h-4" />
						</button>
					)}
				</div>

				{/* Category filter */}
				{availableCategories.length > 1 && (
					<div className="flex items-center gap-1 p-1 rounded-xl border border-first/10 bg-main shrink-0 overflow-x-auto">
						<button
							onClick={() => setCategoryFilter("ALL")}
							className={[
								"px-3 h-8 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
								categoryFilter === "ALL"
									? "bg-second text-main shadow-sm"
									: "text-first/40 hover:text-first/70",
							].join(" ")}
						>
							Todas
						</button>
						{availableCategories.map((cat) => (
							<button
								key={cat}
								onClick={() => setCategoryFilter(cat)}
								className={[
									"px-3 h-8 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
									categoryFilter === cat
										? "bg-second text-main shadow-sm"
										: "text-first/40 hover:text-first/70",
								].join(" ")}
							>
								{CATEGORY_COLORS[cat]?.emoji} {cat}
							</button>
						))}
					</div>
				)}
			</div>

			{/* ── List ── */}
			{loadingExpenses ? (
				<div className="flex items-center justify-center py-12">
					<Spinner size="md" />
				</div>
			) : filtered.length === 0 ? (
				<div
					className="py-10 flex flex-col items-center gap-4"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<EmptyState
						icon={<BsWallet2 />}
						title="Sin gastos"
						description={
							search || categoryFilter !== "ALL"
								? "Intenta con otros filtros"
								: "Registra tu primer gasto usando el botón de arriba"
						}
					/>
				</div>
			) : (
				<div
					className="rounded-2xl border border-first/10 bg-main px-4 overflow-hidden"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					{/* List header */}
					<div className="flex items-center justify-between py-3 border-b border-first/8">
						<p className="text-xs text-first/35 tabular-nums">
							{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
						</p>
						<p className="text-xs font-semibold text-first/50">
							Total:{" "}
							<span style={{ color: "var(--color-second)" }}>
								{formatPrice(filtered.reduce((acc, e) => acc + e.amount, 0))}
							</span>
						</p>
					</div>

					{filtered.map((expense, i) => (
						<ExpenseRow
							key={expense.id}
							expense={expense}
							index={i}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{/* ── Create / Edit modal ── */}
			<Modal
				isOpen={modalOpen}
				onClose={handleModalClose}
				title={editExpense ? "Editar gasto" : "Nuevo gasto"}
				size="md"
			>
				<ExpenseForm
					storeId={storeId}
					expense={editExpense}
					period={period === "all" ? null : period}
					onSuccess={handleModalClose}
					onCancel={handleModalClose}
				/>
			</Modal>

			{/* ── Delete confirm ── */}
			<ConfirmDialog
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
				loading={deleting}
				title="¿Eliminar gasto?"
				description={`"${deleteTarget?.description}" por ${formatPrice(deleteTarget?.amount)} será eliminado permanentemente.`}
				confirmLabel="Eliminar"
			/>
		</div>
	);
};

export default ExpensesView;
