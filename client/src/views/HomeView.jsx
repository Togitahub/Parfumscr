import {
	BsShop,
	BsPalette,
	BsWhatsapp,
	BsGlobe,
	BsCheck,
	BsStar,
	BsPlus,
	BsBoxSeam,
} from "react-icons/bs";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";

import { GET_STORES } from "../graphql/store/StoreQueries";
import { getOptimizedUrl } from "../utils/ImageUtils";

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
		price: "$25",
		period: "/mes",
		tagline: "Para empezar con fuerza",
		featured: false,
		features: [
			"Soporte estándar",
			"Una tienda activa",
			"Cierre de venta en tu WhatsApp",
			"Enlace único con subdominio propio",
			"Acceso a banco de perfumes y entidades",
			"Gestión de catalogo (Stock, Precio, Descuentos)",
			"Gestión de tienda: colores, WhatsApp, logo, etc.",
			"Creación de nuevos perfumes, decants y entidades",
			"Dashboard de analíticas (ventas, productos top, favoritos, vistas)",
		],
	},
	{
		key: "EDP",
		name: "EDP",
		price: "$45",
		period: "/mes",
		tagline: "POS, Dominio propio y mas tiendas",
		featured: true,
		features: [
			"Incluye Plan EDT",
			"Hasta 10 tiendas",
			"Soporte prioritario",
			"Punto de venta presencial",
			"Registro y gestión de gastos",
			"Reporte de utilidad neta (Inrgesos - Gastos)",
			"Integración de dominio propio (ej. parfumsoft.com)",
		],
	},
	{
		key: "Elixir",
		name: "Elixir",
		price: "$65",
		period: "/mes",
		tagline: "Diseño propio y tiendas ilimitadas",
		featured: false,
		features: [
			"Planes EDT y EDP",
			"Soporte dedicado",
			"Tiendas ilimitadas",
			"Diseño UI completamente personalizado",
			"Solicitud de postcambios en el diseño",
		],
	},
	{
		key: "Absolute",
		name: "Absolute",
		price: "$100",
		period: "/mes",
		tagline: "Una plataforma exclusiva",
		featured: false,
		features: [
			"Incluye todos los planes",
			"Soporte 24/7 prioritario",
			"SLA de respuesta garantizado",
			"Acceso como superadministrador",
			"Servidor y base de datos exclusivos",
			"12 solicitudes de cambios en la app al año",
			"Actualizaciones, mejoras y parches del sistema incluidos",
		],
	},
];

const TABLE_ROWS = [
	{ section: "Tienda" },
	{
		label: "Tiendas activas",
		values: ["1", "Hasta 10", "Ilimitadas", "Ilimitadas"],
	},
	{ label: "Subdominio propio", values: [true, true, true, true] },
	{ label: "Dominio personalizado", values: [false, true, true, true] },
	{ section: "Ventas" },
	{ label: "Cierre por WhatsApp", values: [true, true, true, true] },
	{ label: "Punto de venta (POS)", values: [false, true, true, true] },
	{ section: "Finanzas" },
	{ label: "Dashboard de analíticas", values: [true, true, true, true] },
	{ label: "Registro de gastos", values: [false, true, true, true] },
	{ label: "Reporte utilidad neta", values: [false, true, true, true] },
	{ section: "Personalización" },
	{ label: "Colores y logo", values: [true, true, true, true] },
	{
		label: "UI completamente personalizada",
		values: [false, false, true, true],
	},
	{ section: "Soporte" },
	{
		label: "Nivel de soporte",
		values: ["Estándar", "Prioritario", "Dedicado", "24/7 + SLA"],
	},
	{ label: "Servidor exclusivo", values: [false, false, false, true] },
];

const HOW_IT_WORKS = [
	{
		icon: <BsShop className="w-5 h-5" />,
		title: "Crea tu tienda",
		description:
			"Elige nombre, colores y logo. Tu tienda queda lista al instante con tu propio enlace.",
	},
	{
		icon: <BsBoxSeam className="w-5 h-5" />,
		title: "Agrega tu catálogo",
		description:
			"Selecciona los perfumes que ofreces y define tu precio, stock y descuentos por producto.",
	},
	{
		icon: <BsWhatsapp className="w-5 h-5" />,
		title: "Recibe pedidos",
		description:
			"Tus clientes eligen y confirman. El pedido llega directo a tu WhatsApp, listo para cerrar.",
	},
];

