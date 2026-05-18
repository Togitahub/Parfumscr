import Product from "../../models/Product.js";
import Brand from "../../models/Brand.js";
import Category from "../../models/Category.js";
import Segment from "../../models/Segment.js";
import Store from "../../models/Store.js";
import StoreProduct from "../../models/StoreProduct.js";

import { deleteImage, extractPublicId } from "../../config/cloudinary.js";

const productResolvers = {
	Query: {
		getProducts: async (
			_,
			{
				isDecant,
				page = 1,
				pageSize = 9,
				brandId,
				categoryId,
				segmentId,
				noteIds = [],
				minPrice,
				maxPrice,
				inStock,
				search,
			},
		) => {
			const filter = {};

			// Filtro básico de tipo (perfume/decant)
			if (isDecant !== undefined) filter.isDecant = isDecant;

			// Filtro por marca
			if (brandId) filter.brand = brandId;

			// Filtro por categoría
			if (categoryId) filter.category = categoryId;

			// Filtro por segmento
			if (segmentId) filter.segment = segmentId;

			// Filtro por acordes olfativos (todos los seleccionados)
			if (noteIds.length > 0) {
				filter.notes = { $all: noteIds };
			}

			// Búsqueda por texto
			if (search && search.trim()) {
				const searchRegex = new RegExp(search.trim(), "i");
				filter.$or = [{ name: searchRegex }, { description: searchRegex }];
			}

			// Filtro por precio (usando el precio base del producto)
			if (minPrice !== undefined || maxPrice !== undefined) {
				filter.price = {};
				if (minPrice !== undefined) filter.price.$gte = minPrice;
				if (maxPrice !== undefined) filter.price.$lte = maxPrice;
			}

			// Filtro por stock (inStock: true = stock > 0)
			if (inStock === true) {
				filter.stock = { $gt: 0 };
			} else if (inStock === false) {
				filter.stock = 0;
			}

			const skip = (page - 1) * pageSize;
			const total = await Product.countDocuments(filter);
			const items = await Product.find(filter)
				.populate("brand category segment linkedProduct notes")
				.skip(skip)
				.limit(pageSize);

			return {
				items,
				total,
				totalPages: Math.ceil(total / pageSize),
				currentPage: page,
			};
		},

		getProduct: async (_, { id }) =>
			await Product.findById(id).populate([
				"brand",
				"category",
				"segment",
				"notes",
				{ path: "linkedProduct", populate: { path: "brand" } },
			]),
	},

	// Field resolver: dado un perfume padre, devuelve sus decants asociados
	Product: {
		decants: async (parent) => {
			if (parent.isDecant) return [];
			return await Product.find({
				linkedProduct: parent._id,
				isDecant: true,
			}).populate("brand category segment notes");
		},
	},

	Mutation: {
		createProduct: async (_, args, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");

			const { decants: decantsInput = [], ...productArgs } = args;

			// Resolver o crear la marca
			let brandDoc = await Brand.findOne({ name: productArgs.brand });
			if (!brandDoc) brandDoc = await Brand.create({ name: productArgs.brand });

			// Validar categoría y segmento
			const categoryExists = await Category.findById(productArgs.category);
			const segmentExists = await Segment.findById(productArgs.segment);
			if (!categoryExists) throw new Error("Category not found");
			if (!segmentExists) throw new Error("Segment not found");

			if (productArgs.size && !/ml$/i.test(productArgs.size.trim())) {
				productArgs.size = productArgs.size.trim() + "ml";
			}

			// Agregar después de las validaciones de categoryExists y segmentExists:
			const duplicate = await Product.findOne({
				name: { $regex: new RegExp(`^${productArgs.name.trim()}$`, "i") },
				brand: brandDoc._id,
				size: productArgs.size ?? null,
				isDecant: productArgs.isDecant === true,
			});

			if (duplicate)
				throw new Error(
					`Ya existe un ${productArgs.isDecant ? "decant" : "perfume"} con ese nombre, marca y tamaño`,
				);

			// Crear el perfume padre (o decant si se pasa isDecant: true)
			const newProduct = await Product.create({
				...productArgs,
				brand: brandDoc._id,
				isDecant: productArgs.isDecant === true,
			});

			// Crear los decants si se pasaron
			if (decantsInput.length > 0) {
				const decantDocs = decantsInput.map((d) => ({
					name: newProduct.name, // mismo nombre que el padre
					brand: brandDoc._id, // hereda marca
					category: newProduct.category, // hereda categoría
					segment: newProduct.segment, // hereda segmento
					images: newProduct.images, // hereda imágenes
					description: newProduct.description,
					price: d.price,
					stock: d.stock ?? 0,
					size:
						d.size && !/ml$/i.test(d.size.trim())
							? d.size.trim() + "ml"
							: d.size,
					isDecant: true,
					linkedProduct: newProduct._id,
					notes: newProduct.notes,
				}));

				await Product.insertMany(decantDocs);
			}

			// Si el usuario es ADMIN y tiene tienda, agregar el producto a su catálogo
			if (context.user.role === "ADMIN") {
				const store = await Store.findOne({ owner: context.user._id });
				if (store) {
					await StoreProduct.create({
						store: store._id,
						product: newProduct._id,
						active: true,
					});
				}
			}

			// Devolver el perfume padre con sus decants ya populados
			return await Product.findById(newProduct._id).populate(
				"brand category segment notes",
			);
		},

		updateProduct: async (_, { id, ...args }, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");

			if (context.user.role === "ADMIN") {
				const allowedFields = ["name", "brand", "images"];
				Object.keys(args).forEach((key) => {
					if (!allowedFields.includes(key)) delete args[key];
				});
			}

			if (args.linkedProduct) {
				const parent = await Product.findById(args.linkedProduct);
				if (!parent) throw new Error("Linked product not found");
				if (parent.isDecant)
					throw new Error("A decant cannot be linked to another decant");
			}

			if (args.brand) {
				let brandDoc = await Brand.findOne({ name: args.brand });
				if (!brandDoc) brandDoc = await Brand.create({ name: args.brand });
				args.brand = brandDoc._id;
			}

			// Si se actualiza la imagen, eliminar la anterior y propagar a decants
			if (args.images) {
				const current = await Product.findById(id);

				// Eliminar imagen anterior de Cloudinary
				if (current.images?.[0]) {
					const publicId = extractPublicId(current.images[0]);
					if (publicId) await deleteImage(publicId);
				}

				// Propagar nueva imagen a los decants vinculados
				await Product.updateMany(
					{ linkedProduct: id, isDecant: true },
					{ images: args.images },
				);
			}

			return await Product.findByIdAndUpdate(id, args, { new: true }).populate(
				"brand category segment linkedProduct notes",
			);
		},

		deleteProduct: async (_, { id }, context) => {
			if (!context.user || !["SUPER_ADMIN"].includes(context.user.role))
				throw new Error("Not authorized");

			const product = await Product.findById(id);
			if (!product) throw new Error("Product not found");

			if (product.isDecant) {
				const siblingsCount = await Product.countDocuments({
					linkedProduct: product.linkedProduct,
					isDecant: true,
					_id: { $ne: id },
				});

				if (siblingsCount === 0) {
					const publicId = extractPublicId(product.images?.[0]);
					if (publicId) await deleteImage(publicId);
				}
			} else {
				const decantsCount = await Product.countDocuments({
					linkedProduct: id,
					isDecant: true,
				});

				if (decantsCount === 0) {
					const publicId = extractPublicId(product.images?.[0]);
					if (publicId) await deleteImage(publicId);
				}
			}

			await Product.updateMany(
				{ linkedProduct: id },
				{ $unset: { linkedProduct: "" } },
			);

			await Product.findByIdAndDelete(id);
			return { success: true, message: "Product deleted" };
		},
	},
};

export default productResolvers;
