import { useNavigate } from "react-router-dom";

import {
	BsBoxSeam,
	BsChevronRight,
	BsClock,
	BsCheckCircle,
	BsXCircle,
	BsHourglass,
} from "react-icons/bs";

import Badge from "../common/Badge";

/**
 * OrderCard Component
 *
 * Props:
 * - order: {
 *     id, user, orderItems [{ name, quantity, price }],
 *     totalPrice, status, createdAt
 *   }
 * - variant: "default" | "compact"
 * - className: string
 */

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_MAP = {
	SOLICITADO_WS: {
		label: "Solicitado",
		badge: "info",
		icon: <BsClock className="w-3.5 h-3.5" />,
	},
	EN_PROCESO: {
		label: "En proceso",
		badge: "warning",
		icon: <BsHourglass className="w-3.5 h-3.5" />,
	},
	COMPLETADO: {
		label: "Completado",
		badge: "success",
		icon: <BsCheckCircle className="w-3.5 h-3.5" />,
	},
	CANCELADO: {
		label: "Cancelado",
		badge: "error",
		icon: <BsXCircle className="w-3.5 h-3.5" />,
	},
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (createdAt) => {
	if (!createdAt) return "—";
	const date = new Date(
		isNaN(Number(createdAt)) ? createdAt : Number(createdAt),
	);
	return date.toLocaleDateString("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

// ── Component ─────────────────────────────────────────────────────────────────

const OrderCard = ({
	order,
	variant = "default",
	onStatusChange,
	className = "",
}) => {
	const navigate = useNavigate();

	if (!order) return null;

	const { id, orderItems = [], totalPrice, status, createdAt } = order;

	const statusInfo = STATUS_MAP[status] ?? {
		label: status ?? "Desconocido",
		badge: "neutral",
		icon: <BsBoxSeam className="w-3.5 h-3.5" />,
	};

	const isCompact = variant === "compact";
	const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0);
	const previewItems = orderItems.slice(0, 2);
	const remaining = orderItems.length - 2;

	const handleClick = () => navigate(`/store/orders/${id}`);

	return (
		<article
			onClick={handleClick}
			className={[
				"group relative flex flex-col gap-4 rounded-2xl border border-first/10 bg-main cursor-pointer",
				"transition-all duration-200 hover:border-first/25 hover:shadow-lg hover:shadow-black/10",
				isCompact ? "p-4 gap-3" : "p-5",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{/* ── Header ── */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					{/* Order ID */}
					<p className="text-[11px] font-semibold uppercase tracking-widest text-first/30">
						Orden
					</p>
					<p className="text-sm font-bold text-first font-mono">
						#{id.slice(-8).toUpperCase()}
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					{/* Status badge */}
					<Badge variant={statusInfo.badge} size="sm" dot>
						{statusInfo.label}
					</Badge>

					{/* Chevron */}

					<span className="text-first/20 group-hover:text-first/50 transition-colors duration-200">
						<BsChevronRight className="w-4 h-4" />
					</span>
				</div>
			</div>

			{/* ── Items preview ── */}
			{!isCompact && (
				<div className="flex flex-col gap-1.5">
					{previewItems.map((item, i) => (
						<div
							key={i}
							className="flex items-center justify-between gap-4 text-sm"
						>
							<div className="flex items-center gap-2 min-w-0">
								<span className="w-5 h-5 rounded-md bg-first/8 flex items-center justify-center shrink-0">
									<span className="text-[10px] font-bold text-first/50">
										{item.quantity}
									</span>
								</span>
								<span className="text-first/70 truncate">{item.name}</span>
							</div>
							<span className="text-first/40 shrink-0 tabular-nums text-xs">
								{formatPrice(item.price * item.quantity)}
							</span>
						</div>
					))}

					{remaining > 0 && (
						<p className="text-xs text-first/30 pl-7">
							+{remaining} producto{remaining > 1 ? "s" : ""} más
						</p>
					)}
				</div>
			)}

			{/* ── Footer ── */}
			<div
				className={[
					"flex items-center justify-between gap-3 pt-3 border-t border-first/8",
					isCompact ? "pt-2" : "",
				].join(" ")}
			>
				{/* Date + item count */}
				<div className="flex items-center gap-3">
					<span className="text-xs text-first/35">{formatDate(createdAt)}</span>
					{!isCompact && (
						<>
							<span className="w-px h-3 bg-first/15" />
							<span className="text-xs text-first/35">
								{totalItems} {totalItems === 1 ? "artículo" : "artículos"}
							</span>
						</>
					)}
				</div>

				{/* Total price */}
				<span
					className={[
						"font-bold text-first tabular-nums",
						isCompact ? "text-base" : "text-lg",
					].join(" ")}
				>
					Total: {formatPrice(totalPrice)}
				</span>

				{/* Status */}
				{onStatusChange && (
					<select
						value={status}
						onClick={(e) => e.stopPropagation()}
						onChange={(e) => {
							e.stopPropagation();
							onStatusChange(id, e.target.value);
						}}
						className="text-xs rounded-lg border border-first/15 bg-main text-first px-2 py-1 focus:outline-none focus:ring-2 focus:ring-second/30 cursor-pointer"
					>
						<option value="SOLICITADO_WS">Solicitado</option>
						<option value="EN_PROCESO">En proceso</option>
						<option value="COMPLETADO">Completado</option>
						<option value="CANCELADO">Cancelado</option>
					</select>
				)}
			</div>
		</article>
	);
};

export default OrderCard;
