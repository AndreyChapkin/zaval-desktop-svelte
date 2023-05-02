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

export enum TodoStatus {
    NEED_ATTENTION,
    ON_HOLD,
    IN_PROGRESS
}

export enum TodoPageMode {
    ALL_TASKS,
    IN_PROGRESS_TASKS,
}

export interface CustomEvent<T> {
    detail: T
}

export const TODO_PRESENTATIONS = ["ALL", "HIERARCHY", "ITEM"] as const;
export type TodoPresentationsType = typeof TODO_PRESENTATIONS[number];