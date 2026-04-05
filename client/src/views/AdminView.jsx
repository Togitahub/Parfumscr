/**
 * AdminView
 *
 * Panel de administración con acceso basado en rol:
 *
 * ADMIN:
 *   - Productos (CRUD completo)
 *   - Marcas (CRUD)
 *   - Categorías (CRUD)
 *   - Segmentos (CRUD)
 *   - Acordes olfativos (CRUD)
 *
 * SUPER_ADMIN (todo lo anterior +):
 *   - Usuarios (CRUD completo)
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
	BsBoxSeam,
	BsBookmark,
	BsTag,
	BsLayers,
	BsDroplet,
	BsPeople,
	BsPlus,
	BsPencil,
	BsTrash,
	BsShop,
	BsReceipt,
	BsGraphUp,
	BsUpcScan,
	BsWallet2,
} from "react-icons/bs";

import { useAuth } from "../hooks/AuthContext";
import { useQuery, useMutation } from "@apollo/client/react";
import { useToast } from "../hooks/ToastContext";

// GraphQL
import { GET_PRODUCTS } from "../graphql/product/ProductQueries";
import { DELETE_PRODUCT } from "../graphql/product/ProductMutations";

import { GET_BRANDS } from "../graphql/brand/BrandQueries";
import {
	CREATE_BRAND,
	UPDATE_BRAND,
	DELETE_BRAND,
} from "../graphql/brand/BrandMutations";

import { GET_CATEGORIES } from "../graphql/category/CategoryQueries";
import {
	CREATE_CATEGORY,
	UPDATE_CATEGORY,
	DELETE_CATEGORY,
} from "../graphql/category/CategoryMutations";

import { GET_SEGMENTS } from "../graphql/segment/SegmentQueries";
import {
	CREATE_SEGMENT,
	UPDATE_SEGMENT,
	DELETE_SEGMENT,
} from "../graphql/segment/SegmentMutations";

import { GET_NOTES } from "../graphql/note/NoteQueries";
import {
	CREATE_NOTE,
	UPDATE_NOTE,
	DELETE_NOTE,
} from "../graphql/note/NoteMutations";

import { GET_USERS } from "../graphql/user/UserQueries";
import { DELETE_USER, TOGGLE_USER_ACTIVE } from "../graphql/user/UserMutations";
import { GET_MY_STORE, GET_STORES } from "../graphql/store/StoreQueries";

import {
	ADD_PRODUCT_TO_STORE,
	REMOVE_PRODUCT_FROM_STORE,
	TOGGLE_STORE_POS,
} from "../graphql/store/StoreMutations";
import { GET_STORE_PRODUCTS } from "../graphql/store/StoreQueries";

import { GET_ALL_ORDERS } from "../graphql/order/OrderQueries";
import {
	DELETE_ORDER,
	UPDATE_ORDER_STATUS,
} from "../graphql/order/OrderMutations";

// Components
import { Modal, ConfirmDialog } from "../components/interface/Modal";
import { Spinner } from "../components/interface/LoadingUi";
import ProductList from "../lists/ProductList";
import UserList from "../lists/UserList";
import ProductForm from "../components/forms/ProductForm";
import UserForm from "../components/forms/UserForm";
import NameEntityForm from "../components/forms/NameEntityForm";
import Button from "../components/common/Button";
import EmptyState from "../components/interface/EmptyState";
import DecantForm from "../components/forms/DecantForm";
import StoreForm from "../components/forms/StoreForm";
import StoreCatalog from "../components/forms/StoreCatalog";
import OrderList from "../lists/OrderList";

// Views
import POSView from "./POSView";
import ExpensesView from "./ExpensesView";
import DashboardView from "./DashboardView";

// Contexts

import { FilterProvider } from "../hooks/FilterContext";

// ── Tab definitions ───────────────────────────────────────────────────────────

const buildAdminTabs = (myStoreExists) => [
	...(myStoreExists?.posEnabled
		? [{ key: "pos", label: "POS", icon: <BsUpcScan /> }]
		: []),
	...(myStoreExists
		? [{ key: "catalog", label: "Mi catálogo", icon: <BsBoxSeam /> }]
		: []),
	{ key: "products", label: "Productos", icon: <BsBoxSeam /> },
	{ key: "expenses", label: "Gastos", icon: <BsWallet2 /> },
	{ key: "dashboard", label: "Dashboard", icon: <BsGraphUp /> },
	{ key: "orders", label: "Órdenes", icon: <BsReceipt /> },
	{ key: "store", label: "Mi tienda", icon: <BsShop /> },
	{ key: "categories", label: "Categorías", icon: <BsTag /> },
	{ key: "segments", label: "Segmentos", icon: <BsLayers /> },
];

const SUPER_ADMIN_TABS = [
	{ key: "products", label: "Productos", icon: <BsBoxSeam /> },
	{ key: "orders", label: "Órdenes", icon: <BsReceipt /> },
	{ key: "brands", label: "Marcas", icon: <BsBookmark /> },
	{ key: "categories", label: "Categorías", icon: <BsTag /> },
	{ key: "segments", label: "Segmentos", icon: <BsLayers /> },
	{ key: "notes", label: "Acordes", icon: <BsDroplet /> },
	{ key: "users", label: "Usuarios", icon: <BsPeople /> },
];

// ── Simple entity table (for brands, categories, segments, notes) ─────────────

const EntityTable = ({ items = [], loading, onEdit, onDelete }) => {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-10">
				<Spinner size="md" />
			</div>
		);
	}

	if (!items.length) {
		return (
			<EmptyState
				title="Sin elementos"
				description="Crea el primero usando el botón de arriba"
				size="sm"
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
			{items.map((item, i) => (
				<div
					key={item.id}
					className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-first/15 bg-main hover:border-first/25 transition-all duration-150 group"
					style={{
						animation: "fadeUp 0.35s ease both",
						animationDelay: `${Math.min(i * 40, 300)}ms`,
					}}
				>
					<span className="text-sm font-medium text-first">{item.name}</span>
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
						{onEdit && (
							<Button
								iconOnly
								variant="ghost"
								size="sm"
								icon={<BsPencil />}
								onClick={() => onEdit(item)}
							/>
						)}
						{onDelete && (
							<Button
								iconOnly
								variant="ghost"
								size="sm"
								icon={<BsTrash />}
								onClick={() => onDelete(item)}
								className="hover:text-error!"
							/>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

// ── EntitySection: wraps EntityTable with create/edit modal ──────────────────

const EntitySection = ({
	title,
	items,
	loading,
	createMutation,
	updateMutation,
	deleteMutation,
	refetchQuery,
	label,
	placeholder,
}) => {
	const { user } = useAuth();
	const toast = useToast();

	const isSuperAdmin = user?.role === "SUPER_ADMIN";
	const [modalOpen, setModalOpen] = useState(false);
	const [editEntity, setEditEntity] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	const [deleteEntity, { loading: deleting }] = useMutation(deleteMutation, {
		refetchQueries: [{ query: refetchQuery }],
	});

	const handleEdit = (item) => {
		setEditEntity(item);
		setModalOpen(true);
	};

	const handleDelete = (item) => setDeleteTarget(item);

	const handleConfirmDelete = async () => {
		try {
			await deleteEntity({ variables: { id: deleteTarget.id } });
			toast.success(`${label} eliminado`);
			setDeleteTarget(null);
		} catch (err) {
			toast.error("Error al eliminar", { description: err.message });
		}
	};

	const handleOpenCreate = () => {
		setEditEntity(null);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setEditEntity(null);
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Section header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-base font-semibold text-first">{title}</h2>
					<p className="text-xs text-first/35 mt-0.5">
						{loading
							? "Cargando..."
							: `${items?.length ?? 0} elemento${items?.length !== 1 ? "s" : ""}`}
					</p>
				</div>
				<Button size="sm" icon={<BsPlus />} onClick={handleOpenCreate}>
					Nuevo
				</Button>
			</div>

			{/* Table */}
			<EntityTable
				items={items}
				loading={loading}
				onEdit={isSuperAdmin ? handleEdit : undefined}
				onDelete={isSuperAdmin ? handleDelete : undefined}
			/>

			{/* Create / Edit modal */}
			<Modal
				isOpen={modalOpen}
				onClose={handleModalClose}
				title={editEntity ? `Editar ${label}` : `Nuevo ${label}`}
				size="sm"
			>
				<NameEntityForm
					mutation={editEntity ? updateMutation : createMutation}
					refetchQueries={[{ query: refetchQuery }]}
					entity={editEntity}
					label={label}
					placeholder={placeholder}
					successMessage={
						editEntity ? `${label} actualizado` : `${label} creado`
					}
					onSuccess={handleModalClose}
					onCancel={handleModalClose}
				/>
			</Modal>

			{/* Delete confirm */}
			<ConfirmDialog
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
				loading={deleting}
				title={`¿Eliminar ${label}?`}
				description={`"${deleteTarget?.name}" será eliminado permanentemente.`}
				confirmLabel="Eliminar"
			/>
		</div>
	);
};

