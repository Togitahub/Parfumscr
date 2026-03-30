/**
 * EmptyState Component
 *
 * Props:
 * - icon: ReactNode — ícono grande (opcional)
 * - title: string — título principal
 * - description: string — texto secundario (opcional)
 * - action: ReactNode — botón o link de acción (opcional)
 * - size: "sm" | "md" | "lg" (default: "md")
 * - centered: boolean (default: true)
 * - className: string
 */

const sizes = {
	sm: {
		wrapper: "gap-2 py-8",
		icon: "w-8 h-8",
		title: "text-sm",
		description: "text-xs",
	},
	md: {
		wrapper: "gap-3 py-12",
		icon: "w-12 h-12",
		title: "text-base",
		description: "text-sm",
	},
	lg: {
		wrapper: "gap-4 py-16",
		icon: "w-16 h-16",
		title: "text-lg",
		description: "text-base",
	},
};

const EmptyState = ({
	icon,
	title,
	description,
	action,
	size = "md",
	centered = true,
	className = "",
}) => {
	const s = sizes[size];

	return (
		<div
			className={[
				"flex flex-col",
				centered ? "items-center text-center" : "items-start",
				s.wrapper,
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{/* Icon */}
			{icon && (
				<span className={["text-first/20", s.icon].join(" ")}>{icon}</span>
			)}

			{/* Title */}
			<p className={["font-semibold text-first/60", s.title].join(" ")}>
				{title}
			</p>

			{/* Description */}
			{description && (
				<p className={["text-first/40 max-w-sm", s.description].join(" ")}>
					{description}
				</p>
			)}

			{/* Action */}
			{action && <div className="mt-1">{action}</div>}
		</div>
	);
};

export default EmptyState;
