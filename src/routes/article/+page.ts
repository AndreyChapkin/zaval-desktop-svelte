import { getAllArticleLights } from '$lib/api/article-calls';
import type { MultipleArticlesPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load(): Promise<MultipleArticlesPageData> {
	const articleLightDtos = await getAllArticleLights();
	return {
		articleLights: articleLightDtos,
	}
}
