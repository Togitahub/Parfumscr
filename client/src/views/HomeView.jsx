import {
	BsShop,
	BsPalette,
	BsWhatsapp,
	BsGlobe,
	BsCheck,
	BsStar,
	BsHeart,
} from "react-icons/bs";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { GET_STORE_PRODUCTS, GET_STORES } from "../graphql/store/StoreQueries";
import { OrnamentalDivider } from "../components/design/Footer";

const FEATURES = [
	{
		icon: <BsShop className="w-6 h-6" />,
		title: "Tu tienda, tu catálogo",
		description:
			"Selecciona los productos que ofreces y muéstralos a tus clientes con tu marca.",
	},
	{
		icon: <BsPalette className="w-6 h-6" />,
		title: "Personalización",
		description:
			"Colores, logo y nombre propios. Tu tienda se verá exactamente como quieres.",
	},
	{
		icon: <BsWhatsapp className="w-6 h-6" />,
		title: "Ventas por WhatsApp",
		description:
			"Los pedidos llegan directo a tu WhatsApp. Sin pasarelas de pago, sin complicaciones.",
	},
	{
		icon: <BsGlobe className="w-6 h-6" />,
		title: "Dominio personalizado",
		description:
			"Usa tu propio dominio o un subdominio nuestro. Tú decides cómo te encuentran.",
	},
];

const PLANS = [
	{
		key: "EDT",
		name: "EDT",
		price: "$40",
		period: "/mes",
		tagline: "Para empezar con fuerza",
		featured: false,
		features: [
			"Soporte 24/7",
			"Acceso a banco de perfumes y entidades",
			"Creación de nuevos perfumes y entidades",
			"Enlace único con subdominio para tu tienda",
			"Gestión total: colores, WhatsApp, logo, etc.",
			"Cierre de venta en tu WhatsApp",
		],
	},
	{
		key: "EDP",
		name: "EDP",
		price: "$60",
		period: "/mes",
		tagline: "Con dominio propio",
		featured: false,
		features: [
			"Soporte 24/7",
			"Acceso a banco de perfumes y entidades",
			"Creación de nuevos perfumes y entidades",
			"Integración de dominio propio (ej. parfums.com)",
			"Gestión total: colores, WhatsApp, logo, etc.",
			"Cierre de venta en tu WhatsApp",
		],
	},
	{
		key: "Elixir",
		name: "Elixir",
		price: "$80",
		period: "/mes",
		tagline: "Diseño completamente tuyo",
		featured: true,
		features: [
			"Soporte 24/7",
			"Acceso a banco de perfumes y entidades",
			"Creación de nuevos perfumes y entidades",
			"Integración de dominio propio (ej. parfums.com)",
			"Diseño 100% personalizado en toda la UI",
			"Solicitud de postcambios en el diseño",
			"Cierre de venta en tu WhatsApp",
		],
	},
	{
		key: "Absolute",
		name: "Absolute",
		price: "$100",
		period: "/mes",
		tagline: "Una app solo para ti",
		featured: false,
		features: [
			"Soporte 24/7",
			"Servidor y base de datos exclusivos",
			"Solicitud de cualquier cambio en la app",
			"Integración de dominio propio (ej. parfums.com)",
			"Acceso como superadministrador",
			"Actualizaciones, mejoras y parches del sistema",
			"App nueva creada solamente para tu tienda",
		],
	},
];

