import { forwardRef } from "react";

/**
 * Textarea Component
 *
 * Props:
 * - label: string — etiqueta sobre el textarea
 * - placeholder: string
 * - hint: string — texto de ayuda debajo del textarea
 * - error: string — mensaje de error (activa estado de error)
 * - success: boolean — activa estado de éxito
 * - size: "sm" | "md" | "lg" (default: "md")
 * - rows: number — cantidad de filas visibles (default: 4)
 * - resize: "none" | "vertical" | "horizontal" | "both" (default: "vertical")
 * - disabled: boolean
 * - readOnly: boolean
 * - fullWidth: boolean (default: true)
 * - maxLength: number — límite de caracteres (muestra contador)
 * - className: string — clases adicionales al wrapper
 * - textareaClassName: string — clases adicionales al textarea
 * - id: string — si no se pasa, se genera desde label
 * - ...rest — value, onChange, onBlur, name, required, etc.
 */

const sizes = {
	sm: "text-xs px-3 py-2",
	md: "text-sm px-3 py-2",
	lg: "text-base px-4 py-3",
};

const labelSizes = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const resizeClasses = {
	none: "resize-none",
	vertical: "resize-y",
	horizontal: "resize-x",
	both: "resize",
};

const Textarea = forwardRef(
	(
		{
			label,
			placeholder,
			hint,
			error,
			success = false,
			size = "md",
			rows = 4,
			resize = "vertical",
			disabled = false,
			readOnly = false,
			fullWidth = true,
			maxLength,
			className = "",
			textareaClassName = "",
			id,
			...rest
		},
		ref,
	) => {
		const textareaId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
		const hasError = Boolean(error);
		const currentLength = rest.value ? String(rest.value).length : 0;

		const borderClass = hasError
			? "border-error focus:ring-error/30 focus:border-error"
			: success
				? "border-success focus:ring-success/30 focus:border-success"
				: "border-first/20 focus:ring-second/30 focus:border-second";

		const textareaBase = [
			"w-full rounded-md border bg-main text-first",
			"transition-all duration-150 ease-in-out",
			"focus:outline-none focus:ring-2",
			"placeholder:text-first/30",
			sizes[size],
			resizeClasses[resize],
			borderClass,
			disabled ? "opacity-50 cursor-not-allowed bg-first/5" : "",
			readOnly ? "cursor-default bg-first/5" : "",
			textareaClassName,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div
				className={[
					"flex flex-col gap-1",
					fullWidth ? "w-full" : "w-fit",
					className,
				]
					.filter(Boolean)
					.join(" ")}
			>
				{/* Label */}
				{label && (
					<label
						htmlFor={textareaId}
						className={[
							"font-medium text-first/80 select-none",
							labelSizes[size],
							disabled ? "opacity-50" : "",
						]
							.filter(Boolean)
							.join(" ")}
					>
						{label}
						{rest.required && (
							<span className="text-error ml-1" aria-hidden="true">
								*
							</span>
						)}
					</label>
				)}

				{/* Textarea */}
				<textarea
					ref={ref}
					id={textareaId}
					rows={rows}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readOnly}
					maxLength={maxLength}
					aria-invalid={hasError}
					aria-describedby={
						error
							? `${textareaId}-error`
							: hint
								? `${textareaId}-hint`
								: undefined
					}
					className={textareaBase}
					{...rest}
				/>

				{/* Bottom row: error/hint + counter */}
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						{/* Error */}
						{error && (
							<p
								id={`${textareaId}-error`}
								role="alert"
								className={["text-error font-medium", labelSizes[size]].join(
									" ",
								)}
							>
								{error}
							</p>
						)}

						{/* Hint */}
						{hint && !error && (
							<p
								id={`${textareaId}-hint`}
								className={["text-first/40", labelSizes[size]].join(" ")}
							>
								{hint}
							</p>
						)}
					</div>

					{/* Character counter */}
					{maxLength && (
						<p
							className={[
								"shrink-0 tabular-nums",
								labelSizes[size],
								currentLength >= maxLength ? "text-error" : "text-first/30",
							].join(" ")}
						>
							{currentLength}/{maxLength}
						</p>
					)}
				</div>
			</div>
		);
	},
);

Textarea.displayName = "Textarea";

export default Textarea;
