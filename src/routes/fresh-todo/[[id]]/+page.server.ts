import { getTodoHierarchy, getTodoHistory } from '$lib/api/todo-calls';
import type { TodoHierachyDto } from '$lib/types/todo';

// TODO parallel requests
export async function load({
	params
}: {
	params: any;
}): Promise<{ todoHierachyDto: TodoHierachyDto; todoHistoryRecords: string[] | null } | null> {
	const todoId: number | undefined = params.id;
	const [todoHierarchyDto, todoHistoryDto] = await Promise.all([
		getTodoHierarchy(todoId ?? null),
		getTodoHistory(todoId ?? -1000),
	]);
	if (todoHierarchyDto) {
		return {
			todoHierachyDto: todoHierarchyDto,
			todoHistoryRecords: todoHistoryDto.records
		};
	} else {
		return null;
	}
}
