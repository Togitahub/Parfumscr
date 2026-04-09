/**
 * PeriodSelector Component
 *
 * Selector de período reutilizable que incluye opciones rápidas y
 * un selector de rango de fechas personalizado.
 *
 * Props:
 * - period: string — período activo ("week" | "month" | "year" | "all" | "custom")
 * - startDate: string — fecha de inicio en formato YYYY-MM-DD (solo para custom)
 * - endDate: string — fecha de fin en formato YYYY-MM-DD (solo para custom)
 * - onChange: ({ period, startDate, endDate }) => void
 * - periods: Array<{ key, label }> — períodos a mostrar (default: semana, mes, año, todo)
 * - className: string
 */

import { useState, useRef, useEffect } from "react";
import { BsCalendar3, BsChevronDown, BsX, BsCheck } from "react-icons/bs";

const DEFAULT_PERIODS = [
	{ key: "day", label: "Hoy" },
	{ key: "week", label: "Esta semana" },
	{ key: "month", label: "Este mes" },
	{ key: "year", label: "Este año" },
	{ key: "all", label: "Todo" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const formatDateDisplay = (dateStr) => {
	if (!dateStr) return "";
	const d = new Date(dateStr + "T00:00:00");
	return d.toLocaleDateString("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const getPeriodLabel = (period, startDate, endDate, periods) => {
	if (period === "custom") {
		if (startDate && endDate) {
			return `${formatDateDisplay(startDate)} → ${formatDateDisplay(endDate)}`;
		}
		if (startDate) return `Desde ${formatDateDisplay(startDate)}`;
		return "Rango personalizado";
	}
	return periods.find((p) => p.key === period)?.label ?? "Período";
};

// ── Component ─────────────────────────────────────────────────────────────────

const PeriodSelector = ({
	period,
	startDate = "",
	endDate = "",
	onChange,
	periods = DEFAULT_PERIODS,
	className = "",
}) => {
	const [open, setOpen] = useState(false);
	const [localStart, setLocalStart] = useState(startDate);
	const [localEnd, setLocalEnd] = useState(endDate);
	const [showCustom, setShowCustom] = useState(period === "custom");
	const ref = useRef(null);

	// Cierra el panel al hacer click fuera
	useEffect(() => {
		const handler = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Sincroniza estado local cuando cambian las props externas
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setLocalStart(startDate);
		setLocalEnd(endDate);
		setShowCustom(period === "custom");
	}, [period, startDate, endDate]);

	const handlePeriodClick = (key) => {
		if (key === "custom") {
			setShowCustom(true);
			return;
		}
		setShowCustom(false);
		onChange({ period: key, startDate: "", endDate: "" });
		setOpen(false);
	};

	const handleApplyCustom = () => {
		if (!localStart) return;
		onChange({
			period: "custom",
			startDate: localStart,
			endDate: localEnd || localStart,
		});
		setOpen(false);
	};

	const handleClearCustom = () => {
		setLocalStart("");
		setLocalEnd("");
		setShowCustom(false);
		onChange({ period: "day", startDate: "", endDate: "" });
		setOpen(false);
	};

	const isCustomActive = period === "custom";
	const label = getPeriodLabel(period, startDate, endDate, periods);

	return (
		<div ref={ref} className={["relative", className].join(" ")}>
			{/* Trigger button */}
			<button
				onClick={() => setOpen((v) => !v)}
				className={[
					"flex items-center gap-2 h-9 px-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
					isCustomActive
						? "border-second bg-second/10 text-second"
						: "border-first/15 text-first/60 hover:border-first/30 hover:text-first bg-main",
				].join(" ")}
			>
				<BsCalendar3 className="w-3.5 h-3.5 shrink-0" />
				<span className="max-w-48 truncate">{label}</span>
				<BsChevronDown
					className={[
						"w-3 h-3 shrink-0 transition-transform duration-200",
						open ? "rotate-180" : "",
					].join(" ")}
				/>
			</button>

			{/* Dropdown */}
			{open && (
				<div
					className="absolute top-full mt-2 w-50 rounded-2xl border border-first/10 bg-main shadow-2xl z-1000 overflow-hidden"
					style={{ animation: "fadeUp 0.18s ease both" }}
				>
					{/* Quick periods */}
					{!showCustom && (
						<div className="p-2 flex flex-col gap-0.5">
							<p className="text-[10px] font-semibold uppercase tracking-widest text-first/30 px-2 py-1.5">
								Períodos rápidos
							</p>
							{periods.map((p) => (
								<button
									key={p.key}
									onClick={() => handlePeriodClick(p.key)}
									className={[
										"flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
										period === p.key && !isCustomActive
											? "bg-second/10 text-second"
											: "text-first/60 hover:bg-first/5 hover:text-first",
									].join(" ")}
								>
									{p.label}
									{period === p.key && !isCustomActive && (
										<BsCheck className="w-3.5 h-3.5" />
									)}
								</button>
							))}

							{/* Custom range button */}
							<div className="my-1 h-px bg-first/8" />
							<button
								onClick={() => setShowCustom(true)}
								className={[
									"flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
									isCustomActive
										? "bg-second/10 text-second"
										: "text-first/60 hover:bg-first/5 hover:text-first",
								].join(" ")}
							>
								<BsCalendar3 className="w-3.5 h-3.5 shrink-0" />
								Rango personalizado
								{isCustomActive && <BsCheck className="w-3.5 h-3.5 ml-auto" />}
							</button>
						</div>
					)}

					{/* Custom date picker */}
					{showCustom && (
						<div className="p-4 flex flex-col gap-4">
							{/* Header */}
							<div className="flex items-center justify-between">
								<p className="text-sm font-semibold text-first">
									Rango de fechas
								</p>
								<button
									onClick={() => setShowCustom(false)}
									className="w-7 h-7 rounded-lg flex items-center justify-center text-first/30 hover:text-first/60 hover:bg-first/8 transition-all cursor-pointer"
								>
									<BsX className="w-4 h-4" />
								</button>
							</div>

							{/* Date inputs */}
							<div className="flex flex-col gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-first/50">
										Fecha de inicio
									</label>
									<input
										type="date"
										value={localStart}
										max={localEnd || today()}
										onChange={(e) => setLocalStart(e.target.value)}
										className="w-full h-9 px-3 rounded-xl border border-first/15 bg-main text-sm text-first focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second transition-all duration-150 cursor-pointer"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-first/50">
										Fecha de fin
									</label>
									<input
										type="date"
										value={localEnd}
										min={localStart}
										max={today()}
										onChange={(e) => setLocalEnd(e.target.value)}
										className="w-full h-9 px-3 rounded-xl border border-first/15 bg-main text-sm text-first focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second transition-all duration-150 cursor-pointer"
									/>
								</div>
							</div>

							{/* Preview */}
							{localStart && localEnd && (
								<div
									className="px-3 py-2 rounded-xl text-xs text-first/50 leading-relaxed"
									style={{
										background:
											"color-mix(in srgb, var(--color-second) 8%, transparent)",
										border:
											"1px solid color-mix(in srgb, var(--color-second) 20%, transparent)",
									}}
								>
									<span style={{ color: "var(--color-second)" }}>
										{formatDateDisplay(localStart)}
									</span>
									<span className="mx-2">→</span>
									<span style={{ color: "var(--color-second)" }}>
										{formatDateDisplay(localEnd)}
									</span>
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-2">
								{isCustomActive && (
									<button
										onClick={handleClearCustom}
										className="flex-1 h-8 rounded-xl border border-first/15 text-xs text-first/50 hover:text-first/80 hover:border-first/30 transition-all duration-150 cursor-pointer"
									>
										Limpiar
									</button>
								)}
								<button
									onClick={handleApplyCustom}
									disabled={!localStart}
									className={[
										"flex-1 h-8 rounded-xl text-xs font-semibold transition-all duration-150",
										localStart
											? "bg-second text-main cursor-pointer hover:opacity-85"
											: "bg-first/10 text-first/30 cursor-not-allowed",
									].join(" ")}
								>
									Aplicar
								</button>
							</div>

							{/* Back link */}
							<button
								onClick={() => setShowCustom(false)}
								className="text-xs text-first/30 hover:text-first/60 transition-colors text-center cursor-pointer"
							>
								← Ver períodos rápidos
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default PeriodSelector;
