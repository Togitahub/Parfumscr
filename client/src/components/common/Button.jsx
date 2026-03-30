import { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import { Spinner } from "../interface/LoadingUi";

/**
 * Button Component
 *
 * Props:
 * - as: "button" | "a" | "navlink" (default: "button")
 * - variant: "primary" | "secondary" | "danger" | "ghost" | "outline" | "link"
 * - size: "xs" | "sm" | "md" | "lg" | "xl"
 * - iconOnly: boolean — modo ícono cuadrado sin texto
 * - icon: ReactNode — ícono a la izquierda del texto
 * - iconRight: ReactNode — ícono a la derecha del texto
 * - loading: boolean — muestra spinner y deshabilita
 * - disabled: boolean
 * - fullWidth: boolean
 * - rounded: boolean — bordes completamente redondeados (útil para iconOnly)
 * - className: string — clases adicionales
 * - children: ReactNode
 * - ...rest — href, to, onClick, type, target, etc.
 */

const variants = {
	primary:
		"bg-second text-main hover:opacity-85 active:opacity-70 border border-transparent shadow-sm",
	secondary:
		"bg-first text-main hover:opacity-85 active:opacity-70 border border-transparent shadow-sm",
	danger:
		"bg-error text-main hover:opacity-85 active:opacity-70 border border-transparent shadow-sm",
	ghost:
		"bg-transparent text-first hover:bg-first/10 active:bg-first/20 border border-transparent",
	outline:
		"bg-transparent text-first border border-first hover:bg-first/10 active:bg-first/20",
	link: "bg-transparent text-second hover:underline underline-offset-2 border border-transparent p-0 h-auto shadow-none",
};

const sizes = {
	xs: "text-xs px-2 py-1 gap-1",
	sm: "text-sm px-3 py-1.5 gap-1.5",
	md: "text-sm px-4 py-2 gap-2",
	lg: "text-base px-5 py-2.5 gap-2",
	xl: "text-base px-6 py-3 gap-2.5",
};

const iconOnlySizes = {
	xs: "w-6 h-6",
	sm: "w-8 h-8",
	md: "w-9 h-9",
	lg: "w-10 h-10",
	xl: "w-12 h-12",
};

const Button = forwardRef(
	(
		{
			as = "button",
			variant = "primary",
			size = "md",
			iconOnly = false,
			icon,
			iconRight,
			loading = false,
			disabled = false,
			fullWidth = false,
			rounded = false,
			className = "",
			children,
			...rest
		},
		ref,
	) => {
		const isDisabled = disabled || loading;

		const base = [
			"inline-flex items-center justify-center",
			"font-medium leading-none",
			"transition-all duration-150 ease-in-out",
			"focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7] focus-visible:ring-offset-2",
			"select-none",
			rounded ? "rounded-full" : "rounded-md",
			iconOnly ? iconOnlySizes[size] : sizes[size],
			variants[variant],
			fullWidth && variant !== "link" ? "w-full" : "",
			isDisabled
				? "opacity-50 cursor-not-allowed pointer-events-none"
				: "cursor-pointer",
			className,
		]
			.filter(Boolean)
			.join(" ");

		const content = (
			<>
				{loading ? (
					<Spinner size="sm" />
				) : icon ? (
					<span className="shrink-0 flex items-center">{icon}</span>
				) : null}

				{!iconOnly && children && (
					<span className={loading ? "opacity-0 absolute" : ""}>
						{children}
					</span>
				)}

				{!loading && iconRight && !iconOnly && (
					<span className="shrink-0 flex items-center">{iconRight}</span>
				)}
			</>
		);

		// NavLink de React Router
		if (as === "navlink") {
			return (
				<NavLink ref={ref} className={base} {...rest}>
					{content}
				</NavLink>
			);
		}

		// Anchor tag
		if (as === "a") {
			return (
				<a ref={ref} className={base} {...rest}>
					{content}
				</a>
			);
		}

		// Default: <button>
		return (
			<button ref={ref} className={base} disabled={isDisabled} {...rest}>
				{content}
			</button>
		);
	},
);

Button.displayName = "Button";

export default Button;
