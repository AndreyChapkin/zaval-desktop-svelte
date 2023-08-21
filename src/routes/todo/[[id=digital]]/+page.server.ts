import { getDetailedTodo, getTodoHistory } from '$lib/api/todo-calls';
import type { TodoDetailedPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load({
	params
}: {
	params: any;
}): Promise<TodoDetailedPageData | null> {
	const todoId: number | undefined = params.id;
	const [detailedTodoDto, todoHistoryDto] = await Promise.all([
		getDetailedTodo(todoId ?? null),
		getTodoHistory(todoId ?? -1000),
	]);
	if (detailedTodoDto) {
		return {
			detailedTodoDto: detailedTodoDto,
			todoHistoryRecords: todoHistoryDto.records,
			// TODO move that logic to backend somehow
			isRoot: detailedTodoDto.id < 0,
		};
	} else {
		return null;
	}
}
