export interface TodoHierachyDto {
    id: number;
    name: string;
    status: TodoStatus;
    parent: TodoHierachyDto | null;
    children: TodoHierachyDto[] | null;
}

export interface TodoDto {
    id: number;
    name: string;
    status: TodoStatus;
    parentId: number | null;
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
    status: TodoStatus;
}

export interface MoveTodoDto {
    todoId: number;
    parentId: number | null;
}

export interface Todo {
    id: number;
    name: string;
    status: TodoStatus;
    parentId: number | null;
}

export type TodoStatus = "DONE" | "BACKLOG" | "WILL_BE_BACK" | "PING_ME" | "IN_PROGRESS";
export const All_TODO_STATUSES: TodoStatus[] = ["DONE", "BACKLOG", "WILL_BE_BACK", "PING_ME", "IN_PROGRESS"];

export const ROOT_TODO_HIERARCHY: TodoHierachyDto = {
    id: -1000,
    name: "root",
    status: "BACKLOG",
    parent: null,
    children: null,
};

export const STAB_TODO_HIERARCHY: TodoHierachyDto = {
    id: -100,
    name: '',
    status: "BACKLOG",
    children: null,
    parent: null,
};