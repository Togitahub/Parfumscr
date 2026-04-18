import {
	BsPerson,
	BsEnvelope,
	BsTelephone,
	BsGeoAlt,
	BsShieldCheck,
	BsShieldFill,
	BsPencil,
	BsTrash,
	BsSlashCircle,
	BsCheckCircle,
} from "react-icons/bs";
import Badge from "../common/Badge";
import Button from "../common/Button";

/**
 * UserCard Component
 *
 * Props:
 * - user: {
 *     id, name, email, role, phone, address
 *   }
 * - onEdit: (user) => void — si se pasa, muestra botón de editar
 * - onDelete: (user) => void — si se pasa, muestra botón de eliminar
 * - variant: "default" | "compact"
 * - className: string
 */

// ── Role config ───────────────────────────────────────────────────────────────

const ROLE_MAP = {
	SUPER_ADMIN: {
		label: "Super Admin",
		badge: "error",
		icon: <BsShieldFill className="w-3 h-3" />,
	},
	ADMIN: {
		label: "Admin",
		badge: "warning",
		icon: <BsShieldCheck className="w-3 h-3" />,
	},
	COSTUMER: {
		label: "Cliente",
		badge: "neutral",
		icon: <BsPerson className="w-3 h-3" />,
	},
};

// ── Avatar initials ───────────────────────────────────────────────────────────

