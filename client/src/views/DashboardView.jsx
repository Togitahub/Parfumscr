import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import {
	BsGraphUp,
	BsCart3,
	BsCheckCircle,
	BsCurrencyDollar,
	BsPercent,
	BsEye,
	BsHeart,
	BsBoxSeam,
	BsArrowLeft,
} from "react-icons/bs";

import { useStore } from "../hooks/StoreContext";
import { GET_DASHBOARD_STATS } from "../graphql/store/StoreQueries";
import { getOptimizedUrl } from "../utils/ImageUtils";

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

const PERIODS = [
	{ key: "week", label: "Esta semana" },
	{ key: "month", label: "Este mes" },
	{ key: "year", label: "Este año" },
	{ key: "all", label: "Todo" },
];

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
			<div className="w-9 h-9 rounded-lg overflow-hidden bg-first/5 shrink-0">
				{product.images?.[0] ? (
					<img
						src={getOptimizedUrl(product.images[0], "thumb")}
						alt={product.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<BsBoxSeam className="w-3.5 h-3.5 text-first/20" />
					</div>
				)}
			</div>
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
	const { store } = useStore();
	const [period, setPeriod] = useState("month");

	const resolvedStoreId = propStoreId ?? store?.storeId;

	const { data, loading } = useQuery(GET_DASHBOARD_STATS, {
		variables: {
			storeId: resolvedStoreId,
			period: period === "all" ? null : period,
		},
		skip: !store?.storeId,
	});

	const stats = data?.getDashboardStats;

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

					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
					</div>
				</div>

				{/* Stat cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
				</div>

				{/* Rankings */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
					<RankSection
						title="Más solicitados"
						icon={<BsCart3 className="w-3.5 h-3.5" />}
						items={stats?.topRequested ?? []}
						loading={loading}
					/>
					<RankSection
						title="Más vistos"
						icon={<BsEye className="w-3.5 h-3.5" />}
						items={stats?.topViewed ?? []}
						loading={loading}
					/>
					<RankSection
						title="Más favoriteados"
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
