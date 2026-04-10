import Button from "../common/Button";

import { useEffect, useRef } from "react";
import { useStore } from "../../hooks/StoreContext";

const DEFAULTS = {
	tagline: "100%",
	description:
		"Descubre fragancias que trascienden lo ordinario. Cada botella guarda una historia esperando ser tuya.",
	badge1: "✦ Variedad",
	badge2: "✦ Calidad",
};

const Orb = ({ style }) => (
	<div className="absolute rounded-full pointer-events-none" style={style} />
);

const SplitText = ({ text, baseDelay = 0, className = "" }) => (
	<span className={className} aria-label={text}>
		{text.split("").map((char, i) => (
			<span
				key={i}
				className="inline-block"
				style={{
					animation: "heroLetterIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
					animationDelay: `${baseDelay + i * 45}ms`,
				}}
				aria-hidden="true"
			>
				{char === " " ? "\u00A0" : char}
			</span>
		))}
	</span>
);

const Hero = ({ storeProductsQty }) => {
	const canvasRef = useRef(null);
	const { store } = useStore();

	const storeName = store?.storeName ?? "Parfums";
	const tagline = store?.heroTagline || DEFAULTS.tagline;
	const description = store?.heroDescription || DEFAULTS.description;
	const badge1 = store?.heroBadge1 || DEFAULTS.badge1;
	const badge2 = store?.heroBadge2 || DEFAULTS.badge2;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		let animId;

		const resize = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		const particles = Array.from({ length: 38 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: Math.random() * 1.2 + 0.3,
			vx: (Math.random() - 0.5) * 0.18,
			vy: -Math.random() * 0.22 - 0.08,
			opacity: Math.random() * 0.4 + 0.1,
		}));

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			particles.forEach((p) => {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(0, 201, 167, ${p.opacity})`;
				ctx.fill();
				p.x += p.vx;
				p.y += p.vy;
				if (p.y < -4) p.y = canvas.height + 4;
				if (p.x < -4) p.x = canvas.width + 4;
				if (p.x > canvas.width + 4) p.x = -4;
			});
			animId = requestAnimationFrame(draw);
		};
		draw();

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener("resize", resize);
		};
	}, []);

	const scrollToCatalog = () => {
		document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section
			className="relative w-full overflow-hidden"
			style={{ minHeight: "92vh" }}
		>
			{/* Fondo radial */}
			<div
				className="absolute inset-0"
				style={{
					background: `
						radial-gradient(ellipse 80% 60% at 70% 30%, color-mix(in srgb, var(--color-second) 7%, transparent) 0%, transparent 70%),
						radial-gradient(ellipse 60% 80% at 20% 80%, color-mix(in srgb, var(--color-second) 5%, transparent) 0%, transparent 60%),
						var(--color-main)
					`,
				}}
			/>

			{/* Textura grano */}
			<div
				className="absolute inset-0 opacity-[0.035] pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
					backgroundSize: "180px 180px",
				}}
			/>

			{/* Canvas partículas */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
			/>

			{/* Orbes */}
			<Orb
				style={{
					width: 480,
					height: 480,
					top: "-10%",
					right: "-8%",
					background: `radial-gradient(circle, color-mix(in srgb, var(--color-second) 12%, transparent) 0%, transparent 70%)`,
					animation: "heroOrbFloat 9s ease-in-out infinite",
					filter: "blur(1px)",
				}}
			/>
			<Orb
				style={{
					width: 320,
					height: 320,
					bottom: "5%",
					left: "-6%",
					background: `radial-gradient(circle, color-mix(in srgb, var(--color-second) 8%, transparent) 0%, transparent 70%)`,
					animation: "heroOrbFloat2 12s ease-in-out infinite",
					filter: "blur(2px)",
				}}
			/>

			{/* Anillo giratorio */}
			<div
				className="absolute pointer-events-none opacity-[0.07]"
				style={{
					width: 520,
					height: 520,
					top: "50%",
					right: "-12%",
					transform: "translateY(-50%)",
					animation: "heroRotateSlow 40s linear infinite",
				}}
			>
				<svg viewBox="0 0 520 520" fill="none">
					<circle
						cx="260"
						cy="260"
						r="240"
						stroke="var(--color-second)"
						strokeWidth="1"
						strokeDasharray="4 8"
					/>
					<circle
						cx="260"
						cy="260"
						r="190"
						stroke="var(--color-first)"
						strokeWidth="0.5"
						strokeDasharray="2 12"
					/>
					<circle
						cx="260"
						cy="260"
						r="140"
						stroke="var(--color-second)"
						strokeWidth="1"
						strokeDasharray="6 6"
					/>
				</svg>
			</div>

			{/* Contenido */}
			<div
				className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex items-center"
				style={{ minHeight: "92vh" }}
			>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full py-20">
					{/* Texto */}
					<div className="lg:col-span-7 flex flex-col gap-8">
						<div className="flex flex-col gap-1">
							<h1
								className="hero-display font-light leading-none"
								style={{
									fontSize: "clamp(3.5rem, 8vw, 7.5rem)",
									letterSpacing: "-0.02em",
								}}
							>
								<SplitText text={storeName} baseDelay={200} />
							</h1>

							<div
								style={{
									animation: "heroFadeUp 1s ease both",
									animationDelay: "600ms",
								}}
							>
								<span
									className="hero-italic font-light block"
									style={{
										fontSize: "clamp(2rem, 5vw, 5rem)",
										color: "var(--color-second)",
										lineHeight: 1.1,
										letterSpacing: "0.01em",
									}}
								>
									{tagline}
								</span>
							</div>
						</div>

						<div
							className="hero-decor-line"
							style={{ animationDelay: "900ms" }}
						/>

						<p
							className="hero-body max-w-xl leading-relaxed"
							style={{
								color:
									"color-mix(in srgb, var(--color-first) 55%, transparent)",
								animation: "heroFadeUp 1s ease both",
								animationDelay: "1000ms",
							}}
						>
							{description}
						</p>

						<div
							className="flex flex-wrap items-center gap-4"
							style={{
								animation: "heroFadeUp 1s ease both",
								animationDelay: "1150ms",
							}}
						>
							<Button
								variant="primary"
								size="lg"
								rounded
								onClick={scrollToCatalog}
								className="hero-cta-primary"
							>
								Explorar catálogo
							</Button>
						</div>

						<div
							className="flex items-center gap-8 pt-2"
							style={{
								animation: "heroFadeUp 1s ease both",
								animationDelay: "1300ms",
							}}
						>
							{[
								{
									value: storeProductsQty,
									label: storeProductsQty === 1 ? "Perfume" : "Perfumes",
								},
								{ value: "Decants", label: "Disponibles" },
							].map((stat, i) => (
								<div key={i} className="flex flex-col gap-0.5">
									<span className="hero-stat-value">{stat.value}</span>
									<span className="hero-stat-label">{stat.label}</span>
								</div>
							))}
						</div>
					</div>

					{/* Botella decorativa */}
					<div
						className="lg:col-span-5 relative flex items-center justify-center"
						style={{
							animation: "heroFadeUp 1.2s ease both",
							animationDelay: "400ms",
							minHeight: 420,
						}}
					>
						<div
							className="absolute rounded-full"
							style={{
								width: 300,
								height: 300,
								background: `radial-gradient(circle, color-mix(in srgb, var(--color-second) 18%, transparent) 0%, transparent 70%)`,
								filter: "blur(30px)",
								animation: "heroOrbFloat 7s ease-in-out infinite",
							}}
						/>

						<svg
							viewBox="0 0 220 380"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="relative z-10"
							style={{
								width: "clamp(140px, 18vw, 210px)",
								filter:
									"drop-shadow(0 0 40px color-mix(in srgb, var(--color-second) 25%, transparent))",
							}}
						>
							<rect
								x="75"
								y="8"
								width="70"
								height="38"
								rx="6"
								fill="none"
								stroke="var(--color-second)"
								strokeWidth="1"
								opacity="0.7"
							/>
							<rect
								x="83"
								y="14"
								width="54"
								height="26"
								rx="4"
								fill="color-mix(in srgb, var(--color-second) 10%, transparent)"
								stroke="var(--color-second)"
								strokeWidth="0.5"
								opacity="0.5"
							/>
							<path
								d="M88 46 L82 72 L138 72 L132 46 Z"
								fill="none"
								stroke="var(--color-first)"
								strokeWidth="0.8"
								opacity="0.3"
							/>
							<path
								d="M82 72 Q55 90 48 120 L172 120 Q165 90 138 72 Z"
								fill="color-mix(in srgb, var(--color-second) 6%, transparent)"
								stroke="var(--color-second)"
								strokeWidth="0.8"
								opacity="0.5"
							/>
							<rect
								x="48"
								y="120"
								width="124"
								height="220"
								rx="4"
								fill="color-mix(in srgb, var(--color-second) 5%, transparent)"
								stroke="var(--color-second)"
								strokeWidth="1"
								opacity="0.45"
							/>
							<rect
								x="56"
								y="128"
								width="108"
								height="204"
								rx="2"
								fill="none"
								stroke="var(--color-first)"
								strokeWidth="0.4"
								opacity="0.15"
							/>
							<rect
								x="64"
								y="160"
								width="92"
								height="120"
								rx="2"
								fill="none"
								stroke="var(--color-second)"
								strokeWidth="0.6"
								strokeDasharray="3 4"
								opacity="0.35"
							/>
							<line
								x1="82"
								y1="188"
								x2="138"
								y2="188"
								stroke="var(--color-first)"
								strokeWidth="0.5"
								opacity="0.2"
							/>
							<line
								x1="90"
								y1="200"
								x2="130"
								y2="200"
								stroke="var(--color-second)"
								strokeWidth="0.8"
								opacity="0.35"
							/>
							<line
								x1="86"
								y1="212"
								x2="134"
								y2="212"
								stroke="var(--color-first)"
								strokeWidth="0.5"
								opacity="0.15"
							/>
							<line
								x1="94"
								y1="222"
								x2="126"
								y2="222"
								stroke="var(--color-first)"
								strokeWidth="0.5"
								opacity="0.15"
							/>
							<text
								x="110"
								y="254"
								textAnchor="middle"
								fill="var(--color-second)"
								fontSize="22"
								fontFamily="'Cinzel', serif"
								opacity="0.5"
								fontWeight="400"
							>
								{storeName.charAt(0).toUpperCase()}
							</text>
							<path
								d="M48 340 L48 344 Q48 350 54 350 L166 350 Q172 350 172 344 L172 340 Z"
								fill="color-mix(in srgb, var(--color-second) 10%, transparent)"
								stroke="var(--color-second)"
								strokeWidth="0.8"
								opacity="0.4"
							/>
							<line
								x1="66"
								y1="130"
								x2="66"
								y2="338"
								stroke="var(--color-first)"
								strokeWidth="1.5"
								opacity="0.08"
							/>
							<line
								x1="74"
								y1="132"
								x2="74"
								y2="336"
								stroke="var(--color-first)"
								strokeWidth="0.5"
								opacity="0.05"
							/>
						</svg>

						<div
							className="absolute top-12 right-4 lg:-right-4"
							style={{
								animation: "heroOrbFloat2 8s ease-in-out infinite",
								animationDelay: "1s",
							}}
						>
							<span className="hero-badge hero-badge--accent">{badge1}</span>
						</div>
						<div
							className="absolute bottom-16 left-4 lg:-left-2"
							style={{
								animation: "heroOrbFloat 10s ease-in-out infinite",
								animationDelay: "2s",
							}}
						>
							<span className="hero-badge hero-badge--neutral">{badge2}</span>
						</div>

						<div
							className="absolute pointer-events-none opacity-15"
							style={{
								width: 340,
								height: 340,
								animation: "heroRotateSlow 25s linear infinite reverse",
							}}
						>
							<svg viewBox="0 0 340 340" fill="none">
								<circle
									cx="170"
									cy="170"
									r="160"
									stroke="var(--color-second)"
									strokeWidth="0.5"
									strokeDasharray="2 16"
								/>
								{[0, 72, 144, 216, 288].map((deg, i) => {
									const rad = (deg * Math.PI) / 180;
									return (
										<circle
											key={i}
											cx={170 + 160 * Math.cos(rad)}
											cy={170 + 160 * Math.sin(rad)}
											r="3"
											fill="var(--color-second)"
										/>
									);
								})}
							</svg>
						</div>
					</div>
				</div>
			</div>

			<div className="hero-scroll-indicator" onClick={scrollToCatalog}>
				<span className="hero-scroll-label">Descubrir</span>
				<div className="hero-scroll-line" />
			</div>

			<div
				className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
				style={{
					background:
						"linear-gradient(to bottom, transparent, var(--color-main))",
				}}
			/>
		</section>
	);
};

export default Hero;
