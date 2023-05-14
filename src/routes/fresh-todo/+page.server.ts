import { constructHierarchy } from '$lib/utils/structure-helpers';
import type { TodoHierachy } from './../../lib/types/todo';
import { db } from '$lib/server/database';

export function load(): { todos: TodoHierachy[] } {
	return {
		todos: constructHierarchy(db.todos)
	};
}
