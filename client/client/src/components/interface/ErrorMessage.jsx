/**
 * ErrorMessage Component
 *
 * Props:
 * - message: string — mensaje de error a mostrar
 * - size: "sm" | "md" | "lg" (default: "md")
 * - centered: boolean — centra el contenido (default: false)
 * - className: string — clases adicionales al wrapper
 */

import { BsExclamationCircle } from "react-icons/bs";

const sizes = {
	sm: "text-xs gap-1.5",
	md: "text-sm gap-2",
	lg: "text-base gap-2.5",
};

const iconSizes = {
	sm: "w-3.5 h-3.5",
	md: "w-4 h-4",
	lg: "w-5 h-5",
};

const ErrorMessage = ({
	message,
	size = "md",
	centered = false,
	className = "",
}) => {
	if (!message) return null;

	return (
		<div
			role="alert"
			className={[
				"flex items-center text-error",
				sizes[size],
				centered ? "justify-center" : "",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<BsExclamationCircle
				className={[iconSizes[size], "shrink-0"].join(" ")}
			/>
			<span className="font-medium">{message}</span>
		</div>
	);
};

export default ErrorMessage;
