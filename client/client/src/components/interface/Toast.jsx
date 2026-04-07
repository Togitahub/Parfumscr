/**
 * Toast / Notification Component
 *
 * Exports:
 * - ToastContainer — debe ir en el root de la app (App.jsx o main.jsx)
 * - useToast — hook para disparar toasts desde cualquier componente
 *
 * useToast returns:
 * - toast.success(message, options?)
 * - toast.error(message, options?)
 * - toast.info(message, options?)
 * - toast.warning(message, options?)
 *
 * Options:
 * - duration: number (ms, default: 3000)
 * - description: string
 */

import Button from "../common/Button";

import { useState, useEffect } from "react";
import {
	BsCheckCircle,
	BsXCircle,
	BsInfoCircle,
	BsExclamationTriangle,
	BsX,
} from "react-icons/bs";

// ─── Styles ────────────────────────────────────────────────────────────────

const variants = {
	success: {
		bar: "bg-success",
		icon: <BsCheckCircle className="w-4 h-4 shrink-0" />,
		iconColor: "text-success",
	},
	error: {
		bar: "bg-error",
		icon: <BsXCircle className="w-4 h-4 shrink-0" />,
		iconColor: "text-error",
	},
	info: {
		bar: "bg-second",
		icon: <BsInfoCircle className="w-4 h-4 shrink-0" />,
		iconColor: "text-second",
	},
	warning: {
		bar: "bg-yellow-400",
		icon: <BsExclamationTriangle className="w-4 h-4 shrink-0" />,
		iconColor: "text-yellow-400",
	},
};

// ─── Single Toast ──────────────────────────────────────────────────────────

const Toast = ({ id, type = "info", message, description, onClose }) => {
	const [visible, setVisible] = useState(false);
	const v = variants[type];

	// mount animation
	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 10);
		return () => clearTimeout(t);
	}, []);

	const handleClose = () => {
		setVisible(false);
		setTimeout(() => onClose(id), 300);
	};

	return (
		<div
			className={[
				"relative flex items-start gap-3 w-80 rounded-lg border border-first/10",
				"bg-main shadow-lg px-4 py-3 overflow-hidden",
				"transition-all duration-300 ease-in-out",
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
			].join(" ")}
		>
			{/* Colored left bar */}
			<span
				className={[
					"absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
					v.bar,
				].join(" ")}
			/>

			{/* Icon */}
			<span className={["mt-0.5", v.iconColor].join(" ")}>{v.icon}</span>

			{/* Content */}
			<div className="flex flex-col gap-0.5 flex-1 min-w-0">
				<p className="text-sm font-medium text-first leading-snug">{message}</p>
				{description && (
					<p className="text-xs text-first/50 leading-snug">{description}</p>
				)}
			</div>

			{/* Close button */}
			<Button
				iconOnly
				variant="ghost"
				size="xs"
				icon={<BsX />}
				onClick={handleClose}
				aria-label="Cerrar"
			/>
		</div>
	);
};

export default Toast;
