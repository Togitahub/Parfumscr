import Input from "../common/Input";
import Button from "../common/Button";
import ImageUploader from "../common/ImageUploader";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_MY_STORE } from "../../graphql/store/StoreQueries";
import { CREATE_STORE, UPDATE_STORE } from "../../graphql/store/StoreMutations";

const DEFAULT_COLORS = {
	colorMain: "#000000",
	colorFirst: "#ffffff",
	colorSecond: "#ffd700",
};

const ColorPreview = ({ colorMain, colorFirst, colorSecond }) => (
	<div
		className="rounded-xl border border-first/10 p-4 flex flex-col gap-3 transition-all duration-300"
		style={{ background: colorMain }}
	>
		<p
			className="text-xs font-semibold uppercase tracking-widest"
			style={{ color: colorSecond }}
		>
			Vista previa
		</p>
		<p className="text-lg font-bold" style={{ color: colorFirst }}>
			Nombre del producto
		</p>
		<div className="flex gap-2">
			<span
				className="px-3 py-1 rounded-full text-xs font-medium"
				style={{ background: colorSecond, color: colorMain }}
			>
				Agregar al carrito
			</span>
			<span
				className="px-3 py-1 rounded-full text-xs font-medium border"
				style={{ borderColor: colorFirst, color: colorFirst }}
			>
				Favoritos
			</span>
		</div>
	</div>
);

