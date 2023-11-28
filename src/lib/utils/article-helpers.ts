function defineAsArticleSeries(content: ArticleSeriesDto | ArticleLightDto): ArticleSeriesDto | null {
    return (content as any).articleIds
        ? (content as ArticleSeriesDto)
        : null;
}

function defineAsArticleLight(content: ArticleSeriesDto | ArticleLightDto): ArticleLightDto | null {
    const articleSeries = defineAsArticleSeries(content);
    if (articleSeries) {
        return null;
    }
    return content as ArticleLightDto;
}

export interface ArticleDesc {
    type: 'article',
    content: ArticleLightDto
};

export interface SeriesDesc {
    type: 'series',
    content: ArticleSeriesDto
};

export function describeArticleSeriesContent(contents: (ArticleSeriesDto | ArticleLightDto)[]): (ArticleDesc | SeriesDesc)[] {
    return contents.map(c => {
        if (defineAsArticleSeries(c)) {
            return {
                type: 'series',
                content: c as ArticleSeriesDto,
            };
        }
        return {
            type: 'article',
            content: c as ArticleLightDto,
        };
    });
}

export function compareWithDates(a: ArticleLightDto | ArticleSeriesDto, b: ArticleLightDto | ArticleSeriesDto): number {
    let result = 0;
    if (new Date(a.interactedOn) < new Date(b.interactedOn)) {
        result = 1;
    } else {
        result = -1;
    }
    return result;
}