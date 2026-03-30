import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	BsHeart,
	BsHeartFill,
	BsCart3,
	BsBoxArrowUpRight,
} from "react-icons/bs";
import Badge from "../common/Badge";
import Button from "../common/Button";

/**
 * ProductCard Component
 *
 * Props:
 * - product: {
 *     id, name, brand { name }, category { name }, segment { name },
 *     price, stock, images, description, size, isDecant,
 *     linkedProduct { id, name }, notes [{ name }], discount, createdAt
 *   }
 * - isFavorite: boolean
 * - onToggleFavorite: (productId) => void
 * - onAddToCart: (productId) => void
 * - variant: "default" | "compact" | "featured"
 * - showActions: boolean (default: true)
 * - className: string
 */

const ProductCard = ({
	product,
	isFavorite = false,
	onToggleFavorite,
	onAddToCart,
	variant = "default",
	showActions = true,
	className = "",
}) => {
	const navigate = useNavigate();
	const [imgLoaded, setImgLoaded] = useState(false);

	if (!product) return null;

	const {
		id,
		name,
		brand,
		segment,
		price,
		stock,
		images,
		size,
		isDecant,
		discount = 0,
		notes = [],
	} = product;

	const image = images?.[0] ?? null;
	const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
	const hasDiscount = discount > 0;
	const isOutOfStock = stock === 0;
	const isCompact = variant === "compact";
	const isFeatured = variant === "featured";

	const handleCardClick = () => navigate(`/product/${id}`);
	const handleFavorite = (e) => {
		e.stopPropagation();
		onToggleFavorite?.(id);
	};
	const handleCart = (e) => {
		e.stopPropagation();
		onAddToCart?.(id);
	};

	return (
		<article
			onClick={handleCardClick}
			className={[
				"pc-root group relative flex flex-col cursor-pointer select-none rounded-2xl overflow-hidden",
				isFeatured ? "md:flex-row" : "",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{/* ── Image section ── */}
			<div
				className={[
					"relative overflow-hidden bg-first/4",
					isFeatured ? "md:w-2/5 md:min-h-70" : "aspect-4/3",
					isCompact ? "aspect-square!" : "",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{!imgLoaded && <div className="pc-shimmer absolute inset-0" />}

				{image ? (
					<img
						src={image}
						alt={name}
						onLoad={() => setImgLoaded(true)}
						className={[
							"pc-img w-full h-full object-cover",
							imgLoaded ? "pc-img--loaded" : "opacity-0",
						].join(" ")}
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-first/15">
						<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
							<circle
								cx="24"
								cy="24"
								r="22"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeDasharray="4 3"
							/>
							<path
								d="M16 28 Q24 18 32 28"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
							<circle cx="19" cy="21" r="2" fill="currentColor" opacity=".6" />
						</svg>
						<span className="text-[10px] tracking-widest uppercase opacity-60">
							Sin imagen
						</span>
					</div>
				)}

				{/* Bottom gradient reveal on hover */}
				<div className="pc-img-gradient absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" />

				{/* Top badges */}
				<div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
					{!isDecant && <span className="pc-pill pc-pill--decant">Perfume</span>}
					{isDecant && <span className="pc-pill pc-pill--decant">Decant</span>}
					{hasDiscount && (
						<span className="pc-pill pc-pill--discount">-{discount}%</span>
					)}
					{isOutOfStock && (
						<span className="pc-pill pc-pill--stock">Agotado</span>
					)}
				</div>

				{/* Favorite button */}
				{onToggleFavorite && (
					<button
						onClick={handleFavorite}
						aria-label={
							isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
						}
						className={[
							"pc-fav absolute top-3 right-3 z-10",
							"w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border",
							isFavorite ? "pc-fav--active" : "pc-fav--idle",
						].join(" ")}
					>
						{isFavorite ? (
							<BsHeartFill className="w-3.5 h-3.5" />
						) : (
							<BsHeart className="w-3.5 h-3.5" />
						)}
					</button>
				)}

				{/* Add-to-cart bar — slides up on hover */}
				{showActions && !isCompact && onAddToCart && (
					<div className="pc-cart-bar absolute inset-x-0 bottom-0 p-3 z-10">
						<Button
							fullWidth
							size="sm"
							variant="primary"
							icon={<BsCart3 />}
							onClick={handleCart}
							disabled={isOutOfStock}
							className="bg-second! text-main! shadow-lg"
						>
							{isOutOfStock ? "Sin stock" : "Agregar al carrito"}
						</Button>
					</div>
				)}
			</div>

			{/* ── Content section ── */}
			<div
				className={[
					"flex flex-col flex-1 p-4 gap-3",
					isFeatured ? "md:p-6 md:justify-center" : "",
					isCompact ? "p-3! gap-2!" : "",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{/* Brand + segment */}
				<div className="flex items-center justify-between gap-2">
					<span
						className={[
							"pc-brand font-semibold tracking-widest uppercase",
							isCompact ? "text-[10px]" : "text-[11px]",
						].join(" ")}
					>
						{brand?.name ?? "—"}
					</span>
					{segment && !isCompact && (
						<Badge variant="neutral" size="sm">
							{segment.name}
						</Badge>
					)}
				</div>

				{/* Product name */}
				<div className="flex-1 min-w-0">
					<h3
						className={[
							"pc-name font-bold text-first leading-tight line-clamp-2",
							isFeatured ? "text-xl" : isCompact ? "text-sm" : "text-base",
						].join(" ")}
					>
						{name}
					</h3>
					{size && !isCompact && (
						<span className="text-xs text-first/35 mt-0.5 block tracking-wide">
							{size}
						</span>
					)}
				</div>

				{/* Olfactory note chips */}
				{notes.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{notes.slice(0, 4).map((note) => (
							<span key={note.name} className="pc-note-chip">
								{note.name}
							</span>
						))}
						{notes.length > 4 && (
							<span className="pc-note-chip pc-note-chip--more">
								+{notes.length - 4}
							</span>
						)}
					</div>
				)}

				{/* Price + stock */}
				<div className="flex items-end justify-between gap-2 mt-auto pt-3 border-t border-first/8">
					<div className="flex flex-col gap-1">
						<div className="flex items-baseline gap-2">
							<span
								className={[
									"font-bold text-first tabular-nums",
									isFeatured ? "text-2xl" : isCompact ? "text-sm" : "text-lg",
								].join(" ")}
							>
								₡
								{discountedPrice.toLocaleString("es-CR", {
									minimumFractionDigits: 0,
								})}
							</span>
							{hasDiscount && (
								<span className="text-xs text-first/30 line-through tabular-nums">
									₡{price.toLocaleString("es-CR")}
								</span>
							)}
						</div>
						{!isCompact && stock !== undefined && stock !== null && (
							<div className="flex items-center gap-1.5">
								<span
									className={[
										"inline-block w-1.5 h-1.5 rounded-full",
										stock > 5
											? "bg-success"
											: stock > 0
												? "bg-yellow-400"
												: "bg-error/60",
									].join(" ")}
								/>
								<span className="text-[11px] text-first/35">
									{stock > 5
										? "En stock"
										: stock > 0
											? `${stock} disponibles`
											: "Agotado"}
								</span>
							</div>
						)}
					</div>

					{/* Detail arrow */}
					<div className="pc-arrow w-8 h-8 rounded-full border border-first/10 flex items-center justify-center shrink-0">
						<BsBoxArrowUpRight className="w-3 h-3" />
					</div>
				</div>
			</div>
		</article>
	);
};

export default ProductCard;
