/**
 * Spinner / LoadingOverlay Component
 *
 * Spinner Props:
 * - size: "xs" | "sm" | "md" | "lg" | "xl"
 * - color: "second" | "first" | "white" | "error"
 * - className: string
 *
 * LoadingOverlay Props:
 * - visible: boolean — controla si se muestra
 * - text: string — texto opcional debajo del spinner
 * - blur: boolean — aplica blur al contenido detrás (default: true)
 * - fullScreen: boolean — cubre toda la pantalla (default: false, cubre el padre relativo)
 */

const sizes = {
	xs: "w-3 h-3 border-[1.5px]",
	sm: "w-4 h-4 border-2",
	md: "w-6 h-6 border-2",
	lg: "w-8 h-8 border-[3px]",
	xl: "w-12 h-12 border-4",
};

const colors = {
	second: "border-second/20 border-t-second",
	first: "border-first/20 border-t-first",
	white: "border-white/20 border-t-white",
	error: "border-error/20 border-t-error",
};

export const Spinner = ({ size = "md", color = "second", className = "" }) => {
	return (
		<span
			role="status"
			aria-label="Cargando"
			className={[
				"inline-block rounded-full animate-spin shrink-0",
				sizes[size],
				colors[color],
				className,
			]
				.filter(Boolean)
				.join(" ")}
		/>
	);
};

export const LoadingOverlay = ({
	visible = false,
	text = "",
	blur = true,
	fullScreen = false,
}) => {
	if (!visible) return null;

	return (
		<div
			role="status"
			aria-live="polite"
			className={[
				"flex flex-col items-center justify-center gap-3 z-50",
				"bg-main/70",
				blur ? "backdrop-blur-sm" : "",
				fullScreen ? "fixed inset-0" : "absolute inset-0 rounded-[inherit]",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<Spinner size="lg" />
			{text && (
				<p className="text-sm text-first/70 font-medium tracking-wide">
					{text}
				</p>
			)}
		</div>
	);
};
