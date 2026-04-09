import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import {
	BsCart3,
	BsCheckCircle,
	BsCurrencyDollar,
	BsPercent,
	BsEye,
	BsHeart,
	BsArrowLeft,
	BsWallet2,
	BsGraphUp,
} from "react-icons/bs";

import { useAuth } from "../hooks/AuthContext";
import { useStore } from "../hooks/StoreContext";

import {
	GET_DASHBOARD_STATS,
	GET_MY_STORE,
} from "../graphql/store/StoreQueries";

import { GET_EXPENSE_SUMMARY } from "../graphql/expense/ExpenseQueries";
import PeriodSelector from "../components/common/PeriodSelector";

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

const StatCard = ({ icon, label, value, sub, color = "second" }) => (
	<div
		className="flex flex-col gap-2 p-5 rounded-2xl border border-first/10 bg-main"
		style={{ animation: "fadeUp 0.4s ease both" }}
	>
		<div className="flex items-center justify-between">
			<span
				className="text-xs font-semibold uppercase tracking-widest text-first/35"
				style={{ fontFamily: "'Cinzel', serif" }}
			>
				{label}
			</span>
			<span style={{ color: `var(--color-${color})`, opacity: 0.6 }}>
				{icon}
			</span>
		</div>
		<p
			className="text-3xl font-bold text-first tabular-nums"
			style={{ fontFamily: "'Cinzel', serif" }}
		>
			{value}
		</p>
		{sub && <p className="text-xs text-first/35">{sub}</p>}
	</div>
);

const ProductRankRow = ({ item, index, icon }) => {
	const navigate = useNavigate();
	const { product, count } = item;

	return (
		<button
			onClick={() => navigate(`/store/product/${product.id}`)}
			className="flex items-center gap-3 py-2.5 border-b border-first/6 last:border-0 w-full text-left group hover:bg-first/3 -mx-4 px-4 transition-colors duration-150 cursor-pointer"
			style={{
				animation: "fadeUp 0.35s ease both",
				animationDelay: `${index * 50}ms`,
			}}
		>
			<span
				className="w-6 text-center text-xs font-bold tabular-nums shrink-0"
				style={{
					color: "color-mix(in srgb, var(--color-second) 60%, transparent)",
				}}
			>
				{index + 1}
			</span>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-first truncate">
					{product.name}
				</p>
				<p className="text-xs text-first/35 tracking-widest uppercase">
					{product.brand?.name}
				</p>
			</div>
			<div className="flex items-center gap-1.5 shrink-0">
				<span style={{ color: "var(--color-second)", opacity: 0.5 }}>
					{icon}
				</span>
				<span className="text-sm font-bold text-first tabular-nums">
					{count}
				</span>
			</div>
		</button>
	);
};

const RankSection = ({ title, icon, items = [], loading }) => (
	<div
		className="flex flex-col gap-3 p-5 rounded-2xl border border-first/10 bg-main"
		style={{ animation: "fadeUp 0.45s ease both" }}
	>
		<div className="flex items-center gap-2 mb-1">
			<span style={{ color: "var(--color-second)", opacity: 0.6 }}>{icon}</span>
			<h3
				className="text-xs font-semibold uppercase tracking-widest text-first/50"
				style={{ fontFamily: "'Cinzel', serif" }}
			>
				{title}
			</h3>
		</div>

		{loading ? (
			<div className="flex flex-col gap-2">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-10 bg-first/5 rounded-xl shimmer" />
				))}
			</div>
		) : items.length === 0 ? (
			<p className="text-xs text-first/25 italic py-4 text-center">
				Sin datos aún
			</p>
		) : (
			<div className="overflow-hidden">
				{items.map((item, i) => (
					<ProductRankRow
						key={item.product.id}
						item={item}
						index={i}
						icon={icon}
					/>
				))}
			</div>
		)}
	</div>
);

