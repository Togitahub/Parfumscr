import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { BsSearch, BsX, BsPlus, BsTrash } from "react-icons/bs";
import { useToast } from "../../hooks/ToastContext";
import { GET_PRODUCTS } from "../../graphql/product/ProductQueries";
import { GET_STORE_PRODUCTS } from "../../graphql/store/StoreQueries";
import {
	ADD_PRODUCT_TO_STORE,
	UPDATE_STORE_PRODUCT,
	REMOVE_PRODUCT_FROM_STORE,
} from "../../graphql/store/StoreMutations";
import { Spinner } from "../interface/LoadingUi";
import Button from "../common/Button";

const StoreCatalog = ({ storeId }) => {
	const toast = useToast();
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState({}); // { [productId]: { price, stock } }

	const { data: allData, loading: loadingAll } = useQuery(GET_PRODUCTS);
	const { data: storeData, loading: loadingStore } = useQuery(
		GET_STORE_PRODUCTS,
		{
			variables: { storeId },
			skip: !storeId,
		},
	);

	const [addProduct, { loading: adding }] = useMutation(ADD_PRODUCT_TO_STORE, {
		refetchQueries: [{ query: GET_STORE_PRODUCTS, variables: { storeId } }],
	});

	const [updateStoreProduct] = useMutation(UPDATE_STORE_PRODUCT, {
		refetchQueries: [{ query: GET_STORE_PRODUCTS, variables: { storeId } }],
	});

	const [removeProduct, { loading: removing }] = useMutation(
		REMOVE_PRODUCT_FROM_STORE,
		{
			refetchQueries: [{ query: GET_STORE_PRODUCTS, variables: { storeId } }],
		},
	);

	const allProducts = useMemo(() => allData?.getProducts ?? [], [allData]);
	const storeProductIds = new Set(
		storeData?.getStoreProducts?.map((sp) => sp.product.id) ?? [],
	);

	const filtered = useMemo(() => {
		if (!search.trim()) return allProducts;
		const q = search.toLowerCase();
		return allProducts.filter(
			(p) =>
				p.name?.toLowerCase().includes(q) ||
				p.brand?.name?.toLowerCase().includes(q),
		);
	}, [allProducts, search]);

	const handleAdd = async (productId, values) => {
		try {
			await addProduct({
				variables: {
					productId,
					price: values?.price ? parseFloat(values.price) : undefined,
					stock: values?.stock ? parseInt(values.stock) : undefined,
				},
			});
			toast.success("Producto agregado a tu tienda");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const handleRemove = async (productId) => {
		try {
			await removeProduct({ variables: { productId } });
			toast.success("Producto eliminado de tu tienda");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	if (loadingAll || loadingStore) {
		return (
			<div className="flex items-center justify-center py-10">
				<Spinner size="md" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-base font-semibold text-first">
					Catálogo de tu tienda
				</h2>
				<p className="text-xs text-first/40">
					Activa o desactiva los productos que ofreces a tus clientes.
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

			{/* Stats */}
			<p className="text-xs text-first/35">
				{storeProductIds.size} de {allProducts.length} productos en tu tienda
			</p>

			{/* Product rows */}
			<div className="flex flex-col gap-2">
				{filtered.map((product) => {
					const inStore = storeProductIds.has(product.id);
					const editValues = editing[product.id] ?? { price: "", stock: "" };

					return (
						<div
							key={product.id}
							className={[
								"flex flex-col gap-3 px-4 py-3 rounded-xl border transition-all duration-150",
								inStore
									? "border-second/30 bg-second/4"
									: "border-first/8 hover:border-first/20",
							].join(" ")}
						>
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
									variant={inStore ? "ghost" : "primary"}
									icon={inStore ? <BsTrash /> : <BsPlus />}
									onClick={() =>
										inStore
											? handleRemove(product.id)
											: handleAdd(product.id, editValues)
									}
									disabled={adding || removing}
									className={inStore ? "hover:text-error!" : ""}
								/>
							</div>

							{/* Precio y stock — solo cuando está en la store */}
							{inStore && (
								<div className="flex gap-3 pl-13">
									<div className="flex flex-col gap-1 flex-1">
										<label className="text-xs text-first/40">Precio (₡)</label>
										<input
											type="number"
											placeholder={`Global: ${product.price}`}
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
											placeholder={`Global: ${product.stock}`}
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
														},
													});
												}
											}}
											className="w-full h-8 px-2 rounded-lg border border-first/15 bg-main text-first text-xs focus:outline-none focus:ring-2 focus:ring-second/30"
										/>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default StoreCatalog;
