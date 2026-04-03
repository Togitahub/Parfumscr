import { useRef, useState, useEffect } from "react";
import { BsCheckCircle, BsXCircle, BsUpload, BsX } from "react-icons/bs";
import { Spinner } from "../interface/LoadingUi";
import Button from "../common/Button";

/**
 * ImageUploader Component
 *
 * Sube una imagen a Cloudinary usando firma del servidor.
 *
 * Props:
 * - onUpload: (url: string) => void — se llama cuando la imagen se sube con éxito
 * - onRemove: () => void — se llama cuando se elimina la imagen subida
 * - label: string (default: "Imagen")
 * - error: string — mensaje de error externo (desde validación del form)
 * - disabled: boolean
 */

const ImageUploader = ({
	onUpload,
	onRemove,
	label = "Imagen",
	error,
	disabled = false,
	resetKey,
}) => {
	const inputRef = useRef(null);

	useEffect(() => {
		setStatus("idle");
		setUploadedUrl("");
		setUploadError("");
	}, [resetKey]);

	const [status, setStatus] = useState("idle"); // "idle" | "uploading" | "success" | "error"
	const [uploadedUrl, setUploadedUrl] = useState("");
	const [uploadError, setUploadError] = useState("");

	const ALLOWED_TYPES = [
		"image/webp",
		"image/png",
		"image/jpg",
		"image/jpeg",
		"image/avif",
	];
	const MAX_SIZE_MB = 5;
	const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

	const handleFileChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validar tipo
		if (!ALLOWED_TYPES.includes(file.type)) {
			setStatus("error");
			setUploadError(
				"Solo se permiten imágenes en formato WebP, PNG, JPG o AVIF",
			);
			return;
		}

		// Validar tamaño
		if (file.size > MAX_SIZE_BYTES) {
			setStatus("error");
			setUploadError(`La imagen no puede superar los ${MAX_SIZE_MB}MB`);
			return;
		}

		// Reset
		setStatus("uploading");
		setUploadError("");
		setUploadedUrl("");

		try {
			// 1. Obtener firma del servidor
			const sigRes = await fetch(
				`${import.meta.env.VITE_SERVER_URI.replace(
					"/graphql",
					"",
				)}/api/cloudinary-signature`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						authorization: `Bearer ${localStorage.getItem("authToken")}`,
					},
					body: JSON.stringify({
						fileType: file.type,
						fileSize: file.size,
					}),
				},
			);

			if (!sigRes.ok) {
				const { error } = await sigRes.json();
				throw new Error(error);
			}

			const { signature, timestamp, cloudName, apiKey, folder, eager } =
				await sigRes.json();

			// 2. Subir imagen directamente a Cloudinary
			const formData = new FormData();
			formData.append("file", file);
			formData.append("api_key", apiKey);
			formData.append("timestamp", timestamp);
			formData.append("signature", signature);
			formData.append("folder", folder);
			formData.append("eager", eager);
			formData.append("transformation", "q_auto:best,f_auto");

			const uploadRes = await fetch(
				`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
				{ method: "POST", body: formData },
			);

			if (!uploadRes.ok) throw new Error("Error al subir la imagen");

			const uploadData = await uploadRes.json();

			// 3. Guardar URL y notificar al padre
			setUploadedUrl(uploadData.secure_url);
			setStatus("success");
			onUpload?.(uploadData.secure_url);
		} catch (err) {
			setStatus("error");
			setUploadError(err.message);
		} finally {
			// Limpiar input para permitir subir el mismo archivo de nuevo
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const handleRemove = async () => {
		if (uploadedUrl) {
			try {
				await fetch(
					`${import.meta.env.VITE_SERVER_URI.replace("/graphql", "")}/api/cloudinary-delete`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							authorization: `Bearer ${localStorage.getItem("authToken")}`,
						},
						body: JSON.stringify({ url: uploadedUrl }),
					},
				);
			} catch (err) {
				console.error("Error deleting image:", err);
			}
		}
		setStatus("idle");
		setUploadedUrl("");
		setUploadError("");
		onRemove?.();
	};

	const hasError = Boolean(error) || status === "error";

	const borderClass = hasError
		? "border-error"
		: status === "success"
			? "border-success"
			: "border-first/20";

	return (
		<div className="flex flex-col gap-1 w-full">
			{/* Label */}
			{label && (
				<label className="text-sm font-medium text-first/80 select-none">
					{label}
				</label>
			)}

			{/* Upload area */}
			<div
				className={[
					"flex items-center gap-3 rounded-md border px-3 py-2 h-10 bg-main transition-colors duration-150",
					borderClass,
					disabled ? "opacity-50 cursor-not-allowed" : "",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{/* Estado: idle */}
				{status === "idle" && (
					<>
						<button
							type="button"
							disabled={disabled}
							onClick={() => inputRef.current?.click()}
							className="flex items-center gap-2 text-sm text-first/50 hover:text-first/80 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed flex-1"
						>
							<BsUpload className="w-4 h-4 shrink-0" />
							<span>Seleccionar imagen...</span>
						</button>
					</>
				)}

				{/* Estado: uploading */}
				{status === "uploading" && (
					<div className="flex items-center gap-2 flex-1">
						<Spinner size="sm" />
						<span className="text-sm text-first/50">Subiendo imagen...</span>
					</div>
				)}

				{/* Estado: success */}
				{status === "success" && (
					<>
						<BsCheckCircle className="w-4 h-4 text-success shrink-0" />
						<span className="text-sm text-first/70 flex-1 truncate">
							{uploadedUrl}
						</span>
						<Button
							iconOnly
							variant="ghost"
							size="xs"
							icon={<BsX />}
							onClick={handleRemove}
							aria-label="Eliminar imagen"
						/>
					</>
				)}

				{/* Estado: error */}
				{status === "error" && (
					<>
						<BsXCircle className="w-4 h-4 text-error shrink-0" />
						<span className="text-sm text-error flex-1 truncate">
							{uploadError}
						</span>
						<button
							type="button"
							onClick={() => {
								setStatus("idle");
								setUploadError("");
							}}
							className="text-xs text-first/40 hover:text-first/70 cursor-pointer transition-colors shrink-0"
						>
							Reintentar
						</button>
					</>
				)}
			</div>

			{/* Input file oculto */}
			<input
				ref={inputRef}
				type="file"
				accept="image/webp,image/png,image/jpeg,image/avif"
				className="hidden"
				onChange={handleFileChange}
				disabled={disabled}
			/>

			{/* Error externo (validación del form) */}
			{error && status !== "error" && (
				<p role="alert" className="text-error font-medium text-sm">
					{error}
				</p>
			)}
		</div>
	);
};

export default ImageUploader;
