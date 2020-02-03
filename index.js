const fs = require('fs');
const path = require('path');
const url = require('url');
const glob = require('glob');

/*
 * Extract a meta from a given html string
 */
const findMeta = (html, propertyName, propertyValue) => {
	const regex = new RegExp(`<meta[^>]*${propertyName}=["|']${propertyValue}["|'][^>]*>`, 'i');
	const regexExec = regex.exec(html);
	if (regexExec) {
		return regexExec[0];
	}
	return false;
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
			const ogUrlTag = findMeta(html, 'property', 'og:url');

			// Abort if no Opengraph url meta detected
			if (!ogUrlTag) {
				return;
			}

			// Get the base url from Opengraph meta
			const ogUrl = getMetaTagContent(ogUrlTag);

			// Fetch original meta
			const opengraphImageMeta = findMeta(html, 'property', 'og:image');
			const twitterImageMeta = findMeta(html, 'name', 'twitter:image');

			// Process Opengraph meta
			if (opengraphImageMeta) {
				html = html.replace(
					opengraphImageMeta,
					patchMetaToAbsolute(opengraphImageMeta, ogUrl)
				);
			}

			// Process Twitter meta
			if (twitterImageMeta) {
				html = html.replace(
					twitterImageMeta,
					patchMetaToAbsolute(twitterImageMeta, ogUrl)
				);
			}

			// We write the modified html file at the end
			fs.writeFileSync(htmlPath, html);
		});

		console.info('Fixed Opengraph and Twitter images meta tag');
	});
};
