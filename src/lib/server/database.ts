import { TodoStatus, type Todo } from '../types/todo';

export const db: { todos: Todo[] } = {
	todos: [
		{
            id: 1,
            name: "Todo A",
            info: "First info",
            status: TodoStatus.IN_PROGRESS,
            parent: null,
        },
        {
            id: 2,
            name: "Todo B",
            info: "Second info",
            status: TodoStatus.ON_HOLD,
            parent: null,
        },
        {
            id: 3,
            name: "Todo A-A",
            info: "Third info",
            status: TodoStatus.ON_HOLD,
            parent: 1,
        },
        {
            id: 4,
            name: "Todo A-B",
            info: "Forth info",
            status: TodoStatus.NEED_ATTENTION,
            parent: 1,
        },
        {
            id: 5,
            name: "Todo A-A-A",
            info: "Third info",
            status: TodoStatus.ON_HOLD,
            parent: 3,
        },
        {
            id: 6,
            name: "Todo A-A-B",
            info: "Forth info",
            status: TodoStatus.NEED_ATTENTION,
            parent: 3,
        },
        {
            id: 7,
            name: "Todo A-A-C",
            info: "Forth info",
            status: TodoStatus.NEED_ATTENTION,
            parent: 3,
        }
	]
};