const FAQS = [
	{
		q: "¿Necesito conocimientos técnicos para crear mi tienda?",
		a: "No. El proceso está diseñado para que cualquier persona pueda crear y gestionar su tienda sin saber programar. Solo necesitas un navegador y tus ganas de vender.",
	},
	{
		q: "¿Cobran comisión por cada venta?",
		a: "No cobramos comisión. Pagas únicamente tu plan mensual y el 100% de cada venta es tuyo. Las transacciones se coordinan directamente entre tú y tu cliente por WhatsApp.",
	},
	{
		q: "¿Puedo usar mi propio dominio?",
		a: "Sí, desde el plan EDP en adelante puedes conectar tu dominio propio. Todos los planes incluyen al menos un subdominio gratuito como tutienda.parfumsoft.com.",
	},
	{
		q: "¿Puedo cambiar de plan en cualquier momento?",
		a: "Sí. Puedes subir o bajar de plan cuando quieras. Los cambios aplican a partir del siguiente ciclo. Contáctanos por WhatsApp y lo gestionamos en minutos.",
	},
	{
		q: "¿Los productos del catálogo son compartidos entre tiendas?",
		a: "Sí. Existe un banco de perfumes centralizado. Cada tienda selecciona qué productos ofrecer y puede definir su propio precio, stock y descuento de forma independiente.",
	},
];

const Hero = () => {
	return (
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
					Crea tu catálogo personalizado, comparte el enlace con tus clientes y
					recibe pedidos por WhatsApp. Sin comisiones, sin complicaciones.
				</p>
			</div>
		</section>
	);
};

const StoreCard = ({ store, i }) => {
	return (
		<a
			href={
				store.customDomain
					? `https://${store.customDomain}`
					: `https://${store.slug}.parfumsoft.com`
			}
			target="_blank"
			rel="noopener noreferrer"
			className="w-40 h-30 border-2 p-3 border-second/50 rounded-2xl lg:w-60 overflow-hidden transition-all duration-300 hover:border-second hover:shadow-lg hover:shadow-black/10 cursor-pointer"
			style={{
				background: "var(--color-main)",
				animation: "fadeUp 0.5s ease both",
				animationDelay: `${i * 70}ms`,
			}}
		>
			<img
				src={getOptimizedUrl(store.logo, "card")}
				alt={store.name}
				className="w-full h-full object-contain"
			/>
		</a>
	);
};

const StoreList = () => {
	const { data: storesData } = useQuery(GET_STORES);
	const stores = storesData?.getStores ?? [];

	const homeShow = stores.filter((s) => s.homeShow === true).length;

	return (
		<>
			{homeShow > 0 && stores.length > 0 && (
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
							<p>(Solo se muestran las tiendas que dieron su consentimiento para estar en el market de exploración de tiendas)</p>
						</div>

						<div
							className={`${homeShow === 1 ? "flex justify-center" : "grid grid-cols-2 lg:grid-cols-4 gap-3"}`}
						>
							{stores.map(
								(store, i) =>
									store?.homeShow && (
										<StoreCard key={store.id} store={store} i={i} />
									),
							)}
						</div>
					</div>
					69e2cbf379886e2331f6abc4
				</section>
			)}
		</>
	);
};

