import { constructHierarchy, constructShallowHierarchyBranch } from '$lib/utils/structure-helpers';
import { db } from '$lib/server/database';
import { STAB_TODO_HIERARCHY, type DeprTodoHierachy, type TodoHierachy } from '$lib/types/todo';

export function load({ params }: {params: any}): { todo: TodoHierachy } {
	const todoId: number | null = params.id;
	return {
		todo: constructShallowHierarchyBranch(db.todos, params.id ? parseInt(params.id) : null) ?? STAB_TODO_HIERARCHY,
	};
}
