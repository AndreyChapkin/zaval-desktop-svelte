import { getAllTodoUpBranches } from '$lib/api/todo-calls';
import type { TodosWithStatusPageData } from '$lib/types/pages-data';
import type { TodoStatus } from '$lib/types/todo';
import { todoStatusFromUrlForm } from '$lib/utils/todo-helpers';

export const ssr = false;

// TODO parallel requests
export async function load({ params }: { params: any }): Promise<TodosWithStatusPageData> {
	const status: TodoStatus = todoStatusFromUrlForm(params.status);
	const todoHierarchyDtos = (await getAllTodoUpBranches(status)) ?? [];
	return {
		todoHierarchyDtos,
		status
	};
}
