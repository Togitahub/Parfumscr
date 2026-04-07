import { forwardRef } from "react";
import { BsChevronDown } from "react-icons/bs";

/**
 * Select Component
 *
 * Props:
 * - options: Array<{ value: string | number, label: string, disabled?: boolean }>
 * - label: string — etiqueta sobre el select
 * - placeholder: string — opción vacía inicial (default: "Seleccionar...")
 * - hint: string — texto de ayuda debajo del select
 * - error: string — mensaje de error (activa estado de error)
 * - success: boolean — activa estado de éxito
 * - size: "sm" | "md" | "lg" (default: "md")
 * - disabled: boolean
 * - fullWidth: boolean (default: true)
 * - className: string — clases adicionales al wrapper
 * - selectClassName: string — clases adicionales al select
 * - id: string — si no se pasa, se genera desde label
 * - ...rest — value, onChange, onBlur, name, required, etc.
 */

const sizes = {
	sm: "text-xs pl-3 pr-8 py-1.5 h-8",
	md: "text-sm pl-3 pr-9 py-2 h-10",
	lg: "text-base pl-4 pr-10 py-2.5 h-12",
};

const labelSizes = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const iconSizes = {
	sm: "w-3 h-3 right-2.5",
	md: "w-3.5 h-3.5 right-3",
	lg: "w-4 h-4 right-3.5",
};

const Select = forwardRef(
	(
		{
			options = [],
			label,
			placeholder = "Seleccionar...",
			hint,
			error,
			success = false,
			size = "md",
			disabled = false,
			fullWidth = true,
			className = "",
			selectClassName = "",
			id,
			...rest
		},
		ref,
	) => {
		const selectId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

		const hasError = Boolean(error);

		const borderClass = hasError
			? "border-error focus:ring-error/30 focus:border-error"
			: success
				? "border-success focus:ring-success/30 focus:border-success"
				: "border-first/20 focus:ring-second/30 focus:border-second";

		const selectBase = [
			"w-full rounded-md border bg-main text-first appearance-none",
			"transition-all duration-150 ease-in-out",
			"focus:outline-none focus:ring-2",
			"cursor-pointer",
			sizes[size],
			borderClass,
			disabled ? "opacity-50 cursor-not-allowed" : "",
			// placeholder color when no value selected
			!rest.value && !rest.defaultValue ? "text-first/30" : "",
			selectClassName,
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
						htmlFor={selectId}
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

				{/* Select wrapper */}
				<div className="relative flex items-center">
					<select
						ref={ref}
						id={selectId}
						disabled={disabled}
						aria-invalid={hasError}
						aria-describedby={
							error
								? `${selectId}-error`
								: hint
									? `${selectId}-hint`
									: undefined
						}
						className={selectBase}
						{...rest}
					>
						{/* Placeholder option */}
						{placeholder && (
							<option value="" disabled hidden>
								{placeholder}
							</option>
						)}

						{options.map((opt) => (
							<option key={opt.value} value={opt.value} disabled={opt.disabled}>
								{opt.label}
							</option>
						))}
					</select>

					{/* Chevron icon */}
					<span
						className={[
							"absolute pointer-events-none text-first/40",
							iconSizes[size],
						].join(" ")}
					>
						<BsChevronDown className="w-full h-full" />
					</span>
				</div>

				{/* Error message */}
				{error && (
					<p
						id={`${selectId}-error`}
						role="alert"
						className={["text-error font-medium", labelSizes[size]].join(" ")}
					>
						{error}
					</p>
				)}

				{/* Hint */}
				{hint && !error && (
					<p
						id={`${selectId}-hint`}
						className={["text-first/40", labelSizes[size]].join(" ")}
					>
						{hint}
					</p>
				)}
			</div>
		);
	},
);

Select.displayName = "Select";

export default Select;