// ── Products section ──────────────────────────────────────────────────────────

const ProductsSection = ({ myStoreId }) => {
	const toast = useToast();
	const { user } = useAuth();
	const [modalOpen, setModalOpen] = useState(false);
	const [editProduct, setEditProduct] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [decantTarget, setDecantTarget] = useState(null);

	const { data: productsData, loading: loadingProducts } =
		useQuery(GET_PRODUCTS);
	const { data: brandsData } = useQuery(GET_BRANDS);
	const { data: categoriesData } = useQuery(GET_CATEGORIES);
	const { data: segmentsData } = useQuery(GET_SEGMENTS);
	const { data: notesData } = useQuery(GET_NOTES);
	const { data: storeProductsData, refetch: refetchStoreProducts } = useQuery(
		GET_STORE_PRODUCTS,
		{ variables: { storeId: myStoreId }, skip: !myStoreId },
	);

	const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
		refetchQueries: [
			{ query: GET_PRODUCTS },
			...(myStoreId
				? [{ query: GET_STORE_PRODUCTS, variables: { storeId: myStoreId } }]
				: []),
		],
	});

	const [addProductToStore] = useMutation(ADD_PRODUCT_TO_STORE, {
		refetchQueries: [
			{ query: GET_STORE_PRODUCTS, variables: { storeId: myStoreId } },
		],
	});

	const [removeProductFromStore] = useMutation(REMOVE_PRODUCT_FROM_STORE, {
		refetchQueries: [
			{ query: GET_STORE_PRODUCTS, variables: { storeId: myStoreId } },
		],
	});

	const products = productsData?.getProducts ?? [];
	const isSuperAdmin = user?.role === "SUPER_ADMIN";
	const brands = brandsData?.getBrands ?? [];
	const categories = categoriesData?.getCategories ?? [];
	const segments = segmentsData?.getSegments ?? [];
	const notes = notesData?.getNotes ?? [];

	const storeProductIds = new Set(
		storeProductsData?.getStoreProducts?.map((sp) => sp.product.id) ?? [],
	);

	const handleEdit = (product) => {
		setEditProduct(product);
		setModalOpen(true);
	};
	const handleDelete = (product) => setDeleteTarget(product);
	const handleConfirmDelete = async () => {
		try {
			await deleteProduct({ variables: { id: deleteTarget.id } });
			toast.success("Producto eliminado");
			setDeleteTarget(null);
		} catch (err) {
			toast.error("Error al eliminar", { description: err.message });
		}
	};
	const handleOpenCreate = () => {
		setEditProduct(null);
		setModalOpen(true);
	};
	const handleModalClose = () => {
		setModalOpen(false);
		setEditProduct(null);
	};

	const handleToggleStore = async (product) => {
		if (!myStoreId) return;
		try {
			if (storeProductIds.has(product.id)) {
				await removeProductFromStore({ variables: { productId: product.id } });
				toast.success("Quitado de tu tienda");
			} else {
				await addProductToStore({ variables: { productId: product.id } });
				toast.success("Agregado a tu tienda");
			}
			refetchStoreProducts();
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-base font-semibold text-first">Productos</h2>
					<p className="text-xs text-first/35 mt-0.5">
						{loadingProducts
							? "Cargando..."
							: `${products.length} producto${products.length !== 1 ? "s" : ""}`}
					</p>
				</div>
				<Button size="sm" icon={<BsPlus />} onClick={handleOpenCreate}>
					Nuevo Perfume
				</Button>
			</div>

			<FilterProvider pageSize={9}>
				<ProductList
					products={products}
					loading={loadingProducts}
					brands={brands}
					categories={categories}
					segments={segments}
					notes={notes}
					onEdit={isSuperAdmin ? handleEdit : undefined}
					onDelete={isSuperAdmin ? handleDelete : undefined}
					onAddDecant={(product) => setDecantTarget(product)}
					onToggleStore={myStoreId ? handleToggleStore : undefined}
					storeProductIds={storeProductIds}
					showAdminActions
				/>
			</FilterProvider>

			<Modal
				isOpen={modalOpen}
				onClose={handleModalClose}
				title={editProduct ? "Editar producto" : "Nuevo producto"}
				size="xl"
			>
				<ProductForm
					product={editProduct}
					onSuccess={handleModalClose}
					onCancel={handleModalClose}
				/>
			</Modal>

			<Modal
				isOpen={Boolean(decantTarget)}
				onClose={() => setDecantTarget(null)}
				title="Crear decants"
				description={`Para "${decantTarget?.name}"`}
				size="md"
			>
				<DecantForm
					product={decantTarget}
					onSuccess={() => setDecantTarget(null)}
					onCancel={() => setDecantTarget(null)}
				/>
			</Modal>

			<ConfirmDialog
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
				loading={deleting}
				title="¿Eliminar producto?"
				description={`"${deleteTarget?.name}" y sus decants asociados serán desvinculados.`}
				confirmLabel="Eliminar"
			/>
		</div>
	);
};

