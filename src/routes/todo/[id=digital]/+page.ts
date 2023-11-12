import { getDetailedTodo, getTodoHistory } from '$lib/api/todo-calls';
import type { TodoDetailedPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load({
	params
}: {
	params: any;
}): Promise<TodoDetailedPageData | null> {
	const todoId: number = params.id;
	const [detailedTodoDto, todoHistoryDto] = await Promise.all([
		getDetailedTodo(todoId),
		getTodoHistory(todoId),
	]);
	if (detailedTodoDto) {
		return {
			detailedTodoDto: detailedTodoDto,
			todoHistoryRecords: todoHistoryDto.records,
		};
	} else {
		return null;
	}
}
