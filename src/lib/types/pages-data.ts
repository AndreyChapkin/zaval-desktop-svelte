import type { TodoDto, TodoHierachyDto as TodoHierarchyDto, TodoStatus } from './todo';

export interface TodoDetailedPageData {
	todoHierachyDto: TodoHierarchyDto;
	todoHistoryRecords: string[] | null;
	isRoot: boolean;
}

export interface TodoAndParentBranchIdDto {
    todo: TodoDto;
    parentBranchId: number | null;
}

export interface TodosListDto {
    todos: TodoAndParentBranchIdDto[];
    parentBranchesMap: Record<number, TodoDto[]>;
}

export interface TodosWithStatusPageData {
	todosList: TodosListDto;
	status: TodoStatus;
}
