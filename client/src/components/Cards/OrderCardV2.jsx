import { useNavigate } from "react-router-dom";
import { BsChevronRight, BsTrash } from "react-icons/bs";

import Badge from "../common/Badge";
import {
	formatDate,
	formatPrice,
	getOrderDisplayTotal,
	getOrderStatusMeta,
	getPurchaseModeMeta,
} from "../../utils/orderUtils";

const OrderCard = ({
	order,
	variant = "default",
	onDelete,
	className = "",
}) => {
	const navigate = useNavigate();

	if (!order) return null;

	const {
		id,
		orderItems = [],
		status,
		createdAt,
		amountPaid = 0,
		balanceDue = 0,
		purchaseMode = "NORMAL",
	} = order;

	const statusInfo = getOrderStatusMeta(status);
	const purchaseInfo = getPurchaseModeMeta(purchaseMode);
	const isCompact = variant === "compact";
	const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0);
	const previewItems = orderItems.slice(0, 2);
	const remaining = orderItems.length - 2;
	const orderTotal = getOrderDisplayTotal(order);
	const hasProgress = purchaseMode !== "NORMAL" || amountPaid > 0;

	return (
		<article
			onClick={() => navigate(`/store/orders/${id}`)}
			className={[
				"group relative flex flex-col gap-4 rounded-2xl border border-first/10 bg-main cursor-pointer",
				"transition-all duration-200 hover:border-first/25 hover:shadow-lg hover:shadow-black/10",
				isCompact ? "p-4 gap-3" : "p-5",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<p className="text-[11px] font-semibold uppercase tracking-widest text-first/30">
						Orden
					</p>
					<p className="text-sm font-bold text-first font-mono">
						#{id.slice(-8).toUpperCase()}
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<Badge variant={statusInfo.badge} size="sm" dot>
						{statusInfo.shortLabel}
					</Badge>
					<Badge variant={purchaseInfo.badge} size="sm">
						{purchaseInfo.shortLabel}
					</Badge>
					<span className="text-first/20 group-hover:text-first/50 transition-colors duration-200">
						<BsChevronRight className="w-4 h-4" />
					</span>
				</div>
			</div>

			{!isCompact && (
				<div className="flex flex-col gap-1.5">
					{previewItems.map((item, index) => (
						<div
							key={`${item.name}-${index}`}
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

			<div
				className={[
					"flex items-center justify-between gap-3 pt-3 border-t border-first/8",
					isCompact ? "pt-2" : "",
				].join(" ")}
			>
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

				<div className="flex flex-col items-end shrink-0">
					<span
						className={[
							"font-bold text-first tabular-nums",
							isCompact ? "text-base" : "text-lg",
						].join(" ")}
					>
						Total: {formatPrice(orderTotal)}
					</span>
					{hasProgress && (
						<span className="text-[11px] text-first/40 tabular-nums text-right">
							{formatPrice(amountPaid)} de {formatPrice(orderTotal)}
							{balanceDue > 0 ? ` · saldo ${formatPrice(balanceDue)}` : ""}
						</span>
					)}
				</div>

				{onDelete && (
					<button
						onClick={(event) => {
							event.stopPropagation();
							onDelete(order);
						}}
						className="w-7 h-7 rounded-lg flex items-center justify-center text-first/25 hover:text-error hover:bg-error/8 transition-all duration-150 cursor-pointer"
						aria-label="Eliminar orden"
					>
						<BsTrash className="w-3.5 h-3.5" />
					</button>
				)}
			</div>
		</article>
	);
};

export default OrderCard;
