import { getArticleContent, getArticleLabels, getArticleLight } from '$lib/api/article-calls';
import type { ArticlePageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load({
	params
}: {
	params: any;
}): Promise<ArticlePageData> {
	const articleId: number = params.id;
	const [articleLight, articleContent, articleLabels] = await Promise.all([
		getArticleLight(articleId),
		getArticleContent(articleId),
		getArticleLabels(articleId)
	]);
	return {
		articleLight,
		articleContent,
		articleLabels
	};
}
