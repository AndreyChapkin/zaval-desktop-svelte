import { TodoStatus, type Todo } from '../types/todo';

export const db: { todos: Todo[] } = {
	todos: [
		{
            id: 1,
            name: "First",
            info: "First info",
            status: TodoStatus.IN_PROGRESS,
            parent: null,
        },
        {
            id: 2,
            name: "Second",
            info: "Second info",
            status: TodoStatus.ON_HOLD,
            parent: 1,
        },
        {
            id: 3,
            name: "Third",
            info: "Third info",
            status: TodoStatus.ON_HOLD,
            parent: 2,
        },
        {
            id: 4,
            name: "Forth",
            info: "Forth info",
            status: TodoStatus.NEED_ATTENTION,
            parent: null,
        }
	]
};
