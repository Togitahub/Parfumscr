import Expense from "../../models/Expense.js";
import Store from "../../models/Store.js";

export const getDateFilter = (period) => {
	const now = new Date();

	if (period === "day") {
		const start = new Date(now);
		start.setDate(now.getDate() - 1);
	}

	if (period === "week") {
		const start = new Date(now);
		start.setDate(now.getDate() - 7);
		return { $gte: start };
	}

	if (period === "month") {
		return { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
	}

	if (period === "year") {
		return { $gte: new Date(now.getFullYear(), 0, 1) };
	}

	if (period === "custom" && startDate && endDate) {
		const start = new Date(startDate);
		start.setHours(0, 0, 0, 0);
		const end = new Date(endDate);
		end.setHours(23, 59, 59, 999);
		return { $gte: start, $lte: end };
	}

	if (period === "custom" && startDate) {
		const start = new Date(startDate);
		start.setHours(0, 0, 0, 0);
		return { $gte: start };
	}

	return null;
};

const expenseResolvers = {
	Query: {
		getExpenses: async (_, { storeId, period }, { user }) => {
			if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role))
				throw new Error("Unauthorized");

			const filter = { store: storeId };
			const dateFilter = getDateFilter(period);
			if (dateFilter) filter.date = dateFilter;

			return await Expense.find(filter).sort({ date: -1 });
		},

		getExpenseSummary: async (_, { storeId, period }, { user }) => {
			if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role))
				throw new Error("Unauthorized");

			const filter = { store: storeId };
			const dateFilter = getDateFilter(period);
			if (dateFilter) filter.date = dateFilter;

			const expenses = await Expense.find(filter);

			const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

			const categoryMap = {};
			for (const e of expenses) {
				if (!categoryMap[e.category]) {
					categoryMap[e.category] = { total: 0, count: 0 };
				}
				categoryMap[e.category].total += e.amount;
				categoryMap[e.category].count += 1;
			}

			const byCategory = Object.entries(categoryMap).map(
				([category, data]) => ({
					category,
					total: data.total,
					count: data.count,
				}),
			);

			return { totalExpenses, byCategory };
		},
	},

	Mutation: {
		createExpense: async (
			_,
			{ storeId, amount, category, description, date, notes },
			{ user },
		) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store || store._id.toString() !== storeId)
				throw new Error("Store not found or unauthorized");

			return await Expense.create({
				store: storeId,
				amount,
				category,
				description,
				date: date ? new Date(date) : new Date(),
				notes: notes || null,
			});
		},

		updateExpense: async (
			_,
			{ id, amount, category, description, date, notes },
			{ user },
		) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const expense = await Expense.findById(id);
			if (!expense) throw new Error("Expense not found");

			const store = await Store.findOne({ owner: user._id });
			if (!store || store._id.toString() !== expense.store.toString())
				throw new Error("Unauthorized");

			const update = {};
			if (amount !== undefined) update.amount = amount;
			if (category !== undefined) update.category = category;
			if (description !== undefined) update.description = description;
			if (date !== undefined) update.date = new Date(date);
			if (notes !== undefined) update.notes = notes || null;

			return await Expense.findByIdAndUpdate(id, update, { new: true });
		},

		deleteExpense: async (_, { id }, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const expense = await Expense.findById(id);
			if (!expense) throw new Error("Expense not found");

			const store = await Store.findOne({ owner: user._id });
			if (!store || store._id.toString() !== expense.store.toString())
				throw new Error("Unauthorized");

			await Expense.findByIdAndDelete(id);
			return { success: true, message: "Expense deleted" };
		},
	},
};

export default expenseResolvers;
