import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import {
	BsArrowLeft,
	BsBoxSeam,
	BsClock,
	BsCheckCircle,
	BsXCircle,
	BsHourglass,
	BsReceipt,
	BsWhatsapp,
} from "react-icons/bs";

import { GET_ORDER_BY_ID } from "../graphql/order/OrderQueries";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Spinner } from "../components/interface/LoadingUi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

const formatDate = (createdAt) => {
	if (!createdAt) return "—";
	const date = new Date(
		isNaN(Number(createdAt)) ? createdAt : Number(createdAt),
	);
	return date.toLocaleDateString("es-CR", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP = {
	SOLICITADO_WS: {
		label: "Solicitado por WhatsApp",
		badge: "info",
		icon: <BsClock className="w-4 h-4" />,
		description: "Tu solicitud fue recibida. El equipo confirmará pronto.",
	},
	EN_PROCESO: {
		label: "En proceso",
		badge: "warning",
		icon: <BsHourglass className="w-4 h-4" />,
		description: "Tu pedido está siendo preparado.",
	},
	COMPLETADO: {
		label: "Completado",
		badge: "success",
		icon: <BsCheckCircle className="w-4 h-4" />,
		description: "Tu pedido fue entregado con éxito.",
	},
	CANCELADO: {
		label: "Cancelado",
		badge: "error",
		icon: <BsXCircle className="w-4 h-4" />,
		description: "Esta orden fue cancelada.",
	},
};

// ── Status timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
	{ key: "SOLICITADO_WS", label: "Solicitado" },
	{ key: "EN_PROCESO", label: "En proceso" },
	{ key: "COMPLETADO", label: "Completado" },
];

const ORDER_STEP_INDEX = {
	SOLICITADO_WS: 0,
	EN_PROCESO: 1,
	COMPLETADO: 2,
	CANCELADO: -1,
};

const StatusTimeline = ({ status }) => {
	const currentStep = ORDER_STEP_INDEX[status] ?? 0;
	const isCancelled = status === "CANCELADO";

	if (isCancelled) {
		return (
			<div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-error/20 bg-error/5">
				<BsXCircle className="w-4 h-4 text-error shrink-0" />
				<p className="text-sm text-error/80">Esta orden fue cancelada.</p>
			</div>
		);
	}

	return (
		<div className="flex items-start gap-0">
			{TIMELINE_STEPS.map((step, i) => {
				const isCompleted = i < currentStep;
				const isActive = i === currentStep;
				const isLast = i === TIMELINE_STEPS.length - 1;

				return (
					<div key={step.key} className="flex flex-col items-center flex-1">
						{/* Dot + connector */}
						<div className="flex items-center w-full">
							{/* Left connector */}
							{i > 0 && (
								<div
									className="flex-1 h-px transition-colors duration-300"
									style={{
										background:
											isCompleted || isActive
												? "var(--color-second)"
												: "color-mix(in srgb, var(--color-first) 12%, transparent)",
									}}
								/>
							)}

							{/* Dot */}
							<div
								className={[
									"w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300",
									isActive
										? "border-second bg-second/10 shadow-[0_0_12px_color-mix(in_srgb,var(--color-second)_30%,transparent)]"
										: isCompleted
											? "border-second bg-second"
											: "border-first/15 bg-main",
								].join(" ")}
							>
								{isCompleted ? (
									<BsCheckCircle
										className="w-3.5 h-3.5"
										style={{ color: "var(--color-main)" }}
									/>
								) : isActive ? (
									<span
										className="w-2.5 h-2.5 rounded-full"
										style={{ background: "var(--color-second)" }}
									/>
								) : (
									<span
										className="w-2 h-2 rounded-full"
										style={{
											background:
												"color-mix(in srgb, var(--color-first) 15%, transparent)",
										}}
									/>
								)}
							</div>

							{/* Right connector */}
							{!isLast && (
								<div
									className="flex-1 h-px transition-colors duration-300"
									style={{
										background: isCompleted
											? "var(--color-second)"
											: "color-mix(in srgb, var(--color-first) 12%, transparent)",
									}}
								/>
							)}
						</div>

						{/* Label */}
						<p
							className={[
								"mt-2 text-[11px] font-medium text-center",
								isActive
									? "text-second"
									: isCompleted
										? "text-first/60"
										: "text-first/25",
							].join(" ")}
						>
							{step.label}
						</p>
					</div>
				);
			})}
		</div>
	);
};

// ── Order item row ────────────────────────────────────────────────────────────

const OrderItemRow = ({ item, index }) => {
	const subtotal = item.price * item.quantity;

	return (
		<div
			className="flex items-center justify-between gap-4 py-3.5 border-b border-first/6 last:border-0"
			style={{
				animation: "fadeUp 0.35s ease both",
				animationDelay: `${index * 50}ms`,
			}}
		>
			{/* Left: qty badge + name */}
			<div className="flex items-center gap-3 min-w-0">
				<span
					className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
					style={{
						background:
							"color-mix(in srgb, var(--color-second) 12%, transparent)",
						color: "var(--color-second)",
						border:
							"1px solid color-mix(in srgb, var(--color-second) 25%, transparent)",
					}}
				>
					{item.quantity}
				</span>
				<span className="text-sm font-medium text-first truncate">
					{item.name}
				</span>
			</div>

			{/* Right: unit price + subtotal */}
			<div className="flex flex-col items-end gap-0.5 shrink-0">
				<span className="text-sm font-semibold text-first tabular-nums">
					{formatPrice(subtotal)}
				</span>
				{item.quantity > 1 && (
					<span className="text-[11px] text-first/35 tabular-nums">
						{formatPrice(item.price)} c/u
					</span>
				)}
			</div>
		</div>
	);
};

// ── OrderView ─────────────────────────────────────────────────────────────────

const OrderView = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data, loading, error } = useQuery(GET_ORDER_BY_ID, {
		variables: { id },
		skip: !id,
	});

	const order = data?.getOrderById;

	// ── Loading ───────────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center">
				<Spinner size="xl" />
			</div>
		);
	}

	// ── Error / not found ─────────────────────────────────────────────────────

	if (error || !order) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
				<BsXCircle className="w-12 h-12 text-error/40" />
				<p className="text-first/40 text-sm text-center">
					{error ? "Error al cargar la orden." : "Orden no encontrada."}
				</p>
				<Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
					Ver mis órdenes
				</Button>
			</div>
		);
	}

	const { orderItems = [], totalPrice, status, createdAt } = order;
	const statusInfo = STATUS_MAP[status] ?? {
		label: status ?? "Desconocido",
		badge: "neutral",
		icon: <BsBoxSeam className="w-4 h-4" />,
		description: "",
	};

	const totalItemCount = orderItems.reduce((acc, i) => acc + i.quantity, 0);

	// WhatsApp follow-up message
	const handleWhatsApp = () => {
		const msg = encodeURIComponent(
			`Hola! Quiero consultar sobre mi orden *#${id.slice(-8).toUpperCase()}* del ${formatDate(createdAt)}.\n\nTotal: ${formatPrice(totalPrice)}\nEstado actual: ${statusInfo.label}`,
		);
		window.open(`https://wa.me/?text=${msg}`, "_blank");
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div
			className="min-h-screen px-4 py-10 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-2xl mx-auto flex flex-col gap-8">
				{/* ── Back button ── */}
				<button
					onClick={() => navigate("/orders")}
					className="flex items-center gap-1.5 text-sm text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<BsArrowLeft className="w-3.5 h-3.5" />
					Mis órdenes
				</button>

				{/* ── Order header card ── */}
				<div
					className="rounded-2xl border border-first/10 bg-main p-6 flex flex-col gap-5"
					style={{
						animation: "fadeUp 0.45s ease both",
						animationDelay: "40ms",
					}}
				>
					{/* Top row: id + status */}
					<div className="flex items-start justify-between gap-4 flex-wrap">
						<div className="flex flex-col gap-1">
							<p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-first/30">
								Orden
							</p>
							<p
								className="text-2xl font-bold text-first font-mono tracking-wider"
								style={{ fontFamily: "'Cinzel', serif" }}
							>
								#{id.slice(-8).toUpperCase()}
							</p>
							<p className="text-xs text-first/35 mt-0.5 capitalize">
								{formatDate(createdAt)}
							</p>
						</div>

						<div className="flex flex-col items-end gap-2">
							<Badge variant={statusInfo.badge} size="lg" dot>
								{statusInfo.label}
							</Badge>
							{statusInfo.description && (
								<p className="text-xs text-first/40 text-right max-w-45 leading-snug">
									{statusInfo.description}
								</p>
							)}
						</div>
					</div>

					{/* Decorative line */}
					<div
						className="h-px"
						style={{
							background:
								"linear-gradient(to right, var(--color-second), transparent)",
							opacity: 0.3,
						}}
					/>

					{/* Status timeline */}
					<StatusTimeline status={status} />
				</div>

				{/* ── Order items ── */}
				<div
					className="flex flex-col gap-4"
					style={{
						animation: "fadeUp 0.45s ease both",
						animationDelay: "80ms",
					}}
				>
					{/* Section label */}
					<div className="flex items-center gap-2">
						<BsReceipt className="w-4 h-4 text-second/60" />
						<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-first/35">
							Productos — {totalItemCount}{" "}
							{totalItemCount === 1 ? "artículo" : "artículos"}
						</p>
						<div className="flex-1 h-px bg-first/6" />
					</div>

					{/* Items list */}
					<div className="rounded-2xl border border-first/8 bg-main px-4 overflow-hidden">
						{orderItems.map((item, i) => (
							<OrderItemRow key={i} item={item} index={i} />
						))}
					</div>

					{/* Total row */}
					<div className="flex items-center justify-between px-4 py-4 rounded-2xl border border-first/10 bg-main">
						<span className="text-sm font-medium text-first/50 uppercase tracking-wider">
							Total
						</span>
						<span
							className="text-2xl font-bold text-first tabular-nums"
							style={{ fontFamily: "'Cinzel', serif" }}
						>
							{formatPrice(totalPrice)}
						</span>
					</div>
				</div>

				{/* ── Actions ── */}
				<div
					className="flex flex-col sm:flex-row gap-3"
					style={{
						animation: "fadeUp 0.45s ease both",
						animationDelay: "120ms",
					}}
				>
					{/* WhatsApp follow-up */}
					<Button
						fullWidth
						variant="outline"
						size="md"
						icon={<BsWhatsapp />}
						onClick={handleWhatsApp}
						className="hover:text-[#25D366]! hover:border-[#25D366]/40!"
					>
						Consultar por WhatsApp
					</Button>

					{/* Back to catalog */}
					<Button
						fullWidth
						variant="ghost"
						size="md"
						onClick={() => navigate("/")}
					>
						Seguir comprando
					</Button>
				</div>
			</div>
		</div>
	);
};

export default OrderView;
