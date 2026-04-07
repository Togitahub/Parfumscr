const OrnamentalDivider = () => {
	return (
		<div className="flex items-center gap-3 opacity-20">
			<div className="flex-1 h-px bg-first" />
			<svg width="28" height="10" viewBox="0 0 28 10" fill="none">
				<path
					d="M14 1 L18 5 L14 9 L10 5 Z"
					stroke="var(--color-second)"
					strokeWidth="0.8"
					fill="none"
				/>
				<circle
					cx="3"
					cy="5"
					r="1.5"
					fill="var(--color-second)"
					opacity="0.6"
				/>
				<circle
					cx="25"
					cy="5"
					r="1.5"
					fill="var(--color-second)"
					opacity="0.6"
				/>
				<line
					x1="6"
					y1="5"
					x2="9"
					y2="5"
					stroke="var(--color-second)"
					strokeWidth="0.6"
					opacity="0.5"
				/>
				<line
					x1="19"
					y1="5"
					x2="22"
					y2="5"
					stroke="var(--color-second)"
					strokeWidth="0.6"
					opacity="0.5"
				/>
			</svg>
			<div className="flex-1 h-px bg-first" />
		</div>
	);
};

export default OrnamentalDivider;
