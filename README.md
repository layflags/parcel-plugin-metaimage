# parcel-plugin-metaimage

> Set absolute URL for all og:image and twitter:image meta tags.

*This plugin is based on [Luke Childs](https://github.com/lukechilds/parcel-plugin-ogimage), [nothingrandom](https://github.com/nothingrandom/parcel-plugin-ogimage) and [Eliepse](https://github.com/Eliepse/parcel-plugin-metaimage) code.*

Sets absolute URLs for all `og:image` and `twitter:image` meta tags. This is required by the spec and relative URLs will not work on some sites such as Facebook or Twitter.

You can fix this directly in parcel by using `--public-url https://example.com`, however now all your URLs are hardcoded to absolute URLs which may be undesirable and can break things like prerendering.

This plugin uses the value of the `og:url` (or non-standard `origin`) meta tag to convert `og:image` to an absolute URL.

## Install

```shell
npm install @layflags/parcel-plugin-metaimage
```

## Usage

Just install this package as a development dependency. Parcel will automatically call it when building your application.

You **must** have both `og:image` and `og:url` (or `origin`) meta tags:

```html
<meta name="twitter:image" content="card.png">
<meta property="og:image" content="card.png">
<meta property="og:url" content="https://example.com">
```

Parcel will generate that into something like this:

```html
<meta name="twitter:image" content="/card.9190ce93.png">
<meta property="og:image" content="/card.9190ce93.png">
<meta property="og:url" content="https://example.com">
```

`@layflags/parcel-plugin-metaimage` will then update the `og:image` and `twitter:image` with an absolute URL:

```html
<meta name="twitter:image" content="https://example.com/card.9190ce93.png">
<meta property="og:image" content="https://example.com/card.9190ce93.png">
<meta property="og:url" content="https://example.com">
```

## License

MIT @ layflags

From [Luke Childs](https://github.com/lukechilds/parcel-plugin-ogimage) and [nothingrandom](https://github.com/nothingrandom/parcel-plugin-ogimage) and [Eliepse](https://github.com/Eliepse/parcel-plugin-metaimage) code