// ── Users section (SUPER_ADMIN only) ─────────────────────────────────────────

const UsersSection = () => {
	const toast = useToast();
	const [modalOpen, setModalOpen] = useState(false);
	const [editUser, setEditUser] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	const { data, loading } = useQuery(GET_USERS);
	const { data: storesData, refetch: refetchStores } = useQuery(GET_STORES);

	const [toggleUserActive] = useMutation(TOGGLE_USER_ACTIVE, {
		refetchQueries: [{ query: GET_USERS }],
	});
	const [toggleStorePos] = useMutation(TOGGLE_STORE_POS, {
		refetchQueries: [{ query: GET_STORES }],
	});

	const users = data?.getUsers ?? [];
	const stores = storesData?.getStores ?? []; // ← nuevo

	const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
		refetchQueries: [{ query: GET_USERS }],
	});

	const handleEdit = (user) => {
		setEditUser(user);
		setModalOpen(true);
	};

	const handleDelete = (user) => setDeleteTarget(user);

	const handleConfirmDelete = async () => {
		try {
			await deleteUser({ variables: { id: deleteTarget.id } });
			toast.success("Usuario eliminado");
			setDeleteTarget(null);
		} catch (err) {
			toast.error("Error al eliminar", { description: err.message });
		}
	};

	const handleOpenCreate = () => {
		setEditUser(null);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setEditUser(null);
	};

	const handleToggleActive = async (user) => {
		try {
			await toggleUserActive({
				variables: { id: user.id, active: !user.active },
			});
			toast.success(user.active ? "Cuenta suspendida" : "Cuenta reactivada");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const handleTogglePos = async (user) => {
		try {
			await toggleStorePos({ variables: { ownerId: user.id } });
			const store = stores.find((s) => s.owner === user.id);
			toast.success(store?.posEnabled ? "POS desactivado" : "POS activado");
			refetchStores();
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-base font-semibold text-first">Usuarios</h2>
					<p className="text-xs text-first/35 mt-0.5">
						{loading
							? "Cargando..."
							: `${users.length} usuario${users.length !== 1 ? "s" : ""}`}
					</p>
				</div>
				<Button size="sm" icon={<BsPlus />} onClick={handleOpenCreate}>
					Nuevo usuario
				</Button>
			</div>

			<UserList
				users={users}
				stores={stores}
				loading={loading}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleActive={handleToggleActive}
				onTogglePos={handleTogglePos}
			/>

			<Modal
				isOpen={modalOpen}
				onClose={handleModalClose}
				title={editUser ? "Editar usuario" : "Nuevo usuario"}
				size="md"
			>
				<UserForm
					user={editUser}
					onSuccess={handleModalClose}
					onCancel={handleModalClose}
				/>
			</Modal>

			<ConfirmDialog
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
				loading={deleting}
				title="¿Eliminar usuario?"
				description={`La cuenta de "${deleteTarget?.name}" será eliminada permanentemente junto con sus favoritos.`}
				confirmLabel="Eliminar"
			/>
		</div>
	);
};

const OrdersSection = () => {
	const toast = useToast();
	const [deleteTarget, setDeleteTarget] = useState(null);

	const { data, loading } = useQuery(GET_ALL_ORDERS);

	const [updateStatus] = useMutation(UPDATE_ORDER_STATUS, {
		refetchQueries: [{ query: GET_ALL_ORDERS }],
		awaitRefetchQueries: true,
	});

	const [deleteOrder, { loading: deleting }] = useMutation(DELETE_ORDER, {
		// agregar
		refetchQueries: [{ query: GET_ALL_ORDERS }],
	});

	const orders = data?.getAllOrders ?? [];

	const handleStatusChange = async (id, status) => {
		try {
			await updateStatus({ variables: { id, status } });
			toast.success("Estado actualizado");
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	const handleConfirmDelete = async () => {
		// agregar
		try {
			await deleteOrder({ variables: { id: deleteTarget.id } });
			toast.success("Orden eliminada");
			setDeleteTarget(null);
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className="text-base font-semibold text-first">Órdenes</h2>
				<p className="text-xs text-first/35 mt-0.5">
					{loading
						? "Cargando..."
						: `${orders.length} orden${orders.length !== 1 ? "es" : ""}`}
				</p>
			</div>
			<OrderList
				orders={orders}
				loading={loading}
				onStatusChange={handleStatusChange}
				onDelete={(order) => setDeleteTarget(order)}
				showStatusChange
			/>
			<ConfirmDialog
				isOpen={Boolean(deleteTarget)}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
				loading={deleting}
				title="¿Eliminar orden?"
				description={`La orden #${deleteTarget?.id?.slice(-8).toUpperCase()} será eliminada permanentemente.`}
				confirmLabel="Eliminar"
			/>
		</div>
	);
};

// ── Main AdminView ────────────────────────────────────────────────────────────

const AdminView = () => {
	const { user } = useAuth();
	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	const toast = useToast();

	// Queries for entity sections
	const { data: brandsData, loading: loadingBrands } = useQuery(GET_BRANDS);
	const { data: categoriesData, loading: loadingCategories } =
		useQuery(GET_CATEGORIES);
	const { data: segmentsData, loading: loadingSegments } =
		useQuery(GET_SEGMENTS);
	const { data: notesData, loading: loadingNotes } = useQuery(GET_NOTES);
	const { data: myStoreData } = useQuery(GET_MY_STORE, {
		skip: isSuperAdmin,
	});

	const brands = brandsData?.getBrands ?? [];
	const categories = categoriesData?.getCategories ?? [];
	const segments = segmentsData?.getSegments ?? [];
	const notes = notesData?.getNotes ?? [];
	const myStoreExists = myStoreData?.getMyStore;
	const myStoreId = myStoreData?.getMyStore?.id;

	const tabs = isSuperAdmin ? SUPER_ADMIN_TABS : buildAdminTabs(myStoreExists);

	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") ?? tabs[0].key;
	const setActiveTab = (key) => setSearchParams({ tab: key });

	const copyMyStoreLink = () => {
		const link = myStoreExists?.customDomain
			? `https://${myStoreExists?.customDomain}`
			: `https://${myStoreExists.slug}.parfumscr.com`;

		navigator.clipboard
			.writeText(link)
			.then(() =>
				toast
					.success("Enlace copiado")
					.catch((err) => toast.error("Error al copiar el texto", err.message)),
			);
	};

	const renderContent = () => {
		switch (activeTab) {
			case "pos":
				return myStoreId ? <POSView storeId={myStoreId} /> : null;

			case "catalog":
				return myStoreId ? <StoreCatalog storeId={myStoreId} /> : null;

			case "products":
				return <ProductsSection myStoreId={myStoreId} />;

			case "expenses":
				return myStoreId ? <ExpensesView storeId={myStoreId} /> : null;

			case "dashboard":
				return myStoreId ? (
					<DashboardView embedded storeId={myStoreId} />
				) : null;

			case "orders":
				return <OrdersSection />;

			case "store":
				return (
					<div className="flex flex-col gap-10">
						{myStoreExists && (
							<div className="flex gap-2">
								<Button
									variant="secondary"
									onClick={() =>
										(window.location.href = myStoreExists?.customDomain
											? `https://${myStoreExists?.customDomain}`
											: `https://${myStoreExists.slug}.parfumscr.com`)
									}
								>
									Ver Tienda
								</Button>
								<Button variant="outline" onClick={copyMyStoreLink}>
									Copiar Enlace
								</Button>
							</div>
						)}
						<StoreForm />
					</div>
				);

			case "brands":
				return (
					<EntitySection
						title="Marcas"
						items={brands}
						loading={loadingBrands}
						createMutation={CREATE_BRAND}
						updateMutation={UPDATE_BRAND}
						deleteMutation={DELETE_BRAND}
						refetchQuery={GET_BRANDS}
						label="Marca"
						placeholder="Ej: Dior"
					/>
				);

			case "categories":
				return (
					<EntitySection
						title="Categorías"
						items={categories}
						loading={loadingCategories}
						createMutation={CREATE_CATEGORY}
						updateMutation={UPDATE_CATEGORY}
						deleteMutation={DELETE_CATEGORY}
						refetchQuery={GET_CATEGORIES}
						label="Categoría"
						placeholder="Ej: Hombre"
					/>
				);

			case "segments":
				return (
					<EntitySection
						title="Segmentos"
						items={segments}
						loading={loadingSegments}
						createMutation={CREATE_SEGMENT}
						updateMutation={UPDATE_SEGMENT}
						deleteMutation={DELETE_SEGMENT}
						refetchQuery={GET_SEGMENTS}
						label="Segmento"
						placeholder="Ej: Lujo"
					/>
				);

			case "notes":
				return (
					<EntitySection
						title="Acordes olfativos"
						items={notes}
						loading={loadingNotes}
						createMutation={CREATE_NOTE}
						updateMutation={UPDATE_NOTE}
						deleteMutation={DELETE_NOTE}
						refetchQuery={GET_NOTES}
						label="Nota"
						placeholder="Ej: Vainilla"
					/>
				);

			case "users":
				return isSuperAdmin ? <UsersSection /> : null;

			default:
				return null;
		}
	};

	return (
		<div
			className="min-h-screen px-4 py-8 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-7xl mx-auto flex flex-col gap-8">
				{/* ── Page header ── */}
				<div
					className="flex flex-col gap-1"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<h1 className="text-2xl font-bold text-first">
						Panel de administración
					</h1>
					<p className="text-sm text-first/40">
						{isSuperAdmin
							? "Super Admin — acceso total al sistema"
							: "Admin — gestión de catálogo"}
					</p>
				</div>

				{/* ── Tabs ── */}
				<div
					className="flex items-center gap-1 p-1 rounded-2xl border border-first/10 bg-main overflow-x-auto max-w-full scrollbar-none"
					style={{ animation: "fadeUp 0.4s ease both", animationDelay: "60ms" }}
				>
					{tabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={[
								"flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
								activeTab === tab.key
									? "bg-second text-main shadow-sm"
									: "text-first/40 hover:text-first/70 hover:bg-first/5",
							].join(" ")}
						>
							<span className="text-[14px]">{tab.icon}</span>
							{tab.label}
						</button>
					))}
				</div>

				{/* ── Tab content ── */}
				<div key={activeTab} style={{ animation: "fadeUp 0.3s ease both" }}>
					{renderContent()}
				</div>
			</div>
		</div>
	);
};

export default AdminView;
