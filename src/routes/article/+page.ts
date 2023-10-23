import { getAllArticleLights, getTheMostPopularLabelsCombinations, getTheMostRecentArticleLights } from '$lib/api/article-calls';
import type { MultipleArticlesPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load(): Promise<MultipleArticlesPageData> {
	const [articleLights, topLabelsCombinations] = await Promise.all([getTheMostRecentArticleLights(), getTheMostPopularLabelsCombinations()]);
	return {
		articleLights,
		topLabelsCombinations,
	}
}
