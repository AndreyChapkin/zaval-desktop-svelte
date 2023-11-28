import type { DetailedTodoDto, LightTodoDto, TodoStatus } from './todo';

export interface TodoDetailedPageData {
	detailedTodoDto: DetailedTodoDto;
	todoHistoryRecords: string[];
}

export interface TodoRootPageData {
	rootLightTodos: LightTodoDto[];
	recentLightTodos: LightTodoDto[];
	oldLightTodos: LightTodoDto[];
}

export interface TodoAndParentBranchIdDto {
    todo: LightTodoDto;
    parentBranchId: number | null;
}

export interface TodosListDto {
    todos: TodoAndParentBranchIdDto[];
    parentBranchesMap: Record<number, LightTodoDto[]>;
}

export interface TodosWithStatusPageData {
	todosList: TodosListDto;
	status: TodoStatus;
}

export interface MultipleArticlesPageData {
	articleLights: ArticleLightDto[];
	articleSeries: ArticleSeriesDto[];
	topLabelsCombinations: FilledLabelsCombinationDto[];
}

export interface ArticlePageData {
	articleLight: ArticleLightDto;
	articleContent: ArticleContentDto;
	articleLabels: ArticleLabelDto[];
}

export interface ArticleSeriesPageData {
	articleSeries: ArticleSeriesDto;
	articleSeriesContent: (ArticleLightDto | ArticleSeriesDto)[];
}
