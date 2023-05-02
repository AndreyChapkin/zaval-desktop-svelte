export function extractUrlParams(url: string): Record<string, string> {
	// new URL object
	const current_url = new URL(url);
	// get access to URLSearchParams object
	const search_params = current_url.searchParams;
    const result: Record<string, string> = {};
    search_params.forEach((value, key) => result[key] = value);
	return result;
}