const PlanCard = ({ plan, index }) => {
	const wsNumber = import.meta.env.VITE_SUPER_ADMIN_WS;
	const message = encodeURIComponent(
		`Hola! Me interesa el Plan ${plan.name} de Parfums (${plan.price}${plan.period}). ¿Me puedes dar más información?`,
	);
	const wsUrl = `https://wa.me/${wsNumber}?text=${message}`;

	return (
		<div
			className={[
				"relative flex flex-col rounded-2xl border transition-all duration-300",
				plan.featured
					? "border-second/50 shadow-[0_0_40px_color-mix(in_srgb,var(--color-second)_12%,transparent)]"
					: "border-first/10 hover:border-first/25",
			].join(" ")}
			style={{
				background: plan.featured
					? "color-mix(in srgb, var(--color-second) 4%, var(--color-main))"
					: "var(--color-main)",
				animation: "fadeUp 0.5s ease both",
				animationDelay: `${index * 80}ms`,
			}}
		>
			{/* Featured badge */}
			{plan.featured && (
				<div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
					<span
						className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
						style={{
							background: "var(--color-second)",
							color: "var(--color-main)",
							fontFamily: "'Cinzel', serif",
						}}
					>
						<BsStar className="w-2.5 h-2.5" />
						Más popular
					</span>
				</div>
			)}

			<div className="flex flex-col gap-5 p-6 flex-1">
				{/* Header */}
				<div className="flex flex-col gap-1.5">
					<p
						className="text-[10px] font-semibold uppercase tracking-[0.3em]"
						style={{
							color: plan.featured
								? "var(--color-second)"
								: "color-mix(in srgb, var(--color-first) 40%, transparent)",
							fontFamily: "'Cinzel', serif",
						}}
					>
						Plan
					</p>
					<h3
						className="text-2xl font-light text-first tracking-wide"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						{plan.name}
					</h3>
					<p
						className="text-xs text-first/40 italic"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						{plan.tagline}
					</p>
				</div>

				{/* Price */}
				<div className="flex items-baseline gap-1">
					<span
						className="text-4xl font-bold text-first tabular-nums"
						style={{ fontFamily: "'Cinzel', serif" }}
					>
						{plan.price}
					</span>
					<span className="text-sm text-first/40">{plan.period}</span>
				</div>

				{/* Divider */}
				<div
					className="h-px"
					style={{
						background: plan.featured
							? "linear-gradient(to right, var(--color-second), transparent)"
							: "color-mix(in srgb, var(--color-first) 8%, transparent)",
						opacity: plan.featured ? 0.5 : 1,
					}}
				/>

				{/* Features */}
				<ul className="flex flex-col gap-2.5 flex-1">
					{plan.features.map((feat, i) => (
						<li key={i} className="flex items-start gap-2.5">
							<span
								className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
								style={{
									background: plan.featured
										? "color-mix(in srgb, var(--color-second) 15%, transparent)"
										: "color-mix(in srgb, var(--color-first) 8%, transparent)",
								}}
							>
								<BsCheck
									className="w-2.5 h-2.5"
									style={{
										color: plan.featured
											? "var(--color-second)"
											: "color-mix(in srgb, var(--color-first) 60%, transparent)",
									}}
								/>
							</span>
							<span className="text-sm text-first/60 leading-snug">{feat}</span>
						</li>
					))}
				</ul>

				{/* CTA */}
				<a
					href={wsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={[
						"flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all duration-200",
						plan.featured
							? "text-main"
							: "border border-first/20 text-first/70 hover:border-second/40 hover:text-second hover:bg-second/5",
					].join(" ")}
					style={
						plan.featured
							? {
									background: "var(--color-second)",
									fontFamily: "'Cinzel', serif",
									letterSpacing: "0.05em",
								}
							: { fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }
					}
				>
					<BsWhatsapp className="w-3.5 h-3.5" />
					Lo quiero
				</a>
			</div>
		</div>
	);
};

const StoreCard = ({ store, i }) => {
	const navigate = useNavigate();

	const { data: storeProductsData } = useQuery(GET_STORE_PRODUCTS, {
		variables: { storeId: store.id },
	});
	const storeProducts = storeProductsData?.getStoreProducts ?? [];
	const storeProductsLength = storeProducts.length ?? 0;

	return (
		<button
			onClick={() =>
				navigate(
					(window.location.href = store.customDomain
						? `https://${store.customDomain}`
						: `https://${store.slug}.parfumscr.com`),
				)
			}
			className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-second/50 text-left transition-all duration-300 hover:border-second hover:shadow-lg hover:shadow-black/10 cursor-pointer"
			style={{
				background: "var(--color-main)",
				animation: "fadeUp 0.5s ease both",
				animationDelay: `${i * 70}ms`,
			}}
		>
			{/* Info */}
			<div className="flex flex-col gap-1 flex-1 min-w-0">
				<p className="text-base font-semibold text-first truncate group-hover:text-second transition-colors duration-200">
					{store.storeName}
				</p>
				<p className="text-xs text-first/35 truncate">
					{store.slug}.parfumscr.com
				</p>
				<p className="text-xs text-first/35 truncate">
					{storeProductsLength}{" "}
					{storeProductsLength > 1 ? "Productos" : "Producto"}
				</p>
			</div>

			<span className="text-first/20 group-hover:text-second transition-colors duration-200 shrink-0">
				→
			</span>
		</button>
	);
};

const HomeView = () => {
	const { data: storesData } = useQuery(GET_STORES);
	const stores = storesData?.getStores ?? [];

	const year = new Date().getFullYear();

	return (
		<div className="min-h-screen flex flex-col">
			{/* Hero */}
			<section
				className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-24 text-center"
				style={{ animation: "fadeUp 0.6s ease both" }}
			>
				<div className="flex flex-col items-center gap-4 max-w-2xl">
					<span
						className="text-xs font-semibold uppercase tracking-[0.3em]"
						style={{
							color: "var(--color-second)",
							fontFamily: "'Cinzel', serif",
						}}
					>
						Plataforma de perfumería
					</span>
					<h1
						className="font-light leading-tight text-first"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "clamp(2.5rem, 6vw, 5rem)",
						}}
					>
						Vende tus perfumes con tu propia tienda online
					</h1>
					<p
						className="text-lg font-light leading-relaxed max-w-lg"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							color: "color-mix(in srgb, var(--color-first) 50%, transparent)",
						}}
					>
						Crea tu catálogo personalizado, comparte el enlace con tus clientes
						y recibe pedidos por WhatsApp. Sin comisiones, sin complicaciones.
					</p>
				</div>
			</section>

			{/* Tiendas */}
			{stores.length > 0 && (
				<section className="px-6 py-16 md:px-12">
					<div className="max-w-6xl mx-auto flex flex-col gap-10">
						<div
							className="flex flex-col items-center gap-3 text-center"
							style={{ animation: "fadeUp 0.5s ease both" }}
						>
							<p
								className="text-[10px] font-semibold uppercase tracking-[0.35em]"
								style={{
									color: "var(--color-second)",
									fontFamily: "'Cinzel', serif",
								}}
							>
								Tiendas disponibles
							</p>
							<h2
								className="font-light text-first leading-tight"
								style={{
									fontFamily: "'Cormorant Garamond', serif",
									fontSize: "clamp(2rem, 4vw, 3.5rem)",
								}}
							>
								Explora las tiendas asociadas
							</h2>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{stores.map((store, i) => (
								<StoreCard key={store.id} store={store} i={i} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* Features */}
			<section className="px-6 py-16 md:px-12">
				<div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{FEATURES.map((f, i) => (
						<div
							key={i}
							className="flex flex-col gap-3 p-6 rounded-2xl border border-first/8 bg-main"
							style={{
								animation: "fadeUp 0.5s ease both",
								animationDelay: `${i * 80}ms`,
							}}
						>
							<span style={{ color: "var(--color-second)" }}>{f.icon}</span>
							<p className="text-base font-semibold text-first">{f.title}</p>
							<p className="text-sm text-first/45 leading-relaxed">
								{f.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Pricing */}
			<section className="px-6 py-20 md:px-12">
				<div className="max-w-6xl mx-auto flex flex-col gap-12">
					{/* Section header */}
					<div
						className="flex flex-col items-center gap-3 text-center"
						style={{ animation: "fadeUp 0.5s ease both" }}
					>
						<p
							className="text-[10px] font-semibold uppercase tracking-[0.35em]"
							style={{
								color: "var(--color-second)",
								fontFamily: "'Cinzel', serif",
							}}
						>
							Planes y precios
						</p>
						<h2
							className="font-light text-first leading-tight"
							style={{
								fontFamily: "'Cormorant Garamond', serif",
								fontSize: "clamp(2rem, 4vw, 3.5rem)",
							}}
						>
							Elige el plan que se adapta a ti
						</h2>
						<p
							className="text-sm font-light max-w-md leading-relaxed"
							style={{
								fontFamily: "'Cormorant Garamond', serif",
								fontSize: "1rem",
								fontStyle: "italic",
								color:
									"color-mix(in srgb, var(--color-first) 45%, transparent)",
							}}
						>
							Todos los planes incluyen acceso completo al catálogo y cierre de
							ventas por WhatsApp.
						</p>

						{/* Decorative line */}
						<div
							className="mt-2 h-px w-20"
							style={{
								background:
									"linear-gradient(to right, transparent, var(--color-second), transparent)",
								opacity: 0.5,
							}}
						/>
					</div>

					{/* Plans grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
						{PLANS.map((plan, i) => (
							<PlanCard key={plan.key} plan={plan} index={i} />
						))}
					</div>

					{/* Footer note */}
					<p
						className="text-center text-xs text-first/25 tracking-wide"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontStyle: "italic",
						}}
					>
						¿Tienes dudas? Escríbenos y te asesoramos sin compromiso.
					</p>

					{/* ── Ornamental divider ── */}
					<OrnamentalDivider />

					{/* ── Bottom bar ── */}
					<div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
						<p
							className="text-xs text-first/25 tracking-widest"
							style={{ fontFamily: "'Cinzel', serif" }}
						>
							© {year} Parfumscr — Todos los derechos reservados
						</p>

						<p
							className="text-[11px] text-first/20 flex items-center gap-1.5 tracking-wide"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							Hecho con{" "}
							<BsHeart
								className="w-3 h-3"
								style={{ color: "var(--color-second)" }}
							/>
							en Costa Rica
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomeView;