const getInitials = (name = "") => {
	const parts = name.trim().split(" ");
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── Deterministic avatar color from name ─────────────────────────────────────

const AVATAR_COLORS = [
	"bg-cyan-500/20 text-cyan-400",
	"bg-violet-500/20 text-violet-400",
	"bg-amber-500/20 text-amber-400",
	"bg-emerald-500/20 text-emerald-400",
	"bg-rose-500/20 text-rose-400",
	"bg-sky-500/20 text-sky-400",
];

const getAvatarColor = (name = "") => {
	const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

// ── Component ─────────────────────────────────────────────────────────────────

const UserCard = ({
	user,
	onEdit,
	onDelete,
	onToggleActive,
	onTogglePos,
	onToggleHomeShow,
	store,
	variant = "default",
	className = "",
}) => {
	if (!user) return null;

	const { name, email, role, phone, address } = user;

	const roleInfo = ROLE_MAP[role] ?? {
		label: role ?? "—",
		badge: "neutral",
		icon: <BsPerson className="w-3 h-3" />,
	};

	const isCompact = variant === "compact";
	const initials = getInitials(name);
	const avatarColor = getAvatarColor(name);
	const hasActions = onEdit || onDelete;

	return (
		<article
			className={[
				"relative flex flex-col gap-4 rounded-2xl border border-first/10 bg-main",
				"transition-all duration-200 hover:border-first/25 hover:shadow-lg hover:shadow-black/10",
				isCompact ? "p-4 gap-3" : "p-5",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{/* ── Header: avatar + name + role ── */}
			<div className="flex items-center gap-3">
				{/* Avatar */}
				<div
					className={[
						"rounded-full flex items-center justify-center font-bold shrink-0 select-none border border-first/10",
						avatarColor,
						isCompact ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm",
					].join(" ")}
				>
					{initials}
				</div>

				{/* Name + role */}
				<div className="flex-1 min-w-0">
					<p
						className={[
							"font-semibold text-first leading-tight truncate",
							isCompact ? "text-sm" : "text-base",
						].join(" ")}
					>
						{name}
					</p>
					<div className="flex items-center gap-1.5 mt-1">
						<Badge variant={roleInfo.badge} size="sm">
							<span className="flex items-center gap-1">
								{roleInfo.icon}
								{roleInfo.label}
							</span>
						</Badge>
					</div>
				</div>

				{/* Actions */}
				{hasActions && (
					<div className="absolute right-2 top-2 p-4 h-full flex flex-col justify-between">
						<div className="flex items-center gap-1 shrink-0">
							{onEdit && (
								<Button
									iconOnly
									variant="ghost"
									size="sm"
									icon={<BsPencil />}
									onClick={(e) => {
										e.stopPropagation();
										onEdit(user);
									}}
									aria-label="Editar usuario"
								/>
							)}
							{onDelete && (
								<Button
									iconOnly
									variant="ghost"
									size="sm"
									icon={<BsTrash />}
									onClick={(e) => {
										e.stopPropagation();
										onDelete(user);
									}}
									aria-label="Eliminar usuario"
									className="hover:text-error!"
								/>
							)}
							{onToggleActive && (
								<Button
									iconOnly
									variant="ghost"
									size="sm"
									icon={user.active ? <BsSlashCircle /> : <BsCheckCircle />}
									onClick={(e) => {
										e.stopPropagation();
										onToggleActive(user);
									}}
									aria-label={
										user.active ? "Suspender cuenta" : "Reactivar cuenta"
									}
									className={
										user.active ? "hover:text-error!" : "hover:text-success!"
									}
								/>
							)}
						</div>
						<div className="flex gap-2">
							{onTogglePos && store && user.role === "ADMIN" && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onTogglePos(user);
									}}
									title={store.posEnabled ? "Desactivar POS" : "Activar POS"}
									className={[
										"w-full h-8 rounded-lg flex items-center justify-center transition-all duration-150 border text-xs font-bold cursor-pointer",
										store.posEnabled
											? "border-second/40 bg-second/10 text-second"
											: "border-first/15 text-first/30 hover:border-second/30 hover:text-second",
									].join(" ")}
								>
									POS
								</button>
							)}
							{onToggleHomeShow && store && user.role === "ADMIN" && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onToggleHomeShow(user);
									}}
									title={store.homeShow ? "Desactivar Home" : "Activar Home"}
									className={[
										"w-full h-8 rounded-lg flex items-center justify-center transition-all duration-150 border text-xs font-bold cursor-pointer",
										store.homeShow
											? "border-second/40 bg-second/10 text-second"
											: "border-first/15 text-first/30 hover:border-second/30 hover:text-second",
									].join(" ")}
								>
									HOME
								</button>
							)}
						</div>
					</div>
				)}
			</div>

			{/* ── Contact details ── */}
			{!isCompact && (
				<div className="flex flex-col gap-2">
					{/* Email */}
					<div className="flex items-center gap-2 text-sm text-first/50 min-w-0">
						<BsEnvelope className="w-3.5 h-3.5 shrink-0 text-first/30" />
						<span className="truncate">{email}</span>
					</div>

					{/* Phone */}
					{phone ? (
						<div className="flex items-center gap-2 text-sm text-first/50">
							<BsTelephone className="w-3.5 h-3.5 shrink-0 text-first/30" />
							<span>{phone}</span>
						</div>
					) : (
						<div className="flex items-center gap-2 text-sm text-first/25">
							<BsTelephone className="w-3.5 h-3.5 shrink-0" />
							<span className="italic">Sin teléfono</span>
						</div>
					)}

					{/* Address */}
					{address ? (
						<div className="flex items-start gap-2 text-sm text-first/50">
							<BsGeoAlt className="w-3.5 h-3.5 shrink-0 text-first/30 mt-0.5" />
							<span className="line-clamp-2">{address}</span>
						</div>
					) : (
						<div className="flex items-center gap-2 text-sm text-first/25">
							<BsGeoAlt className="w-3.5 h-3.5 shrink-0" />
							<span className="italic">Sin dirección</span>
						</div>
					)}
				</div>
			)}

			{!user.active && (
				<Badge variant="error" size="sm">
					Suspendida
				</Badge>
			)}

			{/* ── Compact: solo email ── */}
			{isCompact && (
				<div className="flex items-center gap-2 text-xs text-first/40 min-w-0">
					<BsEnvelope className="w-3 h-3 shrink-0 text-first/25" />
					<span className="truncate">{email}</span>
				</div>
			)}
		</article>
	);
};

export default UserCard;
