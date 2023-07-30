import type { TodoHierachyDto as TodoHierarchyDto, TodoStatus } from "./todo";

export interface TodoDetailedPageData {
	todoHierachyDto: TodoHierarchyDto;
	todoHistoryRecords: string[] | null;
	isRoot: boolean;
}

export interface TodosWithStatusPageData {
	todoHierarchyDtos: TodoHierarchyDto[];
	status: TodoStatus;
}
