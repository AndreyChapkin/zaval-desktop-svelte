interface ArticleLightDto {
    id: number;
    title: string;
    contentTitles: ContentTitleDto[];
    popularity: number;
}

interface ContentTitleDto {
    level: number;
    title: string;
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