import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import ImageUploader from "../common/ImageUploader";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { BsPlus, BsTrash, BsFlask } from "react-icons/bs";
import { GET_NOTES } from "../../graphql/note/NoteQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_SEGMENTS } from "../../graphql/segment/SegmentQueries";
import { GET_PRODUCTS } from "../../graphql/product/ProductQueries";
import {
	CREATE_PRODUCT,
	UPDATE_PRODUCT,
} from "../../graphql/product/ProductMutations";
import { GET_CATEGORIES } from "../../graphql/category/CategoryQueries";
import { useEffect } from "react";
import { useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildInitialForm = (product) => {
	if (!product) {
		return {
			name: "",
			brand: "",
			category: "",
			segment: "",
			price: "",
			stock: "",
			size: "",
			description: "",
			imageUrl: "",
			notes: [],
		};
	}

	return {
		name: product.name ?? "",
		brand: product.brand?.name ?? "",
		category: product.category?.id ?? "",
		segment: product.segment?.id ?? "",
		price: product.price?.toString() ?? "",
		stock: product.stock?.toString() ?? "",
		size: product.size ?? "",
		description: product.description ?? "",
		imageUrl: product.images?.[0] ?? "",
		notes: product.notes?.map((n) => n.id) ?? [],
	};
};

const buildInitialDecants = (product) => {
	if (!product?.decants?.length) return [];
	return product.decants.map((d) => ({
		size: d.size ?? "",
		price: d.price?.toString() ?? "",
		stock: d.stock?.toString() ?? "",
	}));
};

const EMPTY_DECANT = { size: "", price: "", stock: "" };

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ProductForm
 *
 * Props:
 * - product: object | null — si se pasa, activa modo edición
 * - onSuccess: () => void
 * - onCancel: () => void
 */
const ProductForm = ({ product = null, onSuccess, onCancel }) => {
	const submitted = useRef(false);

	const toast = useToast();
	const isEditing = Boolean(product);

	const [form, setForm] = useState(() => buildInitialForm(product));
	const [decants, setDecants] = useState(() => buildInitialDecants(product));
	const [errors, setErrors] = useState({});

	const { data: catData } = useQuery(GET_CATEGORIES);
	const { data: segData } = useQuery(GET_SEGMENTS);
	const { data: noteData } = useQuery(GET_NOTES);

	const [createProduct, { loading: loadingCreate }] = useMutation(
		CREATE_PRODUCT,
		{ refetchQueries: [{ query: GET_PRODUCTS }] },
	);

	const [updateProduct, { loading: loadingUpdate }] = useMutation(
		UPDATE_PRODUCT,
		{ refetchQueries: [{ query: GET_PRODUCTS }] },
	);

	const loading = loadingCreate || loadingUpdate;

	// ── Select options ────────────────────────────────────────────────────────

	const categoryOptions =
		catData?.getCategories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

	const segmentOptions =
		segData?.getSegments?.map((s) => ({ value: s.id, label: s.name })) ?? [];

	const noteOptions =
		noteData?.getNotes?.map((n) => ({ value: n.id, label: n.name })) ?? [];

	// ── Form handlers ─────────────────────────────────────────────────────────

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleImageUpload = (url) => {
		setForm((prev) => ({ ...prev, imageUrl: url }));
		if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: "" }));
	};

	const deleteUploadedImage = async (url) => {
		if (!url) return;
		try {
			await fetch(
				`${import.meta.env.VITE_SERVER_URI.replace("/graphql", "")}/api/cloudinary-delete`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						authorization: `Bearer ${localStorage.getItem("authToken")}`,
					},
					body: JSON.stringify({ url }),
				},
			);
		} catch (err) {
			console.error("Error deleting image:", err);
		}
	};

	const handleImageRemove = async () => {
		await deleteUploadedImage(form.imageUrl);
		setForm((prev) => ({ ...prev, imageUrl: "" }));
	};

	const handleCancel = async () => {
		if (!isEditing && form.imageUrl) {
			await deleteUploadedImage(form.imageUrl);
		}
		onCancel?.();
	};

	const handleNoteToggle = (noteId) => {
		setForm((prev) => ({
			...prev,
			notes: prev.notes.includes(noteId)
				? prev.notes.filter((id) => id !== noteId)
				: [...prev.notes, noteId],
		}));
	};

	// ── Decant handlers ───────────────────────────────────────────────────────

	const addDecant = () => setDecants((prev) => [...prev, { ...EMPTY_DECANT }]);

	const removeDecant = (index) =>
		setDecants((prev) => prev.filter((_, i) => i !== index));

	const handleDecantChange = (index, field, value) =>
		setDecants((prev) =>
			prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
		);

	// ── Validation ────────────────────────────────────────────────────────────

	const validate = () => {
		const newErrors = {};

		if (!form.name.trim()) newErrors.name = "El nombre es requerido";
		if (!form.brand.trim()) newErrors.brand = "La marca es requerida";
		if (!form.category) newErrors.category = "La categoría es requerida";
		if (!form.segment) newErrors.segment = "El segmento es requerido";
		if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
			newErrors.price = "Ingresa un precio válido";
		if (!form.imageUrl) newErrors.imageUrl = "Sube al menos una imagen";

		decants.forEach((d, i) => {
			if (!d.size.trim()) newErrors[`decant_size_${i}`] = "Tamaño requerido";
			if (!d.price || isNaN(d.price) || Number(d.price) <= 0)
				newErrors[`decant_price_${i}`] = "Precio válido requerido";
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// ── Submit ────────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!validate()) return;

		const sharedVariables = {
			name: form.name.trim(),
			brand: form.brand.trim(),
			category: form.category,
			segment: form.segment,
			price: parseFloat(form.price),
			stock: form.stock ? parseInt(form.stock) : 0,
			size: form.size.trim() || undefined,
			description: form.description.trim() || undefined,
			images: [form.imageUrl],
			notes: form.notes.length > 0 ? form.notes : undefined,
		};

		try {
			if (isEditing) {
				await updateProduct({
					variables: { id: product.id, ...sharedVariables },
				});
				toast.success("Producto actualizado");
			} else {
				const decantsPayload =
					decants.length > 0
						? decants.map((d) => ({
								size: d.size.trim(),
								price: parseFloat(d.price),
								stock: d.stock ? parseInt(d.stock) : 0,
							}))
						: undefined;

				await createProduct({
					variables: {
						...sharedVariables,
						decants: decantsPayload,
					},
				});

				toast.success(
					"Producto creado",
					decants.length > 0
						? {
								description: `${decants.length} decant(s) creados automáticamente`,
							}
						: undefined,
				);
			}

			submitted.current = true;
			onSuccess?.();
		} catch (err) {
			toast.error(isEditing ? "Error al actualizar" : "Error al crear", {
				description: err.message,
			});
			console.log(err.message);
		}
	};

	useEffect(() => {
		return () => {
			if (!isEditing && form.imageUrl && !submitted.current) {
				fetch(
					`${import.meta.env.VITE_SERVER_URI.replace("/graphql", "")}/api/cloudinary-delete`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							authorization: `Bearer ${localStorage.getItem("authToken")}`,
						},
						body: JSON.stringify({ url: form.imageUrl }),
					},
				);
			}
		};
	}, [form.imageUrl, isEditing]);

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-6">
			{/* ── Datos del perfume ── */}
			<section className="flex flex-col gap-4">
				<h3 className="text-center text-sm font-semibold text-first/60 uppercase tracking-widest">
					Datos del perfume
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="Nombre"
						name="name"
						placeholder="Ej: Sauvage"
						value={form.name}
						onChange={handleChange}
						error={errors.name}
						required
					/>
					<Input
						label="Marca"
						name="brand"
						placeholder="Ej: Dior"
						value={form.brand}
						onChange={handleChange}
						error={errors.brand}
						required
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Select
						label="Categoría"
						name="category"
						options={categoryOptions}
						value={form.category}
						onChange={handleChange}
						error={errors.category}
						required
					/>
					<Select
						label="Segmento"
						name="segment"
						options={segmentOptions}
						value={form.segment}
						onChange={handleChange}
						error={errors.segment}
						required
					/>
				</div>

				{noteOptions.length > 0 && (
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-first/80 select-none">
							Notas olfativas
						</label>
						<div className="flex flex-wrap gap-2">
							{noteOptions.map((note) => {
								const selected = form.notes.includes(note.value);
								return (
									<button
										key={note.value}
										type="button"
										onClick={() => handleNoteToggle(note.value)}
										className={[
											"px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer",
											selected
												? "bg-second text-main border-second"
												: "bg-transparent text-first/50 border-first/20 hover:border-first/40",
										].join(" ")}
									>
										{note.label}
									</button>
								);
							})}
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Input
						label="Precio"
						name="price"
						type="number"
						placeholder="0.00"
						value={form.price}
						onChange={handleChange}
						error={errors.price}
						required
					/>
					<Input
						label="Stock"
						name="stock"
						type="number"
						placeholder="0"
						value={form.stock}
						onChange={handleChange}
					/>
					<Input
						label="Tamaño"
						name="size"
						placeholder="Ej: 100ml"
						value={form.size}
						onChange={handleChange}
					/>
				</div>

				<ImageUploader
					label="Imagen"
					onUpload={handleImageUpload}
					onRemove={handleImageRemove}
					error={errors.imageUrl}
					disabled={loading}
					currentUrl={form.imageUrl}
				/>

				<Input
					label="Descripción"
					name="description"
					placeholder="Descripción del perfume..."
					value={form.description}
					onChange={handleChange}
				/>
			</section>

			{/* ── Decants (solo en creación) ── */}
			{!isEditing && (
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<BsFlask className="text-second w-4 h-4" />
							<h3 className="text-sm font-semibold text-first/60 uppercase tracking-widest">
								Decants
							</h3>
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
							Agregar decant
						</Button>
					</div>

					{decants.length === 0 ? (
						<p className="text-sm text-first/30 text-center py-4 border border-dashed border-first/10 rounded-lg">
							Sin decants — el perfume se creará solo. Puedes agregarlos ahora o
							después.
						</p>
					) : (
						<div className="flex flex-col gap-3">
							{decants.map((decant, index) => (
								<div
									key={index}
									className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start p-3 rounded-lg border border-first/10 bg-first/2"
								>
									<Input
										label={index === 0 ? "Tamaño" : undefined}
										placeholder="Ej: 2ml"
										value={decant.size}
										onChange={(e) =>
											handleDecantChange(index, "size", e.target.value)
										}
										error={errors[`decant_size_${index}`]}
										required
									/>
									<Input
										label={index === 0 ? "Precio" : undefined}
										type="number"
										placeholder="0.00"
										value={decant.price}
										onChange={(e) =>
											handleDecantChange(index, "price", e.target.value)
										}
										error={errors[`decant_price_${index}`]}
										required
									/>
									<Input
										label={index === 0 ? "Stock" : undefined}
										type="number"
										placeholder="0"
										value={decant.stock}
										onChange={(e) =>
											handleDecantChange(index, "stock", e.target.value)
										}
									/>
									<div className={index === 0 ? "mt-6" : ""}>
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											icon={<BsTrash />}
											onClick={() => removeDecant(index)}
											aria-label="Eliminar decant"
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			)}

			{/* ── Acciones ── */}
			<div className="flex justify-end gap-2 pt-2 border-t border-first/10">
				{onCancel && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleCancel}
						disabled={loading}
					>
						Cancelar
					</Button>
				)}
				<Button size="sm" loading={loading} onClick={handleSubmit}>
					{isEditing
						? "Guardar cambios"
						: decants.length > 0
							? `Crear perfume + ${decants.length} decant${decants.length > 1 ? "s" : ""}`
							: "Crear perfume"}
				</Button>
			</div>
		</div>
	);
};

export default ProductForm;
