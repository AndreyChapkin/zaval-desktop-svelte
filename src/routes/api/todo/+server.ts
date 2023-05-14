import type { UpdateTodoAction } from './../../../lib/types/todo';
import { TODO_ITEM_PARAM } from './../../../lib/api/param/todo-params';
import { TODO_PRESENTATION_PARAM } from '$lib/api/param/todo-params';
import { allHierarchyBranchIds, constructHierarchy } from '$lib/utils/structure-helpers';
import { extractUrlParams } from '$lib/utils/url-helpers';
import { json } from '@sveltejs/kit';
import { db } from '../../../lib/server/database';
import { TodoStatus, TODO_PRESENTATIONS, type Todo, type TodoHierachy } from '../../../lib/types/todo';

// Create new Todo item
export async function GET({ request }) {
	const params = extractUrlParams(request.url);
	const presentationParam = params[TODO_PRESENTATION_PARAM].toUpperCase();
	const presentation = TODO_PRESENTATIONS.find((i) => i === presentationParam);
	let result: Todo[] | TodoHierachy[] | Todo | undefined;
	switch (presentation) {
		case 'ALL':
			result = db.todos;
			break;
		case 'HIERARCHY':
			result = constructHierarchy(db.todos);
			break;
		case 'ITEM':
			const itemId = Number(params[TODO_ITEM_PARAM]);
			result = db.todos.find((i) => i.id === itemId);
			break;
		default:
			result = [];
	}
	// const
	return json({ status: 200, data: result });
}

// Create Todo item
export async function POST({ request }) {
	const newTodo = (await request.json()) as Todo;
	newTodo.id = db.todos.length + 1;
	db.todos.push(newTodo);

	return json({ status: 201, todo: newTodo });
}

// Update Todo item
export async function PATCH({ request }) {
	const updateTodoAction = (await request.json()) as UpdateTodoAction;
	const payloadTodo = updateTodoAction.todo;
	const storedTodo = db.todos.find((i) => i.id === payloadTodo.id);
	if (storedTodo) {
		switch (updateTodoAction.type) {
			case "info":
				storedTodo.info = payloadTodo.info;
				break;
			case "general":
				const editedTodo = payloadTodo as Todo;
				storedTodo.name = editedTodo.name;
				storedTodo.status = editedTodo.status;
				// if active, move all parent tasks to active too
				if (storedTodo.status === TodoStatus.IN_PROGRESS) {
					let parent = db.todos.find((i) => i.id === storedTodo.parent);
					while (parent) {
						parent.status = TodoStatus.IN_PROGRESS;
						parent = db.todos.find((i) => i.id === parent!.parent);
					}
				}
				break;
		}
	}
	return json({ status: 200, data: storedTodo });
}

// Remove Todo item
export async function DELETE({ request }) {
	const deletedTodo = (await request.json()) as Todo;
	// delete todo and this all-level children
	const deleteIds: number[] = allHierarchyBranchIds(db.todos, deletedTodo.id);
	// preserve only those items which are not in the deleteIds
	db.todos = db.todos.filter((i) => deleteIds.indexOf(i.id) < 0);
	return json({ status: 200 });
}
