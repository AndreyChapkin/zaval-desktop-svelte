import type { TodoDto, TodoHierachyDto, TodoStatus } from '$lib/types/todo';
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
			searchedTodo.parents = [{ ...todo, children: null, parents: null }];
			childTodo = searchedTodo;
		} else {
			// look into parents
			let searchedTodo: TodoHierachyDto | null = null;
			// let curParent = todo.parent;
			// while (curParent && searchedTodo == null) {
			// 	if (curParent.id === id) {
			// 		searchedTodo = { ...curParent, children: null };
			// 	}
			// 	curParent = curParent.parent;
			// }
			let i = 0;
			while (searchedTodo == null && todo.parents && i < todo.parents.length) {
				let curParent = todo.parents[i];
				if (curParent.id === id) {
					searchedTodo = { ...curParent, children: null };
				}
				i++;
			}
			childTodo = searchedTodo;
		}
	}
	return childTodo ? directParent(childTodo) : null;
}

export function returnParentId(todo: TodoHierachyDto | TodoDto): number | null {
	const todoDto = todo as TodoDto;
	if (Number.isInteger(new Number(todoDto.parentId))) {
		return todoDto.parentId;
	}
	const todoHierarchyDto = todo as TodoHierachyDto;
	if (todoHierarchyDto.parents && todoHierarchyDto.parents.length > 0) {
		return todoHierarchyDto.parents[todoHierarchyDto.parents.length - 1].id;
	}
	return null;
}

export function directParent(todo: TodoHierachyDto): TodoHierachyDto | null {
	if (todo.parents && todo.parents.length > 0) {
		return todo.parents[todo.parents.length - 1];
	}
	return null;
}
