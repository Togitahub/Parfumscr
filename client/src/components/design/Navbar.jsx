import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import {
	BsHeart,
	BsCart3,
	BsPerson,
	BsList,
	BsX,
	BsChevronDown,
	BsSpeedometer2,
	BsInstagram,
	BsFacebook,
	BsWhatsapp,
	BsReceipt,
} from "react-icons/bs";

import { useAuth } from "../../hooks/AuthContext";
import { useCart } from "../../hooks/CartContext";
import { useStore } from "../../hooks/StoreContext";

import { GET_NOTES } from "../../graphql/note/NoteQueries";
import { GET_BRANDS } from "../../graphql/brand/BrandQueries";
import { GET_SEGMENTS } from "../../graphql/segment/SegmentQueries";
import { GET_CATEGORIES } from "../../graphql/category/CategoryQueries";
import { GET_USER_FAVORITES } from "../../graphql/favorites/FavoritesQueries";

import Button from "../common/Button";
import { Spinner } from "../interface/LoadingUi";

// ── Hook: cierra al hacer click fuera ────────────────────────────────────────

const useClickOutside = (ref, handler) => {
	useEffect(() => {
		const listener = (e) => {
			if (!ref.current || ref.current.contains(e.target)) return;
			handler();
		};
		document.addEventListener("mousedown", listener);
		return () => document.removeEventListener("mousedown", listener);
	}, [ref, handler]);
};

// ── Dropdown genérico ────────────────────────────────────────────────────────