const FeaturesList = () => {
	return (
		<section className="flex flex-col text-center items-center gap-10 px-6 py-16 md:px-12">
			<p
				className="text-[10px] font-semibold uppercase tracking-[0.35em]"
				style={{
					color: "var(--color-second)",
					fontFamily: "'Cinzel', serif",
				}}
			>
				FEATURES
			</p>
			<h2
				className="font-light text-first leading-tight"
				style={{
					fontFamily: "'Cormorant Garamond', serif",
					fontSize: "clamp(2rem, 4vw, 3.5rem)",
				}}
			>
				Una parte de lo que ofrecemos
			</h2>
			<p
				className="text-sm font-light max-w-md leading-relaxed"
				style={{
					fontFamily: "'Cormorant Garamond', serif",
					fontSize: "1rem",
					fontStyle: "italic",
					color: "color-mix(in srgb, var(--color-first) 45%, transparent)",
				}}
			>
				Tenemos muchos features más que ayudaran a tu negocio de perfumeria a
				crecer exponencialmente
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
			<div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{FEATURES.map((f, i) => (
					<div
						key={i}
						className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-first/8 bg-main"
						style={{
							animation: "fadeUp 0.5s ease both",
							animationDelay: `${i * 80}ms`,
						}}
					>
						<span style={{ color: "var(--color-second)" }}>{f.icon}</span>
						<p className="font-semibold text-first">{f.title}</p>
						<p className="text-sm text-first/45 leading-relaxed">
							{f.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
};

const PlanCard = ({ plan, index }) => {
	const wsNumber = import.meta.env.VITE_SUPER_ADMIN_WS;

	const message = encodeURIComponent(
		`Hola! Me interesa el Plan ${plan.name} de Parfumsoft (${plan.price}${plan.period}). ¿Me puedes dar más información?`,
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

const BooleanCell = ({ value }) => (
	<span
		className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${value ? "bg-success/10" : "bg-first/8"}`}
	>
		<svg
			width="10"
			height="10"
			viewBox="0 0 10 10"
			fill="none"
			strokeWidth="2"
			strokeLinecap="round"
		>
			{value ? (
				<polyline points="2,5 4,7 8,3" stroke="var(--color-success)" />
			) : (
				<>
					<line
						x1="2"
						y1="2"
						x2="8"
						y2="8"
						stroke="currentColor"
						className="text-first/25"
					/>
					<line
						x1="8"
						y1="2"
						x2="2"
						y2="8"
						stroke="currentColor"
						className="text-first/25"
					/>
				</>
			)}
		</svg>
	</span>
);

const ComparativeTable = () => {
	const FEATURED_IDX = 1;

	return (
		<div className="overflow-x-auto rounded-2xl border border-first/10">
			<table
				className="w-full border-collapse text-sm"
				style={{ minWidth: "520px", tableLayout: "fixed" }}
			>
				<colgroup>
					<col style={{ width: "34%" }} />
					{[16.5, 16.5, 16.5, 16.5].map((w, i) => (
						<col key={i} style={{ width: `${w}%` }} />
					))}
				</colgroup>
				<thead>
					<tr>
						<th className="px-4 py-3 text-left text-xs font-medium text-first/40 bg-first/5 border-b border-first/10" />
						{PLANS.map(({ name, price, featured }) => (
							<th
								key={name}
								className={`px-4 py-3 text-center border-b border-first/10 ${featured ? "bg-second/10" : "bg-first/5"}`}
							>
								<p
									className={`text-sm font-semibold ${featured ? "text-second" : "text-first"}`}
								>
									{name}
								</p>
								<p className="text-xs text-first/40 font-normal">{price}</p>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{TABLE_ROWS.map((row, i) => {
						if (row.section) {
							return (
								<tr key={i}>
									<td
										colSpan={5}
										className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-first/30 bg-first/3 border-b border-first/10"
									>
										{row.section}
									</td>
								</tr>
							);
						}
						return (
							<tr key={i} className="border-b border-first/8 last:border-0">
								<td className="px-4 py-3 text-xs text-first/50">{row.label}</td>
								{row.values.map((val, j) => (
									<td
										key={j}
										className={`px-4 py-3 text-center ${j === FEATURED_IDX ? "bg-second/5" : ""}`}
									>
										{typeof val === "boolean" ? (
											<BooleanCell value={val} />
										) : (
											<span className="text-xs text-first/60">{val}</span>
										)}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

const Pricing = () => {
	return (
		<>
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
						color: "color-mix(in srgb, var(--color-first) 45%, transparent)",
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

			<ComparativeTable />
		</>
	);
};

const HowItWorks = () => {
	return (
		<section className="px-6 py-20 md:px-12">
			<div className="max-w-5xl mx-auto flex flex-col gap-12">
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
						Proceso
					</p>
					<h2
						className="font-light text-first leading-tight"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "clamp(2rem, 4vw, 3.5rem)",
						}}
					>
						Tan simple como tres pasos
					</h2>
					<p
						className="text-sm font-light max-w-md leading-relaxed"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "1rem",
							fontStyle: "italic",
							color: "color-mix(in srgb, var(--color-first) 45%, transparent)",
						}}
					>
						Sin conocimientos técnicos, sin configuraciones complejas. Empieza a
						vender en minutos.
					</p>
				</div>

				<div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
					{/* Línea conectora — solo desktop */}
					<div className="hidden sm:block absolute top-7 left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-first/10" />

					{HOW_IT_WORKS.map((step, i) => (
						<div
							key={i}
							className="flex flex-col items-center text-center gap-5"
							style={{
								animation: "fadeUp 0.5s ease both",
								animationDelay: `${i * 100}ms`,
							}}
						>
							<div
								className={[
									"w-14 h-14 rounded-full flex items-center justify-center border shrink-0 relative z-10",
									i === 0
										? "border-second/40 bg-second/10 text-second"
										: "border-first/15 bg-main text-first/40",
								].join(" ")}
							>
								{step.icon}
							</div>
							<div className="flex flex-col gap-1.5">
								<p className="text-sm font-semibold text-first">{step.title}</p>
								<p className="text-sm text-first/45 leading-relaxed">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

const FaqItem = ({ faq }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="border-b border-first/8 last:border-0">
			<button
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer hover:bg-first/3 transition-colors duration-150"
			>
				<span className="text-sm font-medium text-first">{faq.q}</span>
				<span
					className="shrink-0 w-5 h-5 flex items-center justify-center text-first/30 transition-transform duration-200"
					style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
				>
					<BsPlus className="w-5 h-5" />
				</span>
			</button>
			{open && (
				<p
					className="px-6 pb-5 text-sm text-first/50 leading-relaxed"
					style={{ animation: "fadeUp 0.2s ease both" }}
				>
					{faq.a}
				</p>
			)}
		</div>
	);
};

const FaqSection = () => {
	return (
		<section className="px-6 py-20 md:px-12">
			<div className="max-w-3xl mx-auto flex flex-col gap-10">
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
						Preguntas frecuentes
					</p>
					<h2
						className="font-light text-first leading-tight"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "clamp(2rem, 4vw, 3.5rem)",
						}}
					>
						Todo lo que necesitas saber
					</h2>
				</div>

				<div className="rounded-2xl border border-first/10 overflow-hidden">
					{FAQS.map((faq, i) => (
						<FaqItem key={i} faq={faq} />
					))}
				</div>
			</div>
		</section>
	);
};

const CallToAction = () => {
	return (
		<section className="px-6 py-24 md:px-12">
			<div
				className="max-w-2xl mx-auto flex flex-col items-center gap-6 text-center"
				style={{ animation: "fadeUp 0.5s ease both" }}
			>
				<p
					className="text-[10px] font-semibold uppercase tracking-[0.35em]"
					style={{
						color: "var(--color-second)",
						fontFamily: "'Cinzel', serif",
					}}
				>
					Empieza hoy
				</p>
				<h2
					className="font-light text-first leading-tight"
					style={{
						fontFamily: "'Cormorant Garamond', serif",
						fontSize: "clamp(2rem, 5vw, 4rem)",
					}}
				>
					Tu tienda de perfumes te espera
				</h2>
				<p
					className="text-sm font-light max-w-sm leading-relaxed"
					style={{
						fontFamily: "'Cormorant Garamond', serif",
						fontSize: "1rem",
						fontStyle: "italic",
						color: "color-mix(in srgb, var(--color-first) 45%, transparent)",
					}}
				>
					Únete a las tiendas que ya venden con Parfumsoft. Sin comisiones, sin
					complicaciones.
				</p>
				<div className="flex flex-col items-center gap-3 mt-2">
					<a
						href={`https://wa.me/${import.meta.env.VITE_SUPER_ADMIN_WS}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-200"
						style={{
							background: "var(--color-second)",
							color: "var(--color-main)",
							fontFamily: "'Cinzel', serif",
							letterSpacing: "0.08em",
						}}
					>
						<BsWhatsapp className="w-4 h-4" />
						Contáctanos por WhatsApp
					</a>
					<p className="text-xs text-first/25">
						Te respondemos en menos de 24 horas
					</p>
				</div>
			</div>
		</section>
	);
};

const HomeView = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Hero />
			<StoreList />
			<FeaturesList />

			<section className="px-6 py-20 md:px-12">
				<div className="max-w-6xl mx-auto flex flex-col gap-12">
					<Pricing />
					<HowItWorks />
					<FaqSection />
					<CallToAction />
				</div>
			</section>
		</div>
	);
};

export default HomeView;
