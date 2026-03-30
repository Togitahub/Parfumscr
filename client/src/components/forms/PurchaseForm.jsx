import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import {
	BsWhatsapp,
	BsCheckCircle,
	BsPerson,
	BsTelephone,
	BsGeoAlt,
	BsBoxSeam,
	BsX,
} from "react-icons/bs";

import Input from "../common/Input";
import Button from "../common/Button";
import { Modal } from "../interface/Modal";
import { useToast } from "../../hooks/ToastContext";
import { CREATE_ORDER } from "../../graphql/order/OrderMutations";
import { CLEAR_CART } from "../../graphql/cart/CartMutations";
import { GET_USER_CART } from "../../graphql/cart/CartQueries";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
	`₡${price?.toLocaleString("es-CR", { minimumFractionDigits: 0 }) ?? "0"}`;

const buildWhatsAppMessage = ({ items, totalPrice, name, phone, address }) => {
	const lines = [
		`🛍️ *Nueva solicitud de compra*`,
		``,
		`👤 *Cliente:* ${name}`,
		phone ? `📞 *Teléfono:* ${phone}` : null,
		address ? `📍 *Dirección:* ${address}` : null,
		``,
		`*Productos:*`,
		...items.map(
			(item) =>
				`• ${item.product.name}${item.product.size ? ` (${item.product.size})` : ""} × ${item.quantity} — ${formatPrice(item.product.price * item.quantity)}`,
		),
		``,
		`💰 *Total: ${formatPrice(totalPrice)}*`,
	].filter((l) => l !== null);

	return encodeURIComponent(lines.join("\n"));
};

// ── Order item row ────────────────────────────────────────────────────────────

