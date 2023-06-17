import { todoStatusFromUrlForm } from '$lib/types/todo';
import { getAllTodoUpBranches, getTodoHierarchy, getTodoHistory } from '$lib/api/todo-calls';
import type { TodoDetailedPageData, TodosWithStatusPageData } from '$lib/types/pages-data';
import type { TodoStatus } from '$lib/types/todo';

export const ssr = false;

// TODO parallel requests
export async function load({ params }: { params: any }): Promise<TodosWithStatusPageData> {
	const status: TodoStatus = todoStatusFromUrlForm(params.status);
	const todoHierarchyDtos = (await getAllTodoUpBranches(status)) ?? [];
	return {
		todoHierarchyDtos
	};
}
