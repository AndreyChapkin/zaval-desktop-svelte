export interface TodoHierachy {
    id: number;
    name: string;
    status: TodoStatus;
    childs: TodoHierachy[];
}

export interface Todo {
    id: number;
    name: string;
    info: string;
    status: TodoStatus;
    parent: number | null;
}

export type TodoInfo = Pick<Todo, "id" | "info">

export enum TodoStatus {
    NEED_ATTENTION,
    ON_HOLD,
    IN_PROGRESS
}

export enum TodoPageMode {
    ALL_TASKS,
    IN_PROGRESS_TASKS,
}

export interface UpdateTodoAction {
    type: "general" | "info";
    todo: Todo | TodoInfo;
}

export interface CustomSvelteEvent<T> {
    detail: T
}

export const STAB_TODO: Todo = {
    id: -100,
    name: 'nothing',
    info: '-',
    status: TodoStatus.ON_HOLD,
    parent: null
};

export const STAB_TODO_HIERARCHY: TodoHierachy = {
    id: -100,
    name: 'nothing',
    status: TodoStatus.ON_HOLD,
    childs: [],
};

export const TODO_PRESENTATIONS = ["ALL", "HIERARCHY", "ITEM"] as const;
export type TodoPresentationsType = typeof TODO_PRESENTATIONS[number];