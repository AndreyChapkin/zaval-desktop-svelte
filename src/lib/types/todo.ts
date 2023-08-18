export interface TodoHierachyDto {
    id: number;
    name: string;
    priority: number;
    status: TodoStatus;
    parents: TodoHierachyDto[] | null;
    children: TodoHierachyDto[] | null;
}

export interface TodoDto {
    id: number;
    name: string;
    priority: number;
    status: TodoStatus;
    parentId: number | null;
}

export interface TodoHistoryDto {
    todoId: number;
    records: string[];
}

export interface CreateTodoDto {
    name: string;
    status: TodoStatus;
    parentId: number | null;
}

export interface UpdateTodoData {
    id: number;
    updatedTodoDto: UpdateTodoDto;
}

export interface UpdateTodoDto {
    name: string;
    priority: number;
    status: TodoStatus;
}

export interface MoveTodoDto {
    todoId: number;
    parentId: number | null;
}

export interface SaveHistoryDto {
    todoId: number;
    records: string[];
}

export type TodoStatus = "DONE" | "BACKLOG" | "WILL_BE_BACK" | "PING_ME" | "NEXT_TO_TAKE" | "IN_PROGRESS";

export const All_TODO_STATUSES: TodoStatus[] = ["DONE", "BACKLOG", "WILL_BE_BACK", "PING_ME", "NEXT_TO_TAKE", "IN_PROGRESS"];

export const ROOT_TODO_HIERARCHY: TodoHierachyDto = {
    id: -1000,
    name: "root",
    priority: 0,
    status: "BACKLOG",
    parents: null,
    children: null,
};

export const STAB_TODO_HIERARCHY: TodoHierachyDto = {
    id: -100,
    name: '',
    priority: 0,
    status: "BACKLOG",
    children: null,
    parents: null,
};