const Dropdown = ({ label, items = [], loading, onItemClick }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);
	useClickOutside(ref, () => setOpen(false));

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className={[
					"nav-dropdown-trigger flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
					"transition-all duration-200 cursor-pointer select-none",
					open
						? "text-second bg-second/8"
						: "text-first/60 hover:text-first hover:bg-first/5",
				].join(" ")}
			>
				{label}
				<BsChevronDown
					className={[
						"w-3 h-3 transition-transform duration-200",
						open ? "rotate-180" : "",
					].join(" ")}
				/>
			</button>

			{open && (
				<div className="nav-dropdown absolute top-full left-0 mt-2 w-52 rounded-xl border border-first/10 bg-main shadow-2xl overflow-hidden z-50">
					{loading ? (
						<div className="px-4 py-6 flex justify-center">
							<span className="w-4 h-4 rounded-full border-2 border-second/20 border-t-second animate-spin" />
						</div>
					) : items.length === 0 ? (
						<p className="px-4 py-3 text-xs text-first/30">Sin elementos</p>
					) : (
						<div className="py-1.5 max-h-70 overflow-y-auto nav-notes-scroll">
							{items.map((item) => (
								<button
									key={item.id}
									onClick={() => {
										onItemClick(item);
										setOpen(false);
									}}
									className="w-full text-left px-4 py-2 border-b border-b-first/30 text-sm text-first/70 hover:text-first hover:bg-second/8 transition-colors duration-150 cursor-pointer"
								>
									{item.name}
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

// ── Dropdown de Acordes (scroll + columnas) ────────────────────────────────────

const NotesDropdown = ({ items = [], loading }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);
	const navigate = useNavigate();
	useClickOutside(ref, () => setOpen(false));

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className={[
					"nav-dropdown-trigger flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
					"transition-all duration-200 cursor-pointer select-none",
					open
						? "text-second bg-second/8"
						: "text-first/60 hover:text-first hover:bg-first/5",
				].join(" ")}
			>
				Acordes
				<BsChevronDown
					className={[
						"w-3 h-3 transition-transform duration-200",
						open ? "rotate-180" : "",
					].join(" ")}
				/>
			</button>

			{open && (
				<div className="nav-dropdown absolute top-full left-0 mt-2 w-72 rounded-xl border border-first/10 bg-main shadow-2xl z-50 overflow-hidden">
					{loading ? (
						<div className="px-4 py-6 flex justify-center">
							<span className="w-4 h-4 rounded-full border-2 border-second/20 border-t-second animate-spin" />
						</div>
					) : items.length === 0 ? (
						<p className="px-4 py-3 text-xs text-first/30">Sin acordes</p>
					) : (
						<div className="p-3 max-h-72 overflow-y-auto nav-notes-scroll">
							<p className="text-[10px] font-semibold uppercase tracking-widest text-first/30 px-1 pb-2">
								Acordes Olfativos
							</p>
							<div className="flex flex-wrap gap-1.5">
								{items.map((note) => (
									<button
										key={note.id}
										onClick={() => {
											navigate(`/store/note/${note.id}`);
											setOpen(false);
										}}
										className="px-2.5 py-1 rounded-full text-xs font-medium border border-first/10 text-first/60 hover:text-second hover:border-second/30 hover:bg-second/8 transition-all duration-150 cursor-pointer"
									>
										{note.name}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

// Agrega este componente dentro del archivo, antes del NavBar principal
const ProfileDropdown = ({ user, onLogout, onProfile }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);
	useClickOutside(ref, () => setOpen(false));

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className={[
					"flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
					open
						? "text-second bg-second/10"
						: "text-first/50 hover:text-first hover:bg-first/8",
				].join(" ")}
				aria-label="Perfil"
			>
				<BsPerson className="w-4 h-4" />
			</button>

			{open && (
				<div className="nav-dropdown absolute top-full right-0 mt-2 w-48 rounded-xl border border-first/10 bg-main shadow-2xl overflow-hidden z-50">
					<div className="px-4 py-3 border-b border-first/8">
						<p className="text-xs font-medium text-first truncate">
							{user?.name}
						</p>
						<p className="text-xs text-first/40 truncate">{user?.email}</p>
					</div>
					<div className="py-1.5">
						<button
							onClick={() => {
								setOpen(false);
								onProfile();
							}}
							className="w-full text-left px-4 py-2 text-sm text-first/70 hover:text-first hover:bg-first/8 transition-colors duration-150 cursor-pointer"
						>
							Editar perfil
						</button>
						<button
							onClick={() => {
								setOpen(false);
								onLogout();
							}}
							className="w-full text-left px-4 py-2 text-sm text-error/80 hover:text-error hover:bg-error/5 transition-colors duration-150 cursor-pointer"
						>
							Cerrar sesión
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

// ── Icon NavLink ─────────────────────────────────────────────────────────────

const IconLink = ({ to, icon, label, badge }) => (
	<NavLink
		to={to}
		aria-label={label}
		className={({ isActive }) =>
			[
				"relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
				isActive
					? "text-second bg-second/10"
					: "text-first/50 hover:text-first hover:bg-first/8",
			].join(" ")
		}
	>
		{icon}
		{badge > 0 && (
			<span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-second text-main text-[9px] font-bold flex items-center justify-center leading-none">
				{badge > 9 ? "9+" : badge}
			</span>
		)}
	</NavLink>
);

// ── NavBar principal ─────────────────────────────────────────────────────────

const NavBar = () => {
	const navigate = useNavigate();

	const { store } = useStore();
	const { totalItems } = useCart();
	const { user, isAuthenticated, logout } = useAuth();

	const [scrolled, setScrolled] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

	const { data: notesData, loading: loadingNotes } = useQuery(GET_NOTES);
	const { data: brandsData, loading: loadingBrands } = useQuery(GET_BRANDS);
	const { data: segmentsData, loading: loadingSegs } = useQuery(GET_SEGMENTS);

	const { data: favsData, loading: loadingFavs } = useQuery(
		GET_USER_FAVORITES,
		{
			variables: { userId: user?.id },
			skip: !isAuthenticated,
		},
	);

	const { data: categoriesData, loading: loadingCats } =
		useQuery(GET_CATEGORIES);

	const notes = notesData?.getNotes ?? [];
	const brands = brandsData?.getBrands ?? [];
	const favs = favsData?.getUserFavorites ?? [];
	const segments = segmentsData?.getSegments ?? [];
	const categories = categoriesData?.getCategories ?? [];

	const favsQty = favs?.products?.length;

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	const closeMobile = useCallback(() => setMobileOpen(false), []);

	const handleBrandClick = (brand) => {
		navigate(`/store/brand/${brand.id}`);
		closeMobile();
	};
	const handleCategoryClick = (cat) => {
		navigate(`/store/category/${cat.id}`);
		closeMobile();
	};
	const handleSegmentClick = (seg) => {
		navigate(`/store/segment/${seg.id}`);
		closeMobile();
	};

	if (!store) return null;

	const SOCIAL = [
		{
			icon: <BsInstagram className="w-4 h-4" />,
			label: "Instagram",
			href: store?.instagram || "https://instagram.com",
		},
		{
			icon: <BsFacebook className="w-4 h-4" />,
			label: "Facebook",
			href: store?.facebook || "https://facebook.com",
		},
		{
			icon: <BsWhatsapp className="w-4 h-4" />,
			label: "WhatsApp",
			href: store?.whatsapp ? `https://wa.me/${store.whatsapp}` : "#",
		},
	];

	return (
		<>
			{/* ── Barra principal ── */}
			<header
				className={[
					"fixed top-0 left-0 right-0 z-40 transition-all duration-300",
					scrolled
						? "nav-scrolled border-b border-first/8"
						: "border-b border-transparent",
				].join(" ")}
			>
				<div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
					{/* ── Logo ── */}
					<NavLink
						to="/store"
						className="flex items-center gap-2.5 shrink-0 group"
					>
						{store?.logo ? (
							<img
								src={store.logo}
								alt={store.storeName}
								className="h-8 w-auto max-w-30 object-contain"
							/>
						) : (
							<>
								<div className="nav-logo-mark w-8 h-8 rounded-lg flex items-center justify-center bg-second text-main font-bold text-sm tracking-tight transition-transform duration-300 group-hover:scale-105">
									P
								</div>
								<span className="nav-logo-text font-semibold text-base text-first tracking-tight hidden sm:block">
									Parfumscr
								</span>
							</>
						)}
					</NavLink>

					{/* ── Separador ── */}
					<div className="w-px h-5 bg-first/10 hidden lg:block" />

					{/* ── Dropdowns desktop ── */}
					{!isAdmin && (
						<nav className="hidden lg:flex items-center gap-1 flex-1">
							<Dropdown
								label="Marcas"
								items={brands}
								loading={loadingBrands}
								onItemClick={handleBrandClick}
							/>
							<Dropdown
								label="Categorías"
								items={categories}
								loading={loadingCats}
								onItemClick={handleCategoryClick}
							/>
							<Dropdown
								label="Segmentos"
								items={segments}
								loading={loadingSegs}
								onItemClick={handleSegmentClick}
							/>
							<NotesDropdown
								items={notes}
								loading={loadingNotes}
								onProfile={() => navigate("/profile")}
							/>
						</nav>
					)}

					{/* Redes Sociale de la Store */}
					{store && (
						<div className="hidden lg:flex items-center gap-3 mt-1">
							{SOCIAL.map(({ icon, label, href }) => (
								<a
									key={label}
									href={href}
									aria-label={label}
									target="_blank"
									rel="noopener noreferrer"
									className="w-9 h-9 rounded-full border border-first/10 flex items-center justify-center transition-all duration-300 hover:border-second/40 hover:text-second text-first/40 hover:shadow-[0_0_12px_color-mix(in_srgb,var(--color-second)_20%,transparent)]"
								>
									{icon}
								</a>
							))}
						</div>
					)}

					<div className="w-px h-5 bg-first/10 hidden lg:block" />

					<div className="flex items-center gap-1 ml-auto">
						{/* Dashboard — solo admins */}
						{isAdmin && (
							<NavLink
								to="/admin"
								className={({ isActive }) =>
									[
										"flex items-center gap-1.5 px-1 py-2 rounded-lg text-sm font-medium transition-all duration-200",
										isActive
											? "text-second bg-second/10 border border-second/20"
											: "text-first/50 hover:text-first hover:bg-first/8 border border-transparent",
									].join(" ")
								}
							>
								<BsSpeedometer2 className="w-3.5 h-3.5" />
								Panel
							</NavLink>
						)}

						{/* ── Acciones derecha ── */}
						{!isAdmin && (
							<IconLink
								to="/store/cart"
								icon={<BsCart3 className="w-4 h-4" />}
								label="Carrito"
								badge={totalItems}
							/>
						)}

						{isAuthenticated ? (
							<>
								{!isAdmin && (
									<>
										{loadingFavs ? (
											<Spinner />
										) : (
											<IconLink
												to="/store/favorites"
												icon={<BsHeart className="w-4 h-4" />}
												label="Favoritos"
												badge={favsQty}
											/>
										)}
										<IconLink
											to="/store/orders"
											icon={<BsReceipt className="w-4 h-4" />}
											label="Ordenes"
										/>
									</>
								)}
								<ProfileDropdown
									user={user}
									onLogout={logout}
									onProfile={() => navigate("/profile")}
								/>
							</>
						) : (
							<Button
								size="sm"
								variant="primary"
								className="hidden sm:flex"
								onClick={() => navigate("/auth")}
							>
								Iniciar sesión
							</Button>
						)}

						{/* Hamburger mobile */}
						<button
							onClick={() => setMobileOpen((v) => !v)}
							className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-first/50 hover:text-first hover:bg-first/8 transition-all duration-200 cursor-pointer"
							aria-label="Menú"
						>
							{mobileOpen ? (
								<BsX className="w-5 h-5" />
							) : (
								<BsList className="w-5 h-5" />
							)}
						</button>
					</div>
				</div>
			</header>

			{/* ── Spacer para que el contenido no quede debajo del nav fijo ── */}
			<div className="h-16" />

			{/* ── Mobile menu overlay ── */}
			{mobileOpen && (
				<div className="fixed inset-0 z-30 lg:hidden" onClick={closeMobile}>
					<div className="absolute inset-0 bg-main/60 backdrop-blur-sm" />
				</div>
			)}

			{/* ── Mobile menu panel ── */}
			<div
				className={[
					"fixed top-16 left-0 right-0 z-30 lg:hidden bg-main border-b border-first/8",
					"transition-all duration-300 ease-in-out overflow-hidden",
					mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
				].join(" ")}
			>
				{store && (
					<div className="px-2 flex items-center mt-1">
						{SOCIAL.map(({ icon, label, href }) => (
							<a
								key={label}
								href={href}
								aria-label={label}
								target="_blank"
								rel="noopener noreferrer"
								className="w-9 h-9 flex items-center justify-center text-first/40"
							>
								{icon}
							</a>
						))}
					</div>
				)}
				<div className="max-w-7xl mx-auto px-4 py-4 overflow-y-auto max-h-[calc(80vh-4rem)] flex flex-col gap-4">
					{/* Links principales */}
					<div className="h-px bg-first/8" />

					{/* Catálogo */}
					<Dropdown
						label="Marcas"
						items={brands}
						loading={loadingBrands}
						onItemClick={handleBrandClick}
					/>
					<Dropdown
						label="Categorías"
						items={categories}
						loading={loadingCats}
						onItemClick={handleCategoryClick}
					/>
					<Dropdown
						label="Segmentos"
						items={segments}
						loading={loadingSegs}
						onItemClick={handleSegmentClick}
					/>

					{/* Acordes en chips */}
					{notes.length > 0 && (
						<div className="flex flex-col gap-2">
							<p className="text-[10px] font-semibold uppercase tracking-widest text-first/30 px-2">
								Acordes
							</p>
							<div className="flex flex-wrap gap-1.5 px-1">
								{notes.map((note) => (
									<button
										key={note.id}
										onClick={() => {
											navigate(`/store/note/${note.id}`);
											closeMobile();
										}}
										className="px-2.5 py-1 rounded-full text-xs font-medium border border-first/10 text-first/60 hover:text-second hover:border-second/30 hover:bg-second/8 transition-all cursor-pointer"
									>
										{note.name}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Auth mobile */}
					{!isAuthenticated && (
						<>
							<div className="h-px bg-first/8" />
							<Button
								fullWidth
								onClick={() => {
									navigate("/auth");
									closeMobile();
								}}
							>
								Iniciar sesión
							</Button>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default NavBar;
