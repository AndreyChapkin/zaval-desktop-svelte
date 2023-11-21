import { getTheMostPopularLabelsCombinations, getTheMostRecentArticleLights, getTheMostRecentArticleSeries } from '$lib/api/article-calls';
import type { MultipleArticlesPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load(): Promise<MultipleArticlesPageData> {
	const [articleLights, articleSeries, topLabelsCombinations] = await Promise.all([
		getTheMostRecentArticleLights(),
		getTheMostRecentArticleSeries(),
		getTheMostPopularLabelsCombinations()
	]);
	return {
		articleLights,
		articleSeries,
		topLabelsCombinations,
	}
}
