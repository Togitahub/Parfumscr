/**
 * useGuestCart
 *
 * Manages a shopping cart in localStorage for unauthenticated users.
 * Cart items are stored as:
 *   [{ product: { id, name, brand, price, images, size, isDecant }, quantity }]
 */

import { useState, useCallback } from "react";

const STORAGE_KEY = "guest_cart";

const readCart = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
};

const writeCart = (items) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		// Storage full or unavailable — fail silently
	}
};

const useGuestCart = () => {
	const [items, setItems] = useState(readCart);

	const persist = useCallback((nextItems) => {
		setItems(nextItems);
		writeCart(nextItems);
	}, []);

	// ── Add or increase qty ───────────────────────────────────────────────────

	const addItem = useCallback(
		(product, quantity = 1) => {
			const current = readCart();
			const idx = current.findIndex((i) => i.product.id === product.id);

			let next;
			if (idx >= 0) {
				next = current.map((i, index) =>
					index === idx ? { ...i, quantity: i.quantity + quantity } : i,
				);
			} else {
				next = [...current, { product, quantity }];
			}

			persist(next);
		},
		[persist],
	);

	// ── Remove one item completely ────────────────────────────────────────────

	const removeItem = useCallback(
		(productId) => {
			const next = readCart().filter((i) => i.product.id !== productId);
			persist(next);
		},
		[persist],
	);

	// ── Decrease qty (remove if reaches 0) ───────────────────────────────────

	const decreaseItem = useCallback(
		(productId) => {
			const current = readCart();
			const next = current
				.map((i) =>
					i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
				)
				.filter((i) => i.quantity > 0);
			persist(next);
		},
		[persist],
	);

	// ── Clear all items ───────────────────────────────────────────────────────

	const clearCart = useCallback(() => {
		persist([]);
	}, [persist]);

	// ── Reload from storage (useful after login/logout) ───────────────────────

	const reloadFromStorage = useCallback(() => {
		setItems(readCart());
	}, []);

	const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
	const totalPrice = items.reduce(
		(acc, i) => acc + i.product.price * i.quantity,
		0,
	);

	return {
		items,
		totalItems,
		totalPrice,
		addItem,
		removeItem,
		decreaseItem,
		clearCart,
		reloadFromStorage,
	};
};

export default useGuestCart;
