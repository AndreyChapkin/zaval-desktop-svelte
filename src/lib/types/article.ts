interface ArticleLightDto {
    id: number;
    title: string;
    contentTitles: ContentTitleDto[];
    popularity: number;
}

interface ArticleLightWithLabelsDto {
    articleLight: ArticleLightDto,
    labels: ArticleLabelDto[],
}

interface ContentTitleDto {
    level: number;
    title: string;
    id: string;
}

interface ArticleContentDto {
    id: number;
    content: string;
}

interface UpdateArticleDto {
    title?: string;
    popularity?: number;
    content?: string;
}

interface ArticleLabelDto {
    id: number,
    name: string,
}

interface UpdateArticleLabelDto {
    name?: string,
}

interface LabelsCombinationDto {
    id: number,
    labelIds: number[],
    popularity: number,
}