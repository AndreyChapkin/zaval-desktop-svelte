import type { Todo } from "$lib/types/todo";

// @ts-ignore
export function load({ data, depends }): { todos: Todo[] } {
	depends('all-todos');

	return {
		todos: data.todos
	};
}
