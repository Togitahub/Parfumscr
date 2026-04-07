import Input from "../common/Input";
import Button from "../common/Button";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { useMutation } from "@apollo/client/react";

/**
 * NameEntityForm
 *
 * Formulario genérico para crear o editar entidades con un único campo `name`.
 * Usado para Brand, Category y Segment.
 *
 * Props:
 * - mutation: DocumentNode — mutación de GraphQL a ejecutar (CREATE o UPDATE)
 * - refetchQueries: array — queries a refetch tras la mutación
 * - entity: object | null — si se pasa, activa el modo edición ({ id, name })
 * - label: string — etiqueta del input (default: "Nombre")
 * - placeholder: string — placeholder del input (default: "Ej: Nombre")
 * - successMessage: string — mensaje del toast en éxito (default: "Guardado")
 * - onSuccess: () => void
 * - onCancel: () => void
 */

const NameEntityForm = ({
	mutation,
	refetchQueries = [],
	entity = null,
	label = "Nombre",
	placeholder = "Ej: Nombre",
	successMessage = "Guardado",
	onSuccess,
	onCancel,
}) => {
	const toast = useToast();
	const isEditing = Boolean(entity);

	const [name, setName] = useState(entity?.name ?? "");
	const [error, setError] = useState("");

	const [executeMutation, { loading }] = useMutation(mutation, {
		refetchQueries,
	});

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleChange = (e) => {
		setName(e.target.value);
		if (error) setError("");
	};

	const validate = () => {
		if (!name.trim()) {
			setError(`${label} es requerido`);
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		try {
			const variables = isEditing
				? { id: entity.id, name: name.trim() }
				: { name: name.trim() };

			await executeMutation({ variables });

			toast.success(successMessage);
			setName("");
			onSuccess?.();
		} catch (err) {
			toast.error("Error al guardar", { description: err.message });
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSubmit();
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-5">
			<Input
				label={label}
				placeholder={placeholder}
				value={name}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				error={error}
				required
				autoFocus
			/>

			<div className="flex justify-end gap-2 pt-2 border-t border-first/10">
				{onCancel && (
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={loading}
					>
						Cancelar
					</Button>
				)}
				<Button size="sm" loading={loading} onClick={handleSubmit}>
					{isEditing ? "Guardar cambios" : "Crear"}
				</Button>
			</div>
		</div>
	);
};

export default NameEntityForm;
