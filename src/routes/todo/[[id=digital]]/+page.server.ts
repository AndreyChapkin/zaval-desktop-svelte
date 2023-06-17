import { getTodoHierarchy, getTodoHistory } from '$lib/api/todo-calls';
import type { TodoDetailedPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load({
	params
}: {
	params: any;
}): Promise<TodoDetailedPageData | null> {
	const todoId: number | undefined = params.id;
	const [todoHierarchyDto, todoHistoryDto] = await Promise.all([
		getTodoHierarchy(todoId ?? null),
		getTodoHistory(todoId ?? -1000),
	]);
	if (todoHierarchyDto) {
		return {
			todoHierachyDto: todoHierarchyDto,
			todoHistoryRecords: todoHistoryDto.records,
			// TODO move that logic to backend somehow
			isRoot: todoHierarchyDto.id < 0,
		};
	} else {
		return null;
	}
}
