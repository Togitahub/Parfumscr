import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { BsSearch, BsX, BsTrash } from "react-icons/bs";
import { useToast } from "../../hooks/ToastContext";
import { GET_STORE_PRODUCTS } from "../../graphql/store/StoreQueries";
import {
	REMOVE_PRODUCT_FROM_STORE,
	UPDATE_STORE_PRODUCT,
} from "../../graphql/store/StoreMutations";
import { Spinner } from "../interface/LoadingUi";
import Button from "../common/Button";

const StoreCatalog = ({ storeId }) => {
	const toast = useToast();
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState({});

	const { data: storeData, loading: loadingStore } = useQuery(
		GET_STORE_PRODUCTS,
		{
			variables: { storeId },
			skip: !storeId,
		},
	);

	const [updateStoreProduct] = useMutation(UPDATE_STORE_PRODUCT, {
		refetchQueries: [{ query: GET_STORE_PRODUCTS, variables: { storeId } }],
	});

	const [removeProduct, { loading: removing }] = useMutation(
		REMOVE_PRODUCT_FROM_STORE,
		{
			refetchQueries: [{ query: GET_STORE_PRODUCTS, variables: { storeId } }],
		},
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const storeProducts = storeData?.getStoreProducts ?? [];

	const filtered = useMemo(() => {
		if (!search.trim()) return storeProducts;
		const q = search.toLowerCase();
		return storeProducts.filter(
			(sp) =>
				sp.product.name?.toLowerCase().includes(q) ||
				sp.product.brand?.name?.toLowerCase().includes(q),
		);
	}, [storeProducts, search]);

	const handleRemove = async (productId) => {
		try {
			await removeProduct({ variables: { productId } });
			toast.success("Producto eliminado de tu tienda");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const getEditing = (sp) =>
		editing[sp.product.id] ?? {
			price: sp.price != null ? String(sp.price) : "",
			stock: sp.stock != null ? String(sp.stock) : "",
			discount: sp.discount != null ? String(sp.discount) : "",
		};

	if (loadingStore) {
		return (
			<div className="flex items-center justify-center py-10">
				<Spinner size="md" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-base font-semibold text-first">Mi catálogo</h2>
				<p className="text-xs text-first/40">
					{storeProducts.length} producto{storeProducts.length !== 1 ? "s" : ""}{" "}
					en tu tienda. Para agregar más, ve a la pestaña{" "}
					<span className="text-second font-medium">Productos</span>.
				</p>
			</div>

			{/* Search */}
			<div className="relative flex items-center">
				<span className="absolute left-3 text-first/35 pointer-events-none">
					<BsSearch className="w-4 h-4" />
				</span>
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar por nombre o marca..."
					className="w-full h-10 pl-9 pr-9 rounded-xl border border-first/15 bg-main text-sm text-first placeholder:text-first/30 focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second transition-all duration-150"
				/>
				{search && (
					<button
						onClick={() => setSearch("")}
						className="absolute right-3 text-first/30 hover:text-first/60 cursor-pointer"
					>
						<BsX className="w-4 h-4" />
					</button>
				)}
			</div>

			{/* Empty state */}
			{storeProducts.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 border border-dashed border-first/10 rounded-2xl">
					<p className="text-sm text-first/30 italic">
						Tu tienda no tiene productos aún.
					</p>
					<p className="text-xs text-first/25">
						Agrégalos desde la pestaña{" "}
						<span className="text-second/60">Productos</span>.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{filtered.map((sp) => {
						const editValues = getEditing(sp);
						const product = sp.product;

						return (
							<div
								key={product.id}
								className="flex flex-col gap-3 px-4 py-3 rounded-xl border border-second/30 bg-second/4"
							>
								{/* Product header */}
								<div className="flex items-center gap-3">
									{product.images?.[0] && (
										<div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
											<img
												src={product.images[0]}
												alt={product.name}
												className="w-full h-full object-cover"
											/>
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-first truncate">
											{product.name}
										</p>
										<p className="text-xs text-first/40">
											{product.brand?.name}
											{product.size && ` · ${product.size}`}
											{product.isDecant && " · Decant"}
										</p>
									</div>
									<Button
										iconOnly
										size="sm"
										variant="ghost"
										icon={<BsTrash />}
										onClick={() => handleRemove(product.id)}
										disabled={removing}
										className="hover:text-error!"
									/>
								</div>

								{/* Price / stock / discount override */}
								<div className="flex gap-3">
									<div className="flex flex-col gap-1 flex-1">
										<label className="text-xs text-first/40">Precio (₡)</label>
										<input
											type="number"
											placeholder={`Base: ${sp.price ?? product.price}`}
											value={editValues.price}
											onChange={(e) =>
												setEditing((prev) => ({
													...prev,
													[product.id]: {
														...editValues,
														price: e.target.value,
													},
												}))
											}
											onBlur={() => {
												if (editValues.price !== "") {
													updateStoreProduct({
														variables: {
															productId: product.id,
															price: parseFloat(editValues.price),
															stock:
																editValues.stock !== ""
																	? parseInt(editValues.stock)
																	: undefined,
															discount:
																editValues.discount !== ""
																	? parseFloat(editValues.discount)
																	: undefined,
														},
													});
												}
											}}
											className="w-full h-8 px-2 rounded-lg border border-first/15 bg-main text-first text-xs focus:outline-none focus:ring-2 focus:ring-second/30"
										/>
									</div>
									<div className="flex flex-col gap-1 flex-1">
										<label className="text-xs text-first/40">Stock</label>
										<input
											type="number"
											placeholder={`Base: ${sp.stock ?? product.stock}`}
											value={editValues.stock}
											onChange={(e) =>
												setEditing((prev) => ({
													...prev,
													[product.id]: {
														...editValues,
														stock: e.target.value,
													},
												}))
											}
											onBlur={() => {
												if (editValues.stock !== "") {
													updateStoreProduct({
														variables: {
															productId: product.id,
															price:
																editValues.price !== ""
																	? parseFloat(editValues.price)
																	: undefined,
															stock: parseInt(editValues.stock),
															discount:
																editValues.discount !== ""
																	? parseFloat(editValues.discount)
																	: undefined,
														},
													});
												}
											}}
											className="w-full h-8 px-2 rounded-lg border border-first/15 bg-main text-first text-xs focus:outline-none focus:ring-2 focus:ring-second/30"
										/>
									</div>
									<div className="flex flex-col gap-1 flex-1">
										<label className="text-xs text-first/40">
											Descuento (%)
										</label>
										<input
											type="number"
											min="0"
											max="100"
											placeholder={`Base: ${sp.discount ?? 0}%`}
											value={editValues.discount}
											onChange={(e) =>
												setEditing((prev) => ({
													...prev,
													[product.id]: {
														...editValues,
														discount: e.target.value,
													},
												}))
											}
											onBlur={() => {
												if (editValues.discount !== "") {
													updateStoreProduct({
														variables: {
															productId: product.id,
															price:
																editValues.price !== ""
																	? parseFloat(editValues.price)
																	: undefined,
															stock:
																editValues.stock !== ""
																	? parseInt(editValues.stock)
																	: undefined,
															discount: parseFloat(editValues.discount),
														},
													});
												}
											}}
											className="w-full h-8 px-2 rounded-lg border border-first/15 bg-main text-first text-xs focus:outline-none focus:ring-2 focus:ring-second/30"
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default StoreCatalog;
