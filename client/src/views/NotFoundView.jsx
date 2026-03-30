import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import Button from "../components/common/Button";
import { BsArrowLeft, BsHouseDoor } from "react-icons/bs";

// ── Particle canvas ───────────────────────────────────────────────────────────

const ParticleCanvas = () => {
	const canvasRef = useRef(null);

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

		const particles = Array.from({ length: 28 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: Math.random() * 1.0 + 0.2,
			vx: (Math.random() - 0.5) * 0.15,
			vy: -Math.random() * 0.18 - 0.06,
			opacity: Math.random() * 0.35 + 0.08,
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

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
		/>
	);
};

// ── NotFoundView ──────────────────────────────────────────────────────────────

const NotFoundView = () => {
	const navigate = useNavigate();

	return (
		<div className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
			{/* ── Fondo radial ── */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background: `
						radial-gradient(ellipse 70% 60% at 50% 40%, color-mix(in srgb, var(--color-second) 6%, transparent) 0%, transparent 70%),
						var(--color-main)
					`,
				}}
			/>

			{/* ── Textura grano ── */}
			<div
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
					backgroundSize: "180px 180px",
				}}
			/>

			{/* ── Canvas partículas ── */}
			<ParticleCanvas />

			{/* ── Anillo giratorio ── */}
			<div
				className="absolute pointer-events-none opacity-[0.06]"
				style={{
					width: 480,
					height: 480,
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					animation: "heroRotateSlow 50s linear infinite",
				}}
			>
				<svg viewBox="0 0 480 480" fill="none">
					<circle
						cx="240"
						cy="240"
						r="220"
						stroke="var(--color-second)"
						strokeWidth="1"
						strokeDasharray="4 10"
					/>
					<circle
						cx="240"
						cy="240"
						r="170"
						stroke="var(--color-first)"
						strokeWidth="0.5"
						strokeDasharray="2 14"
					/>
					<circle
						cx="240"
						cy="240"
						r="120"
						stroke="var(--color-second)"
						strokeWidth="0.8"
						strokeDasharray="6 8"
					/>
				</svg>
			</div>

			{/* ── Contenido ── */}
			<div
				className="relative z-10 flex flex-col items-center gap-10 px-6 text-center"
				style={{ animation: "heroFadeUp 0.9s ease both" }}
			>
				{/* Número 404 ornamental */}
				<div className="relative flex flex-col items-center gap-2">
					{/* Eyebrow */}
					<p
						className="text-[10px] font-semibold uppercase tracking-[0.35em]"
						style={{
							color: "var(--color-second)",
							fontFamily: "'Cinzel', serif",
							opacity: 0.8,
							animation: "heroFadeUp 0.9s ease both",
							animationDelay: "100ms",
						}}
					>
						Página no encontrada
					</p>

					{/* 404 */}
					<h1
						className="font-light leading-none select-none"
						style={{
							fontFamily: "'Cormorant Garamond', Georgia, serif",
							fontSize: "clamp(7rem, 22vw, 14rem)",
							letterSpacing: "-0.03em",
							color: "color-mix(in srgb, var(--color-first) 10%, transparent)",
							animation: "heroFadeUp 0.9s ease both",
							animationDelay: "150ms",
						}}
					>
						404
					</h1>

					{/* Línea decorativa */}
					<div
						className="h-px w-32 mx-auto"
						style={{
							background:
								"linear-gradient(to right, transparent, var(--color-second), transparent)",
							opacity: 0.5,
							animation: "heroLineIn 1.2s ease both",
							animationDelay: "300ms",
						}}
					/>
				</div>

				{/* Texto descriptivo */}
				<div
					className="flex flex-col items-center gap-3"
					style={{
						animation: "heroFadeUp 0.9s ease both",
						animationDelay: "250ms",
					}}
				>
					<h2
						className="font-light tracking-wide text-first"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
						}}
					>
						Esta fragancia se ha evaporado
					</h2>
					<p
						className="max-w-sm leading-relaxed font-light"
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "1.05rem",
							fontStyle: "italic",
							color: "color-mix(in srgb, var(--color-first) 42%, transparent)",
						}}
					>
						La página que buscas no existe o fue movida a otra dirección.
					</p>
				</div>

				{/* Acciones */}
				<div
					className="flex flex-wrap items-center justify-center gap-3"
					style={{
						animation: "heroFadeUp 0.9s ease both",
						animationDelay: "380ms",
					}}
				>
					<Button
						variant="ghost"
						size="md"
						rounded
						icon={<BsArrowLeft />}
						onClick={() => navigate(-1)}
					>
						Volver atrás
					</Button>

					<Button
						size="md"
						rounded
						icon={<BsHouseDoor />}
						onClick={() => navigate("/")}
						className="hero-cta-primary"
					>
						<span>Ir al inicio</span>
					</Button>
				</div>

				{/* Ornamento inferior */}
				<div
					className="flex items-center gap-3 opacity-20"
					style={{
						animation: "heroFadeUp 0.9s ease both",
						animationDelay: "480ms",
					}}
				>
					<div className="w-12 h-px bg-first" />
					<svg width="24" height="10" viewBox="0 0 24 10" fill="none">
						<path
							d="M12 1 L16 5 L12 9 L8 5 Z"
							stroke="var(--color-second)"
							strokeWidth="0.8"
							fill="none"
						/>
						<circle cx="2" cy="5" r="1.2" fill="var(--color-second)" />
						<circle cx="22" cy="5" r="1.2" fill="var(--color-second)" />
					</svg>
					<div className="w-12 h-px bg-first" />
				</div>
			</div>
		</div>
	);
};

export default NotFoundView;
