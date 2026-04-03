/**
 * Convierte una URL de Cloudinary en una URL optimizada
 * con transformaciones aplicadas.
 *
 * @param {string} url - URL original de Cloudinary
 * @param {"card"|"detail"|"thumb"} size - Tamaño deseado
 * @returns {string} URL transformada
 */
export const getOptimizedUrl = (url, size = "card") => {
	if (!url || !url.includes("cloudinary.com")) return url;

	const transformations = {
		thumb: "w_100,h_100,c_fill,q_auto:low,f_auto",
		card: "w_400,q_auto:good,f_auto",
		detail: "w_1200,q_auto:best,f_auto",
	};

	return url.replace("/upload/", `/upload/${transformations[size]}/`);
};
