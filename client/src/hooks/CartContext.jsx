/**
 * CartContext
 *
 * Unified cart that automatically switches between:
 *   - Server-side cart (Apollo / GraphQL) when the user is authenticated
 *   - localStorage cart (useGuestCart) when the user is a guest
 *
 * Exports:
 *   - CartProvider  — wrap your app (inside AuthProvider + ApolloProvider)
 *   - useCart       — hook to consume the cart from any component
 *
 * Shape returned by useCart:
 * {
 *   items,          // [{ product, quantity }]
 *   totalItems,     // number
 *   totalPrice,     // number
 *   loading,        // boolean
 *   isGuest,        // boolean — true when using localStorage
 *   addItem,        // (product, quantity?) => Promise<void>
 *   removeItem,     // (productId) => Promise<void>
 *   decreaseItem,   // (productId, currentQty) => Promise<void>
 *   clearCart,      // () => Promise<void>
 * }
 */

import {
	createContext,
	useContext,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import { useAuth } from "./AuthContext";
import useGuestCart from "./useGuestCart";

import { GET_USER_CART } from "../graphql/cart/CartQueries";
import {
	ADD_ITEM_TO_CART,
	REMOVE_ITEM_FROM_CART,
	CLEAR_CART,
} from "../graphql/cart/CartMutations";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
	const { user, isAuthenticated } = useAuth();
	const isGuest = !isAuthenticated;

	// ── Guest cart (localStorage) ─────────────────────────────────────────────

	const guestCart = useGuestCart();

	// ── Server cart (Apollo) ──────────────────────────────────────────────────

	const {
		data,
		loading: loadingCart,
		refetch,
	} = useQuery(GET_USER_CART, {
		variables: { userId: user?.id },
		skip: isGuest || !user?.id,
	});

	const refetchVars = { query: GET_USER_CART, variables: { userId: user?.id } };

	const [addItemMutation] = useMutation(ADD_ITEM_TO_CART, {
		refetchQueries: [refetchVars],
	});
	const [removeItemMutation] = useMutation(REMOVE_ITEM_FROM_CART, {
		refetchQueries: [refetchVars],
	});
	const [clearCartMutation] = useMutation(CLEAR_CART, {
		refetchQueries: [refetchVars],
	});

	// ── When user logs in, merge guest cart into server cart ──────────────────

	useEffect(() => {
		if (!isAuthenticated || !user?.id) return;

		const guestItems = guestCart.items;
		if (guestItems.length === 0) return;

		const mergeCart = async () => {
			for (const item of guestItems) {
				try {
					await addItemMutation({
						variables: {
							userId: user.id,
							productId: item.product.id,
							quantity: item.quantity,
						},
					});
				} catch {
					// If a product can't be added (e.g. deleted), skip silently
				}
			}
			guestCart.clearCart();
			refetch();
		};

		mergeCart();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, user?.id]);

	// ── Derived server cart data ──────────────────────────────────────────────

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const serverItems = data?.getUserCart?.items ?? [];
	const serverTotalItems = serverItems.reduce((acc, i) => acc + i?.quantity, 0);
	const serverTotalPrice = serverItems.reduce(
		(acc, i) => acc + i?.product.price * i?.quantity,
		0,
	);

	// ── Unified actions ───────────────────────────────────────────────────────

	const addItem = useCallback(
		async (product, quantity = 1) => {
			if (isGuest) {
				const currentItems = guestCart.items;
				const existing = currentItems.find((i) => i.product.id === product.id);
				const currentQty = existing?.quantity ?? 0;
				if (currentQty + quantity > (product.stock ?? 0)) {
					throw new Error(
						`Stock insuficiente. Solo hay ${product.stock} unidad${product.stock !== 1 ? "es" : ""} disponible${product.stock !== 1 ? "s" : ""}.`,
					);
				}
				guestCart.addItem(product, quantity);
			} else {
				const currentItems = serverItems;
				const existing = currentItems.find((i) => i.product.id === product.id);
				const currentQty = existing?.quantity ?? 0;
				if (currentQty + quantity > (product.stock ?? 0)) {
					throw new Error(
						`Stock insuficiente. Solo hay ${product.stock} unidad${product.stock !== 1 ? "es" : ""} disponible${product.stock !== 1 ? "s" : ""}.`,
					);
				}
				await addItemMutation({
					variables: { userId: user.id, productId: product.id, quantity },
				});
			}
		},
		[isGuest, guestCart, addItemMutation, user?.id, serverItems],
	);

	const removeItem = useCallback(
		async (productId) => {
			if (isGuest) {
				guestCart.removeItem(productId);
			} else {
				await removeItemMutation({
					variables: { userId: user.id, productId },
				});
			}
		},
		[isGuest, guestCart, removeItemMutation, user?.id],
	);

	const decreaseItem = useCallback(
		async (productId, currentQty) => {
			if (isGuest) {
				guestCart.decreaseItem(productId);
			} else {
				if (currentQty <= 1) {
					await removeItemMutation({
						variables: { userId: user.id, productId },
					});
				} else {
					await addItemMutation({
						variables: { userId: user.id, productId, quantity: -1 },
					});
				}
			}
		},
		[isGuest, guestCart, removeItemMutation, addItemMutation, user?.id],
	);

	const clearCart = useCallback(async () => {
		if (isGuest) {
			guestCart.clearCart();
		} else {
			await clearCartMutation({ variables: { userId: user.id } });
		}
	}, [isGuest, guestCart, clearCartMutation, user?.id]);

	// ── Exposed value ─────────────────────────────────────────────────────────

	const value = useMemo(
		() => ({
			items: isGuest ? guestCart.items : serverItems,
			totalItems: isGuest ? guestCart.totalItems : serverTotalItems,
			totalPrice: isGuest ? guestCart.totalPrice : serverTotalPrice,
			loading: !isGuest && loadingCart,
			isGuest,
			addItem,
			removeItem,
			decreaseItem,
			clearCart,
		}),
		[
			isGuest,
			guestCart.items,
			guestCart.totalItems,
			guestCart.totalPrice,
			serverItems,
			serverTotalItems,
			serverTotalPrice,
			loadingCart,
			addItem,
			removeItem,
			decreaseItem,
			clearCart,
		],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used within a CartProvider");
	return ctx;
};
