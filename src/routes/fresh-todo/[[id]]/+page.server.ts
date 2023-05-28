import { db } from '$lib/server/database';
import type { TodoHierachy } from '$lib/types/todo';
import { constructShallowHierarchyBranch } from '$lib/utils/structure-helpers';
import { redirect } from '@sveltejs/kit';

export function load({ params }: {params: any}): { todo: TodoHierachy } {
	const todoId: number | null = params.id;
	const result = constructShallowHierarchyBranch(db.todos, params.id ? parseInt(params.id) : null);
	if (result) {
		return {
			todo: result,
		};
	} else {
		throw redirect(307, '/fresh-todo')
	}
}
