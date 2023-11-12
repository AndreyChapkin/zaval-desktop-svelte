import { getRootTodos, getTheMostDatedLightTodos } from '$lib/api/todo-calls';
import type { TodoRootPageData } from '$lib/types/pages-data';

export const ssr = false;

// TODO parallel requests
export async function load(): Promise<TodoRootPageData | null> {
	const [rootTodos, recentTodos, oldTodos] = await Promise.all([
		getRootTodos(),
		getTheMostDatedLightTodos(10, 'recent'),
		getTheMostDatedLightTodos(10, 'old'),
	]);
	return {
		rootLightTodos: rootTodos,
		recentLightTodos: recentTodos,
		oldLightTodos: oldTodos,
	};
}
