import Button from "../common/Button";
import Input from "../common/Input";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { useMutation, useQuery } from "@apollo/client/react";
import { BsDroplet, BsPlus, BsTrash } from "react-icons/bs";
import {
	GET_PRODUCTS,
	GET_PRODUCT,
} from "../../graphql/product/ProductQueries";
import { CREATE_PRODUCT } from "../../graphql/product/ProductMutations";
import { Spinner } from "../interface/LoadingUi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_DECANT = { size: "", price: "", stock: "" };

const buildVariables = (decant, parent) => ({
	name: parent.name,
	brand: parent.brand?.name ?? "",
	category: parent.category?.id ?? "",
	segment: parent.segment?.id ?? "",
	price: parseFloat(decant.price),
	stock: decant.stock ? parseInt(decant.stock) : 0,
	size: decant.size.trim(),
	images: parent.images?.length ? parent.images : [],
	description: parent.description ?? undefined,
	notes: parent.notes?.map((n) => n.id) ?? undefined,
	isDecant: true,
	linkedProduct: parent.id,
});

// ── DecantRow ─────────────────────────────────────────────────────────────────

const DecantRow = ({ decant, index, onChange, onRemove, errors, isFirst }) => (
	<div
		className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start p-3 rounded-xl border border-first/10 bg-first/2"
		style={{
			animation: "fadeUp 0.3s ease both",
			animationDelay: `${index * 50}ms`,
		}}
	>
		<Input
			label={isFirst ? "Tamaño" : undefined}
			placeholder="Ej: 2ml"
			value={decant.size}
			onChange={(e) => onChange(index, "size", e.target.value)}
			error={errors[`size_${index}`]}
			required
		/>
		<Input
			label={isFirst ? "Precio (₡)" : undefined}
			type="number"
			placeholder="0.00"
			value={decant.price}
			onChange={(e) => onChange(index, "price", e.target.value)}
			error={errors[`price_${index}`]}
			required
		/>
		<Input
			label={isFirst ? "Stock" : undefined}
			type="number"
			placeholder="0"
			value={decant.stock}
			onChange={(e) => onChange(index, "stock", e.target.value)}
		/>
		<div className={isFirst ? "mt-6" : ""}>
			<Button
				iconOnly
				variant="ghost"
				size="sm"
				icon={<BsTrash />}
				onClick={() => onRemove(index)}
				aria-label="Eliminar decant"
				className="hover:text-error!"
			/>
		</div>
	</div>
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * DecantForm
 *
 * Crea uno o más decants para un perfume padre ya existente.
 *
 * Props:
 * - product: object — perfume padre (debe tener al menos { id, name })
 * - onSuccess: () => void
 * - onCancel: () => void
 */
const DecantForm = ({ product, onSuccess, onCancel }) => {
	const toast = useToast();

	const [decants, setDecants] = useState([{ ...EMPTY_DECANT }]);
	const [errors, setErrors] = useState({});

	// Fetch completo del producto padre para garantizar brand, category, segment populados
	const { data: productData, loading: loadingProduct } = useQuery(GET_PRODUCT, {
		variables: { id: product?.id },
		skip: !product?.id,
	});

	const fullProduct = productData?.getProduct ?? null;

	const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
		refetchQueries: [{ query: GET_PRODUCTS }],
	});

	// ── Handlers ──────────────────────────────────────────────────────────────

	const addDecant = () => setDecants((prev) => [...prev, { ...EMPTY_DECANT }]);

	const removeDecant = (index) => {
		setDecants((prev) => prev.filter((_, i) => i !== index));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[`size_${index}`];
			delete next[`price_${index}`];
			return next;
		});
	};

	const handleChange = (index, field, value) => {
		setDecants((prev) =>
			prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
		);
		const key = `${field}_${index}`;
		if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
	};

	// ── Validation ────────────────────────────────────────────────────────────

	const validate = () => {
		const newErrors = {};

		decants.forEach((d, i) => {
			if (!d.size.trim()) newErrors[`size_${i}`] = "Tamaño requerido";
			if (!d.price || isNaN(d.price) || Number(d.price) <= 0)
				newErrors[`price_${i}`] = "Precio válido requerido";
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// ── Submit ────────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!validate()) return;

		try {
			await Promise.all(
				decants.map((decant) =>
					createProduct({ variables: buildVariables(decant, fullProduct) }),
				),
			);

			toast.success(
				decants.length === 1
					? "Decant creado"
					: `${decants.length} decants creados`,
				{ description: `Vinculados a "${fullProduct.name}"` },
			);

			onSuccess?.();
		} catch (err) {
			toast.error("Error al crear decants", { description: err.message });
		}
	};

	// ── Loading del producto padre ────────────────────────────────────────────

	if (loadingProduct) {
		return (
			<div className="flex items-center justify-center py-10">
				<Spinner size="md" />
			</div>
		);
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-6">
			{/* ── Perfume padre ── */}
			

			{/* ── Decants ── */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BsDroplet className="w-3.5 h-3.5 text-second/60" />
						<span className="text-xs font-semibold uppercase tracking-widest text-first/40">
							Decants a crear
						</span>
						{decants.length > 0 && (
							<span className="text-xs bg-second/10 text-second border border-second/20 rounded-full px-2 py-0.5 font-medium">
								{decants.length}
							</span>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						icon={<BsPlus />}
						onClick={addDecant}
					>
						Agregar otro
					</Button>
				</div>

				{decants.length === 0 ? (
					<div
						className="py-8 flex flex-col items-center gap-3 border border-dashed border-first/10 rounded-xl"
						style={{ animation: "fadeUp 0.3s ease both" }}
					>
						<BsDroplet className="w-8 h-8 text-first/15" />
						<p className="text-sm text-first/30 italic">
							Agrega al menos un decant
						</p>
						<Button
							variant="outline"
							size="sm"
							icon={<BsPlus />}
							onClick={addDecant}
						>
							Agregar decant
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{decants.map((decant, index) => (
							<DecantRow
								key={index}
								decant={decant}
								index={index}
								onChange={handleChange}
								onRemove={removeDecant}
								errors={errors}
								isFirst={index === 0}
							/>
						))}
					</div>
				)}
			</div>

			{/* ── Herencia informativa ── */}
			{decants.length > 0 && (
				<p className="text-xs text-first/35 leading-relaxed">
					Los decants heredarán automáticamente la imagen, categoría, segmento,
					acordes olfativos y descripción de{" "}
					<span className="text-first/60 font-medium">
						{fullProduct?.name ?? product.name}
					</span>
					.
				</p>
			)}

			{/* ── Acciones ── */}
			<div className="flex justify-end gap-2 pt-2 border-t border-first/10">
				{onCancel && (
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={creating}
					>
						Cancelar
					</Button>
				)}
				<Button
					size="sm"
					loading={creating}
					onClick={handleSubmit}
					disabled={decants.length === 0 || !fullProduct}
					icon={<BsDroplet />}
				>
					{decants.length <= 1
						? "Crear decant"
						: `Crear ${decants.length} decants`}
				</Button>
			</div>
		</div>
	);
};

export default DecantForm;
