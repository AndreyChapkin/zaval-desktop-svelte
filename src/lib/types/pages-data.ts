import type { TodoDto, TodoHierachyDto as TodoHierarchyDto, TodoStatus } from './todo';

export interface TodoDetailedPageData {
	todoHierachyDto: TodoHierarchyDto;
	todoHistoryRecords: string[] | null;
	isRoot: boolean;
}

export interface TodoBranchDto {
	parents: TodoDto[];
	leaves: TodoDto[];
}

export interface TodosWithStatusPageData {
	branches: TodoBranchDto[];
	status: TodoStatus;
}
