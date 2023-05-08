import type { Todo, TodoInfo } from './../../../lib/types/todo';

export type SaveInfoEventPayload = {
	saveCallbackStarter: (saveCallback: (saveInfo: TodoInfo) => Promise<Todo>) => Promise<Todo>;
};

export type SaveInfoEventType = {
	save: SaveInfoEventPayload;
};
