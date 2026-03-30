import { forwardRef, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

/**
 * Input Component
 *
 * Props:
 * - type: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" (default: "text")
 * - label: string — etiqueta sobre el input
 * - placeholder: string
 * - hint: string — texto de ayuda debajo del input
 * - error: string — mensaje de error (activa estado de error)
 * - success: boolean — activa estado de éxito
 * - iconLeft: ReactNode — ícono a la izquierda
 * - iconRight: ReactNode — ícono a la derecha (ignorado en type="password")
 * - size: "sm" | "md" | "lg" (default: "md")
 * - disabled: boolean
 * - readOnly: boolean
 * - fullWidth: boolean (default: true)
 * - className: string — clases adicionales al wrapper
 * - inputClassName: string — clases adicionales al input
 * - id: string — si no se pasa, se genera desde label
 * - ...rest — value, onChange, onBlur, name, required, min, max, step, autoComplete, etc.
 */

const sizes = {
	sm: "text-xs px-3 py-1.5 h-8",
	md: "text-sm px-3 py-2 h-10",
	lg: "text-base px-4 py-2.5 h-12",
};

const iconPaddingLeft = {
	sm: "pl-8",
	md: "pl-9",
	lg: "pl-10",
};

const iconPaddingRight = {
	sm: "pr-8",
	md: "pr-9",
	lg: "pr-10",
};

const labelSizes = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const iconSizes = {
	sm: "w-4 h-4",
	md: "w-4 h-4",
	lg: "w-5 h-5",
};

const iconPositions = {
	sm: "left-2.5",
	md: "left-3",
	lg: "left-3.5",
};

const iconPositionsRight = {
	sm: "right-2.5",
	md: "right-3",
	lg: "right-3.5",
};

const Input = forwardRef(
	(
		{
			type = "text",
			label,
			placeholder,
			hint,
			error,
			success = false,
			iconLeft,
			iconRight,
			size = "md",
			disabled = false,
			readOnly = false,
			fullWidth = true,
			className = "",
			inputClassName = "",
			id,
			...rest
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = useState(false);

		const isPassword = type === "password";
		const resolvedType = isPassword
			? showPassword
				? "text"
				: "password"
			: type;
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

		const hasError = Boolean(error);
		const hasIconRight = isPassword || Boolean(iconRight);

		const borderClass = hasError
			? "border-error focus:ring-error/30 focus:border-error"
			: success
				? "border-success focus:ring-success/30 focus:border-success"
				: "border-first/20 focus:ring-second/30 focus:border-second";

		const inputBase = [
			"w-full rounded-md border bg-main text-first",
			"transition-all duration-150 ease-in-out",
			"focus:outline-none focus:ring-2",
			"placeholder:text-first/30",
			sizes[size],
			iconLeft ? iconPaddingLeft[size] : "",
			hasIconRight ? iconPaddingRight[size] : "",
			borderClass,
			disabled ? "opacity-50 cursor-not-allowed bg-first/5" : "",
			readOnly ? "cursor-default bg-first/5" : "",
			inputClassName,
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
						htmlFor={inputId}
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

				{/* Input wrapper */}
				<div className="relative flex items-center">
					{/* Icon left */}
					{iconLeft && (
						<span
							className={[
								"absolute flex items-center pointer-events-none text-first/40",
								iconSizes[size],
								iconPositions[size],
							].join(" ")}
						>
							{iconLeft}
						</span>
					)}

					<input
						ref={ref}
						id={inputId}
						type={resolvedType}
						placeholder={placeholder}
						disabled={disabled}
						readOnly={readOnly}
						aria-invalid={hasError}
						aria-describedby={
							error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
						}
						className={inputBase}
						{...rest}
					/>

					{/* Icon right / toggle password */}
					{hasIconRight && (
						<span
							className={[
								"absolute flex items-center text-first/40",
								iconSizes[size],
								iconPositionsRight[size],
								isPassword
									? "cursor-pointer hover:text-first/70 transition-colors"
									: "pointer-events-none",
							].join(" ")}
							onClick={
								isPassword ? () => setShowPassword((v) => !v) : undefined
							}
							aria-label={
								isPassword
									? showPassword
										? "Ocultar contraseña"
										: "Mostrar contraseña"
									: undefined
							}
							role={isPassword ? "button" : undefined}
							tabIndex={isPassword ? 0 : undefined}
							onKeyDown={
								isPassword
									? (e) => e.key === "Enter" && setShowPassword((v) => !v)
									: undefined
							}
						>
							{isPassword ? (
								showPassword ? (
									<BsEyeSlash className="w-full h-full" />
								) : (
									<BsEye className="w-full h-full" />
								)
							) : (
								iconRight
							)}
						</span>
					)}
				</div>

				{/* Error message */}
				{error && (
					<p
						id={`${inputId}-error`}
						role="alert"
						className={["text-error font-medium", labelSizes[size]].join(" ")}
					>
						{error}
					</p>
				)}

				{/* Hint */}
				{hint && !error && (
					<p
						id={`${inputId}-hint`}
						className={["text-first/40", labelSizes[size]].join(" ")}
					>
						{hint}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
