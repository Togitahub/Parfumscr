/**
 * SearchBar Component
 *
 * Barra de búsqueda global conectada al FilterContext.
 * Puede vivir en el NavBar o en cualquier vista.
 *
 * Props:
 * - placeholder: string
 * - size: "sm" | "md" | "lg" (default: "md")
 * - className: string
 */

import { useRef } from "react";
import { BsSearch, BsX } from "react-icons/bs";
import { useFilters } from "../../hooks/FilterContext";

const sizes = {
	sm: "h-8 text-xs pl-8 pr-8",
	md: "h-10 text-sm pl-9 pr-9",
	lg: "h-12 text-base pl-10 pr-10",
};

const iconSizes = {
	sm: "w-3.5 h-3.5 left-2.5",
	md: "w-4 h-4 left-3",
	lg: "w-5 h-5 left-3.5",
};

const clearSizes = {
	sm: "w-3.5 h-3.5 right-2.5",
	md: "w-4 h-4 right-3",
	lg: "w-5 h-5 right-3.5",
};

const SearchBar = ({
	placeholder = "Buscar perfumes, marcas...",
	size = "md",
	className = "",
}) => {
	const { search, setSearch } = useFilters();
	const inputRef = useRef(null);

	const handleClear = () => {
		setSearch("");
		inputRef.current?.focus();
	};

	return (
		<div className={["relative flex items-center", className].join(" ")}>
			{/* Search icon */}
			<span
				className={[
					"absolute flex items-center pointer-events-none text-first/35",
					iconSizes[size],
				].join(" ")}
			>
				<BsSearch className="w-full h-full" />
			</span>

			{/* Input */}
			<input
				ref={inputRef}
				type="text"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder={placeholder}
				className={[
					"w-full rounded-xl border border-first/15 bg-main text-first",
					"placeholder:text-first/30 transition-all duration-150",
					"focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second",
					sizes[size],
				].join(" ")}
			/>

			{/* Clear button */}
			{search && (
				<button
					onClick={handleClear}
					aria-label="Limpiar búsqueda"
					className={[
						"absolute flex items-center text-first/30 hover:text-first/60",
						"transition-colors duration-150 cursor-pointer",
						clearSizes[size],
					].join(" ")}
				>
					<BsX className="w-full h-full" />
				</button>
			)}
		</div>
	);
};

export default SearchBar;