const OrderItemRow = ({ item, index }) => {
	const { product, quantity } = item;
	const subtotal = product.price * quantity;

	return (
		<div
			className="flex items-center gap-3 py-3 border-b border-first/6 last:border-0"
			style={{
				animation: "fadeUp 0.35s ease both",
				animationDelay: `${index * 50}ms`,
			}}
		>
			{/* Thumbnail */}
			<div className="w-12 h-12 rounded-lg overflow-hidden bg-first/5 shrink-0">
				{product.images?.[0] ? (
					<img
						src={product.images[0]}
						alt={product.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<BsBoxSeam className="w-4 h-4 text-first/20" />
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-first truncate">
					{product.name}
				</p>
				<div className="flex items-center gap-1.5 mt-0.5">
					{product.brand?.name && (
						<span className="text-[11px] text-second/70 font-medium tracking-wider uppercase">
							{product.brand.name}
						</span>
					)}
					{product.size && (
						<>
							<span className="text-first/20 text-[10px]">·</span>
							<span className="text-[11px] text-first/35">{product.size}</span>
						</>
					)}
				</div>
			</div>

			{/* Qty + price */}
			<div className="flex flex-col items-end gap-0.5 shrink-0">
				<span className="text-sm font-semibold text-first tabular-nums">
					{formatPrice(subtotal)}
				</span>
				<span className="text-[11px] text-first/35 tabular-nums">
					{quantity} × {formatPrice(product.price)}
				</span>
			</div>
		</div>
	);
};

// ── Section label ─────────────────────────────────────────────────────────────

const SectionLabel = ({ icon, children }) => (
	<div className="flex items-center gap-2 mb-3">
		<span className="text-second/60 text-sm">{icon}</span>
		<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-first/35">
			{children}
		</p>
		<div className="flex-1 h-px bg-first/6" />
	</div>
);

// ── PurchaseForm ──────────────────────────────────────────────────────────────

/**
 * PurchaseForm
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - cartItems: [{ product: { id, name, brand, price, images, size, isDecant }, quantity }]
 * - totalPrice: number
 * - user: { id, name, phone, address }
 */
const PurchaseForm = ({
	isOpen,
	onClose,
	cartItems = [],
	totalPrice = 0,
	user,
}) => {
	const toast = useToast();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: user?.name ?? "",
		phone: user?.phone ?? "",
		address: user?.address ?? "",
	});
	const [errors, setErrors] = useState({});
	const [done, setDone] = useState(false);

	const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER, {
		refetchQueries: [{ query: GET_USER_CART, variables: { userId: user?.id } }],
	});

	const [clearCart, { loading: clearingCart }] = useMutation(CLEAR_CART, {
		refetchQueries: [{ query: GET_USER_CART, variables: { userId: user?.id } }],
	});

	const loading = creatingOrder || clearingCart;

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validate = () => {
		const newErrors = {};
		if (!form.name.trim()) newErrors.name = "El nombre es requerido";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleConfirm = async () => {
		if (!validate()) return;
		if (cartItems.length === 0) {
			toast.error("El carrito está vacío");
			return;
		}

		try {
			// 1. Serializar los items para la mutación
			const items = cartItems.map((item) =>
				JSON.stringify({
					name: item.product.name,
					quantity: item.quantity,
					price: item.product.price,
				}),
			);

			// 2. Crear la order en BD
			await createOrder({
				variables: { userId: user.id, totalPrice, items },
			});

			// 3. Limpiar el carrito
			await clearCart({ variables: { userId: user.id } });

			// 4. Construir el mensaje de WhatsApp y abrir
			const message = buildWhatsAppMessage({
				items: cartItems,
				totalPrice,
				name: form.name.trim(),
				phone: form.phone.trim(),
				address: form.address.trim(),
			});

			const wsNumnber = form.phone;

			window.open(`https://wa.me/${wsNumnber}?text=${message}`, "_blank");

			// 5. Mostrar pantalla de éxito
			setDone(true);
		} catch (err) {
			toast.error("Error al procesar la orden", { description: err.message });
		}
	};

	const handleClose = () => {
		if (done) {
			navigate("/orders");
		}
		setDone(false);
		setErrors({});
		onClose();
	};

	// ── Success screen ────────────────────────────────────────────────────────

	if (done) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				size="sm"
				closeOnOverlay={false}
			>
				<div
					className="flex flex-col items-center gap-6 py-4 text-center"
					style={{ animation: "fadeUp 0.5s ease both" }}
				>
					{/* Icon */}
					<div className="relative">
						<div
							className="w-20 h-20 rounded-full flex items-center justify-center"
							style={{
								background:
									"color-mix(in srgb, var(--color-success) 10%, transparent)",
								border:
									"1px solid color-mix(in srgb, var(--color-success) 25%, transparent)",
							}}
						>
							<BsCheckCircle
								className="w-8 h-8"
								style={{ color: "var(--color-success)" }}
							/>
						</div>
						{/* Ring */}
						<div
							className="absolute inset-0 rounded-full border border-dashed"
							style={{
								borderColor:
									"color-mix(in srgb, var(--color-success) 20%, transparent)",
								animation: "heroRotateSlow 12s linear infinite",
							}}
						/>
					</div>

					{/* Text */}
					<div className="flex flex-col gap-2">
						<h2
							className="text-2xl font-light text-first"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							¡Solicitud enviada!
						</h2>
						<p className="text-sm text-first/50 max-w-xs leading-relaxed">
							Tu orden fue registrada y WhatsApp está abierto. El equipo de la
							tienda confirmará tu pedido pronto.
						</p>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-2 w-full pt-2">
						<Button fullWidth onClick={handleClose}>
							Ver mis órdenes
						</Button>
						<Button
							fullWidth
							variant="ghost"
							onClick={() => {
								setDone(false);
								onClose();
							}}
						>
							Seguir comprando
						</Button>
					</div>
				</div>
			</Modal>
		);
	}

	// ── Main form ─────────────────────────────────────────────────────────────

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Confirmar pedido"
			description="Revisa tu pedido y completa tus datos antes de contactarnos por WhatsApp."
			size="md"
			closeOnOverlay={!loading}
		>
			<div className="flex flex-col gap-6">
				{/* ── Resumen de productos ── */}
				<div>
					<SectionLabel icon={<BsBoxSeam />}>
						Resumen — {cartItems.length}{" "}
						{cartItems.length === 1 ? "producto" : "productos"}
					</SectionLabel>

					<div className="rounded-xl border border-first/8 bg-first/2 px-3 overflow-hidden">
						{cartItems.length === 0 ? (
							<p className="py-6 text-sm text-center text-first/30 italic">
								El carrito está vacío
							</p>
						) : (
							cartItems.map((item, i) => (
								<OrderItemRow key={item.product.id} item={item} index={i} />
							))
						)}
					</div>

					{/* Total */}
					<div className="flex items-center justify-between mt-3 px-1">
						<span className="text-xs text-first/40 uppercase tracking-wider font-medium">
							Total estimado
						</span>
						<span
							className="text-xl font-bold text-first tabular-nums"
							style={{ fontFamily: "'Cinzel', serif" }}
						>
							{formatPrice(totalPrice)}
						</span>
					</div>
				</div>

				{/* ── Datos del cliente ── */}
				<div>
					<SectionLabel icon={<BsPerson />}>Tus datos</SectionLabel>

					<div className="flex flex-col gap-3">
						<Input
							label="Nombre completo"
							name="name"
							placeholder="¿Cómo te llamamos?"
							value={form.name}
							onChange={handleChange}
							error={errors.name}
							iconLeft={<BsPerson />}
							required
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input
								label="Teléfono"
								name="phone"
								type="tel"
								placeholder="+506 0000-0000"
								value={form.phone}
								onChange={handleChange}
								iconLeft={<BsTelephone />}
								hint="Para coordinar la entrega"
							/>
							<Input
								label="Dirección"
								name="address"
								placeholder="Provincia, cantón, señas..."
								value={form.address}
								onChange={handleChange}
								iconLeft={<BsGeoAlt />}
							/>
						</div>
					</div>
				</div>

				{/* ── WhatsApp notice ── */}
				<div
					className="flex items-start gap-3 rounded-xl px-4 py-3"
					style={{
						background: "color-mix(in srgb, #25D366 8%, transparent)",
						border: "1px solid color-mix(in srgb, #25D366 20%, transparent)",
					}}
				>
					<BsWhatsapp
						className="w-4 h-4 mt-0.5 shrink-0"
						style={{ color: "#25D366" }}
					/>
					<p
						className="text-xs leading-relaxed"
						style={{
							color: "color-mix(in srgb, #25D366 90%, var(--color-first))",
						}}
					>
						Al confirmar, se registrará tu orden y se abrirá WhatsApp con un
						mensaje listo para enviar a la tienda.
					</p>
				</div>

				{/* ── Actions ── */}
				<div className="flex justify-end gap-2 pt-1 border-t border-first/10">
					<Button
						variant="outline"
						size="sm"
						onClick={handleClose}
						disabled={loading}
						icon={<BsX />}
					>
						Cancelar
					</Button>
					<Button
						size="sm"
						loading={loading}
						onClick={handleConfirm}
						disabled={cartItems.length === 0}
						icon={<BsWhatsapp />}
					>
						Confirmar y enviar por WhatsApp
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default PurchaseForm;
