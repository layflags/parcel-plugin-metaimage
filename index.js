const fs = require('fs');
const path = require('path');
const url = require('url');
const ora = require('ora');
const chalk = require('chalk');
const prettyMs = require('pretty-ms');
const glob = require('glob');

const getMetaTagContent = metaTagHtml => {
	const regex = /content=["]([^"]*)["]/i;
	const regexExec = regex.exec(metaTagHtml);
	if (regexExec) {
		return regexExec[1];
	}
	return false;
};

const getOpengraphTag = (html, property) => {
	const regex = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i');
	const regexExec = regex.exec(html);
	if (regexExec) {
		return regexExec[0];
	}
	return false;
};

const getTwitterCardTag = (html, name) => {
	const regex = new RegExp(`<meta[^>]*name=["|']${name}["|'][^>]*>`, 'i');
	const regexExec = regex.exec(html);
	if (regexExec) {
		return regexExec[0];
	}
	return false;
};

module.exports = bundler => {
	bundler.on('buildEnd', async () => {
		if (process.env.NODE_ENV !== 'production') {
			return;
		}
		console.log('');
		const spinner = ora(chalk.grey('Fixing image meta link')).start();
		const start = Date.now();

		glob.sync(`${bundler.options.outDir}/**/*.html`).forEach(file => {
			const htmlPath = path.resolve(file);
			let html = fs.readFileSync(htmlPath).toString();
			const ogUrlTag = getOpengraphTag(html, 'og:url');

			if (ogUrlTag) {
				const ogImageTag = getOpengraphTag(html, 'og:image');
				if (ogImageTag) {
					const metaImageContent = getMetaTagContent(ogImageTag);
					const absoluteOgImageUrl = url.resolve(getMetaTagContent(ogUrlTag), metaImageContent);
					const ogImageTagAbsoluteUrl = ogImageTag.replace(metaImageContent, absoluteOgImageUrl);
					html = html.replace(ogImageTag, ogImageTagAbsoluteUrl);
				}

				const twitterImageTag = getTwitterCardTag(html, 'twitter:image');
				if (twitterImageTag) {
					const metaImageContent = getMetaTagContent(twitterImageTag);
					const absoluteTwitterImageUrl = url.resolve(getMetaTagContent(ogUrlTag), metaImageContent);
					const twitterImageTagAbsoluteUrl = twitterImageTag.replace(metaImageContent, absoluteTwitterImageUrl);
					html = html.replace(twitterImageTag, twitterImageTagAbsoluteUrl);
				}
				fs.writeFileSync(htmlPath, html);
			}
		});

		const end = Date.now();
		spinner.stopAndPersist({
			symbol: '✨ ',
			text: chalk.green(`Fixed og:image and twitter:image links in ${prettyMs(end - start)}.`)
		});
	});
};
