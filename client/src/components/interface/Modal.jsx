/**
 * Modal / ConfirmDialog Component
 *
 * Exports:
 * - Modal — modal genérico para cualquier contenido
 * - ConfirmDialog — modal especializado para confirmar acciones destructivas
 *
 * Modal Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string (opcional)
 * - description: string (opcional)
 * - size: "sm" | "md" | "lg" | "xl" (default: "md")
 * - closeOnOverlay: boolean (default: true)
 * - showCloseButton: boolean (default: true)
 * - className: string
 * - children: ReactNode
 *
 * ConfirmDialog Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: () => void
 * - title: string
 * - description: string (opcional)
 * - confirmLabel: string (default: "Confirmar")
 * - cancelLabel: string (default: "Cancelar")
 * - variant: "danger" | "warning" | "info" (default: "danger")
 * - loading: boolean (default: false)
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { BsX } from "react-icons/bs";
import Button from "../common/Button";

// ─── Sizes ─────────────────────────────────────────────────────────────────

const sizes = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
};

// ─── Modal ─────────────────────────────────────────────────────────────────

export const Modal = ({
	isOpen,
	onClose,
	title,
	description,
	size = "md",
	closeOnOverlay = true,
	showCloseButton = true,
	className = "",
	children,
}) => {
	// lock body scroll while open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// close on Escape
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			aria-modal="true"
			role="dialog"
		>
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={closeOnOverlay ? onClose : undefined}
			/>

			{/* Panel */}
			<div
				className={[
					"relative w-full rounded-xl border border-first/10",
					"bg-main shadow-xl flex flex-col",
					"max-h-[90dvh]",
					sizes[size],
					className,
				]
					.filter(Boolean)
					.join(" ")}
			>
				{/* Header */}
				{(title || showCloseButton) && (
					<div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-first/10 shrink-0">
						<div className="flex flex-col gap-1">
							{title && (
								<h2 className="text-base font-semibold text-first">{title}</h2>
							)}
							{description && (
								<p className="text-sm text-first/50">{description}</p>
							)}
						</div>
						{showCloseButton && (
							<Button
								iconOnly
								variant="ghost"
								size="sm"
								icon={<BsX />}
								onClick={onClose}
								aria-label="Cerrar"
							/>
						)}
					</div>
				)}

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto">{children}</div>
			</div>
		</div>,
		document.body,
	);
};

// ─── ConfirmDialog ─────────────────────────────────────────────────────────

const confirmVariants = {
	danger: { button: "danger", titleColor: "text-error" },
	warning: { button: "primary", titleColor: "text-yellow-500" },
	info: { button: "primary", titleColor: "text-second" },
};

export const ConfirmDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = "Confirmar",
	cancelLabel = "Cancelar",
	variant = "danger",
	loading = false,
}) => {
	const v = confirmVariants[variant];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="sm"
			closeOnOverlay={!loading}
		>
			<div className="flex flex-col gap-5">
				{/* Content */}
				<div className="flex flex-col gap-1.5">
					<h2 className={["text-base font-semibold", v.titleColor].join(" ")}>
						{title}
					</h2>
					{description && (
						<p className="text-sm text-first/50">{description}</p>
					)}
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={loading}
					>
						{cancelLabel}
					</Button>
					<Button
						variant={v.button}
						size="sm"
						loading={loading}
						onClick={onConfirm}
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
