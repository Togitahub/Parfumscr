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

import Toast from "../components/interface/Toast";

import { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const remove = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const add = useCallback(
		(type, message, options = {}) => {
			const id = crypto.randomUUID();
			const duration = options.duration ?? 3000;

			setToasts((prev) => [...prev, { id, type, message, ...options }]);

			if (duration > 0) {
				setTimeout(() => remove(id), duration);
			}
		},
		[remove],
	);

	const toast = {
		success: (message, opts) => add("success", message, opts),
		error: (message, opts) => add("error", message, opts),
		info: (message, opts) => add("info", message, opts),
		warning: (message, opts) => add("warning", message, opts),
	};

	return (
		<ToastContext.Provider value={toast}>
			{children}

			{/* Container */}
			<div
				aria-live="polite"
				className="fixed top-5 right-5 z-100 flex flex-col gap-2 items-end"
			>
				{toasts.map((t) => (
					<Toast key={t.id} {...t} onClose={remove} />
				))}
			</div>
		</ToastContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within a ToastProvider");
	return ctx;
};
