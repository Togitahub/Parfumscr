import { BsInstagram, BsWhatsapp, BsHeart, BsFacebook } from "react-icons/bs";

import { useStore } from "../../hooks/StoreContext";

import OrnamentalDivider from "./OrnamentalDivider";

const Footer = () => {
	const { store } = useStore();

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

	const year = new Date().getFullYear();

	return (
		<footer className="relative overflow-hidden border-t border-first/8">
			{/* ── Grain texture ── */}
			<div
				className="absolute inset-0 opacity-[0.025] pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
					backgroundSize: "180px",
				}}
			/>

			{/* ── Radial glow ── */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background: `radial-gradient(ellipse 70% 50% at 50% 100%, color-mix(in srgb, var(--color-second) 4%, transparent), transparent 70%)`,
				}}
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
				{/* ── Brand block ── */}
				<div className="pt-16 pb-10 flex flex-col items-center gap-5 text-center">
					<div className="flex flex-col gap-0.5">
						<span
							className="text-2xl font-light tracking-[0.18em] text-first"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							{store ? store?.storeName : "Parfumscr"}
						</span>
						<span
							className="text-[9px] tracking-[0.3em] uppercase"
							style={{
								color:
									"color-mix(in srgb, var(--color-second) 70%, transparent)",
								fontFamily: "'Cinzel', serif",
							}}
						>
							{store
								? "Fragancias Originales"
								: "Sube de nivel tu tienda de perfumes"}
						</span>
					</div>

					{/* Tagline */}
					<p
						className="text-sm font-light max-w-xs leading-relaxed"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "1rem",
							color: "color-mix(in srgb, var(--color-first) 45%, transparent)",
							fontStyle: "italic",
						}}
					>
						{store
							? store?.heroDescription
							: "Una plataforma creada para ayudar a las tiendas de perfumes a crecer y llegar a más clientes."}
					</p>

					{/* Social icons */}
					{store && (
						<div className="flex items-center gap-3 mt-1">
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
				</div>

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
							style={{ color: "var(--color-second)", opacity: 0.6 }}
						/>
						en Costa Rica
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
