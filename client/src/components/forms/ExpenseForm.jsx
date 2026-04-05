import Input from "../common/Input";
import Button from "../common/Button";
import Select from "../common/Select";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { useMutation } from "@apollo/client/react";
import {
	CREATE_EXPENSE,
	UPDATE_EXPENSE,
} from "../../graphql/expense/ExpenseMutations";
import {
	GET_EXPENSES,
	GET_EXPENSE_SUMMARY,
} from "../../graphql/expense/ExpenseQueries";

const CATEGORY_OPTIONS = [
	{ value: "Inventario", label: "📦 Inventario" },
	{ value: "Envíos", label: "🚚 Envíos" },
	{ value: "Marketing", label: "📣 Marketing" },
	{ value: "Operativo", label: "⚙️ Operativo" },
	{ value: "Otro", label: "📝 Otro" },
];

const toDateInput = (dateStr) => {
	if (!dateStr) return new Date().toISOString().split("T")[0];
	const d = new Date(isNaN(Number(dateStr)) ? dateStr : Number(dateStr));
	return d.toISOString().split("T")[0];
};

const buildInitialForm = (expense) => ({
	amount: expense?.amount?.toString() ?? "",
	category: expense?.category ?? "Otro",
	description: expense?.description ?? "",
	date: toDateInput(expense?.date),
	notes: expense?.notes ?? "",
});

const ExpenseForm = ({ storeId, expense = null, onSuccess, onCancel }) => {
	const toast = useToast();
	const isEditing = Boolean(expense);

	const [form, setForm] = useState(() => buildInitialForm(expense));
	const [errors, setErrors] = useState({});

	const refetchQueries = [
		{ query: GET_EXPENSES, variables: { storeId } },
		{ query: GET_EXPENSE_SUMMARY, variables: { storeId } },
	];

	const [createExpense, { loading: creating }] = useMutation(CREATE_EXPENSE, {
		refetchQueries,
	});

	const [updateExpense, { loading: updating }] = useMutation(UPDATE_EXPENSE, {
		refetchQueries,
	});

	const loading = creating || updating;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validate = () => {
		const newErrors = {};
		if (!form.description.trim())
			newErrors.description = "La descripción es requerida";
		if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
			newErrors.amount = "Ingresa un monto válido";
		if (!form.category) newErrors.category = "Selecciona una categoría";
		if (!form.date) newErrors.date = "La fecha es requerida";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		try {
			if (isEditing) {
				await updateExpense({
					variables: {
						id: expense.id,
						amount: parseFloat(form.amount),
						category: form.category,
						description: form.description.trim(),
						date: form.date,
						notes: form.notes.trim() || null,
					},
				});
				toast.success("Gasto actualizado");
			} else {
				await createExpense({
					variables: {
						storeId,
						amount: parseFloat(form.amount),
						category: form.category,
						description: form.description.trim(),
						date: form.date,
						notes: form.notes.trim() || null,
					},
				});
				toast.success("Gasto registrado");
			}
			onSuccess?.();
		} catch (err) {
			toast.error("Error al guardar", { description: err.message });
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSubmit();
	};

	return (
		<div className="flex flex-col gap-5">
			{/* Descripción + Categoría */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Descripción"
					name="description"
					placeholder="Ej: Compra de frascos"
					value={form.description}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					error={errors.description}
					required
					autoFocus
				/>
				<Select
					label="Categoría"
					name="category"
					options={CATEGORY_OPTIONS}
					value={form.category}
					onChange={handleChange}
					error={errors.category}
					required
				/>
			</div>

			{/* Monto + Fecha */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Monto (₡)"
					name="amount"
					type="number"
					placeholder="0.00"
					value={form.amount}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					error={errors.amount}
					required
				/>
				<Input
					label="Fecha"
					name="date"
					type="date"
					value={form.date}
					onChange={handleChange}
					error={errors.date}
					required
				/>
			</div>

			{/* Notas */}
			<Input
				label="Notas"
				name="notes"
				placeholder="Información adicional (opcional)"
				value={form.notes}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>

			{/* Acciones */}
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
					{isEditing ? "Guardar cambios" : "Registrar gasto"}
				</Button>
			</div>
		</div>
	);
};

export default ExpenseForm;
