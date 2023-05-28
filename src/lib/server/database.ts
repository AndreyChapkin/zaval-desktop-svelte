import { TodoStatus, type Todo, type TodoInfo } from '../types/todo';

export const db: { todos: Todo[], todosInfo: TodoInfo[] } = {
	todos: [
		{
            id: 1,
            name: "Todo A",
            status: TodoStatus.IN_PROGRESS,
            parentId: null,
        },
        {
            id: 2,
            name: "Todo B",
            status: TodoStatus.ON_HOLD,
            parentId: null,
        },
        {
            id: 3,
            name: "Todo A-A",
            status: TodoStatus.ON_HOLD,
            parentId: 1,
        },
        {
            id: 4,
            name: "Todo A-B",
            status: TodoStatus.NEED_ATTENTION,
            parentId: 1,
        },
        {
            id: 5,
            name: "Todo A-A-A",
            status: TodoStatus.ON_HOLD,
            parentId: 3,
        },
        {
            id: 6,
            name: "Todo A-A-B",
            status: TodoStatus.NEED_ATTENTION,
            parentId: 3,
        },
        {
            id: 7,
            name: "Todo A-A-C",
            status: TodoStatus.NEED_ATTENTION,
            parentId: 3,
        }
	],
    todosInfo: [
        {
            id: 1,
            info: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            todoId: 1,
        }
    ],
};
