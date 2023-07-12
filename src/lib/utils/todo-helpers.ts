import type { TodoHierachyDto, TodoStatus } from '$lib/types/todo';
import {
	BACKLOG_MENU_ICON_URL,
	DONE_MENU_ICON_URL,
	IN_PROGRESS_MENU_ICON_URL,
	NEXT_TO_TAKE_MENU_ICON_URL,
	PING_ME_MENU_ICON_URL,
	TODO_STATUS_IN_PROGRESS_ICON_URL,
	TODO_STATUS_NEED_ATTENTION_ICON_URL,
	TODO_STATUS_ON_HOLD_ICON_URL,
	WILL_BE_BACK_MENU_ICON_URL
} from './assets-references';

// helpers
export function statusImageUrl(status: TodoStatus): string {
	switch (status) {
		case 'IN_PROGRESS':
			return TODO_STATUS_IN_PROGRESS_ICON_URL;
		case 'BACKLOG':
			return TODO_STATUS_NEED_ATTENTION_ICON_URL;
		default:
			return TODO_STATUS_ON_HOLD_ICON_URL;
	}
}

export function todoStatusFromUrlForm(value: string): TodoStatus {
	return value.replaceAll('-', '_').toUpperCase() as TodoStatus;
}

export function todoStatusToUrlForm(status: TodoStatus): TodoStatus {
	return status.replaceAll('_', '-').toLowerCase() as TodoStatus;
}

export function todoStatusToLabel(status: TodoStatus): string {
	return status.replaceAll('_', ' ');
}

export function chooseStatusImgUrl(status: TodoStatus): string {
	switch (status) {
		case 'DONE':
			return DONE_MENU_ICON_URL;
		case 'BACKLOG':
			return BACKLOG_MENU_ICON_URL;
		case 'WILL_BE_BACK':
			return WILL_BE_BACK_MENU_ICON_URL;
		case 'PING_ME':
			return PING_ME_MENU_ICON_URL;
		case 'NEXT_TO_TAKE':
			return NEXT_TO_TAKE_MENU_ICON_URL;
		case 'IN_PROGRESS':
			return IN_PROGRESS_MENU_ICON_URL;
	}
}

export function chooseStatusClass(status: TodoStatus): string {
	switch (status) {
		case 'DONE':
			return 'done-status';
		case 'BACKLOG':
			return 'backlog-status';
		case 'WILL_BE_BACK':
			return 'will-be-back-status';
		case 'PING_ME':
			return 'ping-me-status';
		case 'NEXT_TO_TAKE':
			return 'next-to-take-status';
		case 'IN_PROGRESS':
			return 'in-progress-status';
	}
}

export function returnAllParents(todo: TodoHierachyDto): TodoHierachyDto[] {
	const result = [];
	let curParent = todo.parent;
	while (curParent) {
		result.push(curParent);
		curParent = curParent.parent;
	}
	return result;
}

export function returnMockParents(): TodoHierachyDto[] {
	const result = [];
	for (let i = 0; i < 100; i++) {
		result.push({
			id: i,
			name: i + "",
			status: "BACKLOG",
			parent: null,
			children: null,
		} as TodoHierachyDto);
	}
	return result;
}

export function returnHierarchyTopPart(todo: TodoHierachyDto): TodoHierachyDto[] {
	const result = [todo];
	let curParent = todo.parent;
	while (curParent) {
		result.push(curParent);
		curParent = curParent.parent;
	}
	return result;
}

/*
 * Without super parents and children
 */
export function findParentOfInHeirarchy(id: number, todo: TodoHierachyDto): TodoHierachyDto | null {
	let childTodo: TodoHierachyDto | null = null;
	if (todo.id === id) {
		// look on the todo
		childTodo = todo;
	} else {
		// look into children
		const searchedTodo = todo.children?.find((it) => it.id === id) ?? null;
		if (searchedTodo) {
			searchedTodo.parent = { ...todo, children: null, parent: null };
			childTodo = searchedTodo;
		} else {
			// look into parents
			let searchedTodo: TodoHierachyDto | null = null;
			let curParent = todo.parent;
			while (curParent && searchedTodo == null) {
				if (curParent.id === id) {
					searchedTodo = { ...curParent, children: null };
				}
				curParent = curParent.parent;
			}
			childTodo = searchedTodo;
		}
	}
	return childTodo?.parent ?? null;
}
