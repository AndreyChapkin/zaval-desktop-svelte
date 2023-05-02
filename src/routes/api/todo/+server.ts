import { TODO_ITEM_PARAM } from './../../../lib/api/param/todo-params';
import { TODO_PRESENTATION_PARAM } from '$lib/api/param/todo-params';
import { constructHierarchy } from '$lib/utils/structure-helpers';
import { extractUrlParams } from '$lib/utils/url-helpers';
import { json } from '@sveltejs/kit';
import { db } from '../../../lib/server/database';
import { TODO_PRESENTATIONS, type Todo, type TodoHierachy } from '../../../lib/types/todo';

// Create new Todo item
export async function GET({ request }) {
	const params = extractUrlParams(request.url);
	const presentationParam = params[TODO_PRESENTATION_PARAM].toUpperCase();
	const presentation = TODO_PRESENTATIONS.find((i) => i === presentationParam);
	let result: Todo[] | TodoHierachy[] | Todo | undefined;
	switch (presentation) {
		case "ALL":
			result = db.todos;
			break;
		case "HIERARCHY":
			result = constructHierarchy(db.todos);
			break;
		case "ITEM":
			const itemId = Number(params[TODO_ITEM_PARAM]);
			result = db.todos.find(i => i.id === itemId);
			break;
		default:
			result = [];
	}
	// const
	return json({ status: 200, data: result });
}

// Create Todo item
export async function POST({ request }) {
	const todo = (await request.json()) as Todo;
	db.todos.push(todo);

	return json({ status: 201, todo });
}

// Update Todo item
export async function PATCH({ request }) {
	const todo = (await request.json()) as Todo;
	const patchedTodo = db.todos.find((i) => i.id === todo.id);
	if (patchedTodo) {
		patchedTodo.name = todo.name;
		patchedTodo.info = todo.info;
	}
	return json({ status: 200, data: patchedTodo });
}

// Remove Todo item
export async function DELETE({ request }) {
	const deletedTodo = (await request.json()) as Todo;
	db.todos = db.todos.filter((i) => i.name !== deletedTodo.name);
	return json({ status: 200 });
}