const DashboardView = ({ embedded = false, storeId: propStoreId }) => {
	const navigate = useNavigate();

	const { user } = useAuth();
	const { store } = useStore();

	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	// Unified period state
	const [periodConfig, setPeriodConfig] = useState({
		period: "day",
		startDate: "",
		endDate: "",
	});

	const { data: myStoreData } = useQuery(GET_MY_STORE, {
		skip: isSuperAdmin,
	});

	const myStore = myStoreData?.getMyStore;
	const resolvedStoreId = propStoreId ?? store?.storeId;

	// Build query variables
	const queryVariables = {
		storeId: resolvedStoreId,
		period:
			periodConfig.period === "all"
				? null
				: periodConfig.period === "custom"
					? "custom"
					: periodConfig.period,
		...(periodConfig.period === "custom"
			? { startDate: periodConfig.startDate, endDate: periodConfig.endDate }
			: {}),
	};

	const { data, loading } = useQuery(GET_DASHBOARD_STATS, {
		variables: queryVariables,
		skip: !resolvedStoreId,
	});

	const { data: expenseSummaryData, loading: loadingExpenses } = useQuery(
		GET_EXPENSE_SUMMARY,
		{
			variables: queryVariables,
			skip: !resolvedStoreId,
		},
	);

	const stats = data?.getDashboardStats;
	const totalExpenses =
		expenseSummaryData?.getExpenseSummary?.totalExpenses ?? 0;
	const confirmedRevenue = stats?.confirmedRevenue ?? 0;
	const netProfit = confirmedRevenue - totalExpenses;

	return (
		<div
			className="min-h-screen px-4 py-10 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-7xl mx-auto flex flex-col gap-8">
				{/* Header */}
				<div
					className="flex flex-col gap-4"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					{!embedded && (
						<button
							onClick={() => navigate(-1)}
							className="flex items-center gap-1.5 text-sm text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
						>
							<BsArrowLeft className="w-3.5 h-3.5" />
							Volver
						</button>
					)}

					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative">
						<div className="flex flex-col gap-1">
							<p
								className="text-[10px] font-semibold uppercase tracking-[0.3em]"
								style={{
									color: "var(--color-second)",
									fontFamily: "'Cinzel', serif",
								}}
							>
								Analytics
							</p>
							<h1
								className="text-4xl font-light tracking-tight text-first leading-none"
								style={{ fontFamily: "'Cormorant Garamond', serif" }}
							>
								Dashboard
							</h1>
							<div
								className="mt-1 h-px w-24"
								style={{
									background:
										"linear-gradient(to right, var(--color-second), transparent)",
									opacity: 0.5,
								}}
							/>
						</div>

						{/* Period selector */}
						<PeriodSelector
							period={periodConfig.period}
							startDate={periodConfig.startDate}
							endDate={periodConfig.endDate}
							onChange={setPeriodConfig}
						/>
					</div>
				</div>

				{/* Stat cards */}
				<div
					className={`grid lg:grid-cols-${myStore?.posEnabled ? "3" : "4"} gap-4 relative z-[-1]`}
				>
					<StatCard
						icon={<BsCart3 className="w-4 h-4" />}
						label="Solicitudes"
						value={loading ? "—" : (stats?.totalRequests ?? 0)}
						sub="Órdenes por WhatsApp"
					/>
					<StatCard
						icon={<BsCheckCircle className="w-4 h-4" />}
						label="Ventas confirmadas"
						value={loading ? "—" : (stats?.confirmedSales ?? 0)}
						sub="Marcadas como completado"
					/>
					<StatCard
						icon={<BsPercent className="w-4 h-4" />}
						label="Tasa de cierre"
						value={loading ? "—" : `${stats?.closingRate ?? 0}%`}
						sub="Solicitudes → completado"
					/>
					<StatCard
						icon={<BsCurrencyDollar className="w-4 h-4" />}
						label="Ingresos confirmados"
						value={loading ? "—" : formatPrice(stats?.confirmedRevenue ?? 0)}
						sub="Solo órdenes completadas"
					/>
					{myStore?.posEnabled && (
						<>
							<StatCard
								icon={<BsWallet2 className="w-4 h-4" />}
								label="Total gastos"
								value={
									loading || loadingExpenses ? "—" : formatPrice(totalExpenses)
								}
								sub="Del período seleccionado"
								color="error"
							/>
							<StatCard
								icon={<BsGraphUp className="w-4 h-4" />}
								label="Utilidad neta"
								value={
									loading || loadingExpenses ? "—" : formatPrice(netProfit)
								}
								sub="Ingresos − Gastos"
								color={netProfit >= 0 ? "success" : "error"}
							/>
						</>
					)}
				</div>

				{/* Rankings */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<RankSection
						title="Top Vendidos"
						icon={<BsCart3 className="w-3.5 h-3.5" />}
						items={stats?.topRequested ?? []}
						loading={loading}
					/>
					<RankSection
						title="Top Visualizaciones"
						icon={<BsEye className="w-3.5 h-3.5" />}
						items={stats?.topViewed ?? []}
						loading={loading}
					/>
					<RankSection
						title="Top Favoritos"
						icon={<BsHeart className="w-3.5 h-3.5" />}
						items={stats?.topFavorited ?? []}
						loading={loading}
					/>
				</div>
			</div>
		</div>
	);
};

export default DashboardView;
