import type { TodoHierachyDto as TodoHierarchyDto } from "./todo";

export interface TodoDetailedPageData {
	todoHierachyDto: TodoHierarchyDto;
	todoHistoryRecords: string[] | null;
	isRoot: boolean;
}

export interface TodosWithStatusPageData {
	todoHierarchyDtos: TodoHierarchyDto[];
}
