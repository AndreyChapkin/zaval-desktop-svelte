import { db } from '$lib/server/database.js';
import { TodoStatus } from '$lib/types/todo.js';
import { json } from '@sveltejs/kit';

// Create new Todo item
export async function GET({ request }) {
	const activeTodos = db.todos.filter(i => i.status === TodoStatus.IN_PROGRESS);
	// const
	return json({ status: 200, data: activeTodos });
}
