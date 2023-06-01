import { getTodoHierarchy } from '$lib/api/todo-calls';
import type { TodoHierachyDto } from '$lib/types/todo';

export async function load({ params }: { params: any }): Promise<{ todoHierachyDto: TodoHierachyDto } | null> {
	const todoId: number | undefined = params.id;
	const result = await getTodoHierarchy(todoId ?? null);
	if (result) {
		return {
			todoHierachyDto: result
		};
	} else {
		return null;
	}
}
