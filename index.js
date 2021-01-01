const fs = require('fs');
const path = require('path');
const url = require('url');
const glob = require('glob');

/*
 * Extract a meta from a given html string
 */
const findMetas = (html, propertyName, propertyValue) => {
	const regex = new RegExp(`<meta[^>]*${propertyName}=["|']${propertyValue}["|'][^>]*>`, 'ig');
	return html.match(regex) || [];
};

/*
 * Extract the content of a given meta html
 */
const getMetaTagContent = metaTagHtml => {
	const regex = /content=["]([^"]*)["]/i;
	const regexExec = regex.exec(metaTagHtml);
	if (regexExec) {
		return regexExec[1];
	}
	return false;
};

/*
 * Change the url of a meta by prepending the given baseUrl
 */
const patchMetaToAbsolute = (metaHTML, baseUrl) => {
	const metaContent = getMetaTagContent(metaHTML);
	return metaHTML.replace(
		metaContent,
		url.resolve(baseUrl, metaContent) // Relative url to absolute url
	);
};

module.exports = bundler => {
	bundler.on('buildEnd', async () => {
		glob.sync(`${bundler.options.outDir}/**/*.html`).forEach(file => {
			const htmlPath = path.resolve(file);
			let html = fs.readFileSync(htmlPath).toString();
			const ogUrlTag = findMetas(html, 'property', 'og:url')[0];
			const originTag = findMetas(html, 'property', 'origin')[0];

			// Abort if no Opengraph url and origin meta detected
			if (!ogUrlTag && !originTag) {
				return;
			}

			// Get the base url from Opengraph meta
			const ogUrl = getMetaTagContent(ogUrlTag || originTag);

			// Fetch original meta
			const opengraphImageMetas = findMetas(html, 'property', 'og:image');
			const twitterImageMetas = findMetas(html, 'name', 'twitter:image');

			// Process Opengraph meta
			opengraphImageMetas.forEach((meta) => {
				html = html.replace(
					meta,
					patchMetaToAbsolute(meta, ogUrl)
				);
			});

			// Process Twitter meta
			twitterImageMetas.forEach((meta) => {
				html = html.replace(
					meta,
					patchMetaToAbsolute(meta, ogUrl)
				);
			});

			// We write the modified html file at the end
			fs.writeFileSync(htmlPath, html);
		});

		console.info('Fixed Opengraph and Twitter images meta tag!');
	});
};
