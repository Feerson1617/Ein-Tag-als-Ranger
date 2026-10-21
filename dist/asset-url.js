// HTTP builds use ordinary relative URLs. Single-file builds decode optional media on demand.
export function assetUrl(url) {
 if (!url.startsWith('asset://')) return url;
 return globalThis.__feldbuchAssetUrl?.(url.slice(8)) || url;
}
