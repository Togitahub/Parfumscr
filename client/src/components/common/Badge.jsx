/**
 * Badge Component
 *
 * Props:
 * - variant: "success" | "error" | "warning" | "info" | "neutral" (default: "neutral")
 * - size: "sm" | "md" | "lg" (default: "md")
 * - dot: boolean — muestra un punto de color antes del texto (default: false)
 * - rounded: boolean — bordes completamente redondeados (default: true)
 * - className: string
 * - children: ReactNode
 */

const variants = {
	success: "bg-success/10 text-success border border-success/20",
	error: "bg-error/10 text-error border border-error/20",
	warning: "bg-yellow-400/10 text-yellow-500 border border-yellow-400/20",
	info: "bg-second/10 text-second border border-second/20",
	neutral: "bg-first/10 text-first/60 border border-first/10",
	homme: "bg-homme/20 text-homme/75",
	femme: "bg-femme/20 text-femme/75",
};

const dotVariants = {
	success: "bg-success",
	error: "bg-error",
	warning: "bg-yellow-400",
	info: "bg-second",
	neutral: "bg-first/40",
};

const sizes = {
	sm: "text-xs px-1.5 py-0.5 gap-1",
	md: "text-xs px-2 py-1 gap-1.5",
	lg: "text-sm px-2.5 py-1 gap-1.5",
};

const dotSizes = {
	sm: "w-1.5 h-1.5",
	md: "w-2 h-2",
	lg: "w-2 h-2",
};

const Badge = ({
	variant = "neutral",
	size = "md",
	dot = false,
	rounded = true,
	className = "",
	children,
}) => {
	return (
		<span
			className={[
				"inline-flex items-center font-medium",
				rounded ? "rounded-full" : "rounded-md",
				variants[variant],
				sizes[size],
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{dot && (
				<span
					className={[
						"rounded-full shrink-0",
						dotVariants[variant],
						dotSizes[size],
					].join(" ")}
				/>
			)}
			{children}
		</span>
	);
};

export default Badge;
