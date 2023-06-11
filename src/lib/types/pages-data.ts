import type { TodoHierachyDto } from "./todo";

export interface TodoDetailedPageData {
	todoHierachyDto: TodoHierachyDto;
	todoHistoryRecords: string[] | null;
	isRoot: boolean;
}