const StoreForm = () => {
	const toast = useToast();

	const { data, loading: loadingStore } = useQuery(GET_MY_STORE);
	const existingStore = data?.getMyStore;

	const [overrides, setOverrides] = useState({});

	const form = {
		slug: overrides.slug ?? existingStore?.slug ?? "",
		storeName: overrides.storeName ?? existingStore?.storeName ?? "",
		whatsapp: overrides.whatsapp ?? existingStore?.whatsapp ?? "",
		facebook: form.facebook.trim() || undefined,
		instagram: form.instagram.trim() || undefined,
		customDomain: overrides.customDomain ?? existingStore?.customDomain ?? "",
		logo: overrides.logo ?? existingStore?.logo ?? "",
		colorMain:
			overrides.colorMain ??
			existingStore?.colorMain ??
			DEFAULT_COLORS.colorMain,
		colorFirst:
			overrides.colorFirst ??
			existingStore?.colorFirst ??
			DEFAULT_COLORS.colorFirst,
		colorSecond:
			overrides.colorSecond ??
			existingStore?.colorSecond ??
			DEFAULT_COLORS.colorSecond,
		heroTagline: overrides.heroTagline ?? existingStore?.heroTagline ?? "",
		heroDescription:
			overrides.heroDescription ?? existingStore?.heroDescription ?? "",
		heroBadge1: overrides.heroBadge1 ?? existingStore?.heroBadge1 ?? "",
		heroBadge2: overrides.heroBadge2 ?? existingStore?.heroBadge2 ?? "",
	};

	const [createStore, { loading: creating }] = useMutation(CREATE_STORE, {
		refetchQueries: [{ query: GET_MY_STORE }],
	});

	const [updateStore, { loading: updating }] = useMutation(UPDATE_STORE, {
		refetchQueries: [{ query: GET_MY_STORE }],
	});

	const loading = creating || updating || loadingStore;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setOverrides((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
		if (!form.storeName.trim()) {
			toast.error("El nombre de la tienda es requerido");
			return;
		}

		try {
			if (existingStore) {
				await updateStore({
					variables: {
						storeName: form.storeName.trim(),
						customDomain: form.customDomain.trim() || undefined,
						whatsapp: form.whatsapp.trim() || undefined,
						facebook: form.facebook.trim() || undefined,
						instagram: form.instagram.trim() || undefined,
						logo: form.logo || undefined,
						colorMain: form.colorMain,
						colorFirst: form.colorFirst,
						colorSecond: form.colorSecond,
						heroTagline: form.heroTagline.trim() || undefined,
						heroDescription: form.heroDescription.trim() || undefined,
						heroBadge1: form.heroBadge1.trim() || undefined,
						heroBadge2: form.heroBadge2.trim() || undefined,
					},
				});
				toast.success("Tienda actualizada");
			} else {
				if (!form.slug.trim()) {
					toast.error("El slug es requerido");
					return;
				}
				await createStore({
					variables: {
						slug: form.slug.trim().toLowerCase(),
						storeName: form.storeName.trim(),
						whatsapp: form.whatsapp.trim() || undefined,
						logo: form.logo || undefined,
						colorMain: form.colorMain,
						colorFirst: form.colorFirst,
						colorSecond: form.colorSecond,
					},
				});
				toast.success("Tienda creada");
			}
		} catch (err) {
			toast.error("Error al guardar", { description: err.message });
		}
	};

	return (
		<div className="flex flex-col gap-6 max-w-2xl">
			{/* Info */}
			<div className="flex flex-col gap-1">
				<h2 className="text-base font-semibold text-first">
					{existingStore ? "Configuración de tu tienda" : "Crear tu tienda"}
				</h2>
				<p className="text-xs text-first/40">
					{existingStore
						? `URL actual: ${existingStore.slug}.tudominio.com`
						: "Una vez creada, podrás compartir tu tienda con tus clientes."}
				</p>
			</div>

			{/* Slug — solo en creación */}
			{!existingStore && (
				<Input
					label="Slug (identificador único)"
					name="slug"
					placeholder="ej: mi-tienda"
					value={form.slug}
					onChange={handleChange}
					hint="Solo letras minúsculas, números y guiones. No se puede cambiar después."
					required
				/>
			)}

			<Input
				label="Nombre de la tienda"
				name="storeName"
				placeholder="Ej: Parfums María"
				value={form.storeName}
				onChange={handleChange}
				required
			/>

			<Input
				label="WhatsApp"
				name="whatsapp"
				type="tel"
				placeholder="+506 0000-0000"
				value={form.whatsapp}
				onChange={handleChange}
				hint="Número al que se enviarán los pedidos"
			/>

			<Input
				label="Facebook"
				name="facebook"
				placeholder="https://facebook.com/tu-pagina"
				value={form.facebook}
				onChange={handleChange}
				hint="URL completa de tu página de Facebook"
			/>
			<Input
				label="Instagram"
				name="instagram"
				placeholder="https://instagram.com/tu-usuario"
				value={form.instagram}
				onChange={handleChange}
				hint="URL completa de tu perfil de Instagram"
			/>

			{/* Dominio personalizado — solo en edición */}
			{existingStore && (
				<Input
					label="Dominio personalizado"
					name="customDomain"
					placeholder="ej: mi-tienda.com"
					value={form.customDomain}
					onChange={handleChange}
					hint="Opcional. Debes apuntar el DNS de tu dominio a este servidor."
				/>
			)}

			<ImageUploader
				label="Logo"
				onUpload={(url) => setOverrides((prev) => ({ ...prev, logo: url }))}
				onRemove={() => setOverrides((prev) => ({ ...prev, logo: "" }))}
			/>

			{/* Colores */}
			<div className="flex flex-col gap-3">
				<p className="text-sm font-medium text-first/80">Colores</p>
				<div className="grid grid-cols-3 gap-4">
					{[
						{ name: "colorMain", label: "Fondo" },
						{ name: "colorFirst", label: "Texto" },
						{ name: "colorSecond", label: "Acento" },
					].map(({ name, label }) => (
						<div key={name} className="flex flex-col gap-1.5">
							<label className="text-xs text-first/50">{label}</label>
							<div className="flex items-center gap-2 h-10 px-3 rounded-md border border-first/20 bg-main">
								<input
									type="color"
									name={name}
									value={form[name]}
									onChange={handleChange}
									className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
								/>
								<span className="text-xs text-first/50 font-mono">
									{form[name]}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Preview */}
				<ColorPreview
					colorMain={form.colorMain}
					colorFirst={form.colorFirst}
					colorSecond={form.colorSecond}
				/>
			</div>

			{/* Hero */}
			<div className="flex flex-col gap-3">
				<p className="text-sm font-medium text-first/80">Hero de la tienda</p>
				<p className="text-xs text-first/35">
					Personaliza el texto que aparece en la portada de tu tienda.
				</p>
				<Input
					label="Tagline"
					name="heroTagline"
					placeholder="Ej: 100% originales, Tu aroma único, Lujo accesible..."
					value={form.heroTagline}
					onChange={handleChange}
					hint="Aparece en color acento debajo del nombre de la tienda"
				/>
				<Input
					label="Descripción"
					name="heroDescription"
					placeholder="Describe tu tienda en una oración inspiradora..."
					value={form.heroDescription}
					onChange={handleChange}
				/>
				<div className="grid grid-cols-2 gap-3">
					<Input
						label="Badge 1"
						name="heroBadge1"
						placeholder="Ej: ✦ Variedad"
						value={form.heroBadge1}
						onChange={handleChange}
					/>
					<Input
						label="Badge 2"
						name="heroBadge2"
						placeholder="Ej: ✦ Calidad"
						value={form.heroBadge2}
						onChange={handleChange}
					/>
				</div>
			</div>

			<div className="flex justify-end pt-2 border-t border-first/10">
				<Button size="sm" loading={loading} onClick={handleSubmit}>
					{existingStore ? "Guardar cambios" : "Crear tienda"}
				</Button>
			</div>
		</div>
	);
};

export default StoreForm;
