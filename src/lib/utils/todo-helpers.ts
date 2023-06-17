import type { TodoHierachyDto, TodoStatus } from '$lib/types/todo';
import {
	TODO_STATUS_IN_PROGRESS_ICON_URL,
	TODO_STATUS_NEED_ATTENTION_ICON_URL,
	TODO_STATUS_ON_HOLD_ICON_URL
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
