export interface DeprTodoHierachy {
    id: number;
    name: string;
    status: TodoStatus;
    childs: DeprTodoHierachy[];
}

export interface TodoHierachy {
    id: number;
    name: string;
    status: TodoStatus;
    parent: TodoHierachy | null;
    isComplex: boolean;
    children: TodoHierachy[] | null;
}

export interface Todo {
    id: number;
    name: string;
    status: TodoStatus;
    parentId: number | null;
}

export interface TodoInfo {
    id: number;
    info: string;
    todoId: number;
}

export interface DeprTodo {
    id: number;
    name: string;
    info: string;
    status: TodoStatus;
    parent: number | null;
}

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
    todo: Todo;
}

export interface CustomSvelteEvent<T> {
    detail: T
}

export const STAB_TODO: DeprTodo = {
    id: -100,
    name: 'nothing',
    info: '-',
    status: TodoStatus.ON_HOLD,
    parent: null
};

export const ROOT_TODO_HIERARCHY: TodoHierachy = {
    id: -1000,
    name: "root",
    status: TodoStatus.IN_PROGRESS,
    parent: null,
    children: null,
    isComplex: true,
};

export const STAB_TODO_HIERARCHY: TodoHierachy = {
    id: -100,
    name: 'nothing',
    status: TodoStatus.ON_HOLD,
    children: null,
    parent: null,
    isComplex: false,
};

export const TODO_PRESENTATIONS = ["ALL", "HIERARCHY", "ITEM"] as const;
export type TodoPresentationsType = typeof TODO_PRESENTATIONS[number];