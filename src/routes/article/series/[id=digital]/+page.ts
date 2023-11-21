import { getArticleLightsById, getArticleSeries } from '$lib/api/article-calls';
import type { ArticleSeriesPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load({
	params
}: {
	params: any;
}): Promise<ArticleSeriesPageData> {
	const articleSeriesId: number = params.id;
	const articleSeries = await getArticleSeries(articleSeriesId);
	const articleLights = await getArticleLightsById(articleSeries.articleIds);
	return {
		articleSeries,
		articleLights
	};
}
