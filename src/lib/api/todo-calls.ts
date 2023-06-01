import type { TodoHierachyDto, CreateTodoDto, TodoDto, UpdateTodoDto, MoveTodoDto } from "$lib/types/todo";
import { callDelete } from "$lib/utils/call-helpers";
import { callGet, callPatch, callPost } from "$lib/utils/call-helpers";
import { baseURL } from "./base";

const baseTodoURL = baseURL + "/todo";

export async function createTodo(createTodoDto: CreateTodoDto): Promise<TodoDto> {
    const url = baseTodoURL;
	const result = await callPost<TodoDto>(url, createTodoDto);
    return result.data;
}

export async function getTodo(todoId: number): Promise<TodoDto> {
    const url = `${baseTodoURL}/${todoId}`;
	const result = await callGet<TodoDto>(url);
    return result.data;
}

export async function updateTodo(todoId: number, updateTodoDto: UpdateTodoDto): Promise<TodoDto> {
    const url = `${baseTodoURL}/${todoId}`;
	const result = await callPatch<TodoDto>(url, updateTodoDto);
    return result.data;
}

export async function deleteTodo(todoId: number): Promise<void> {
    const url = `${baseTodoURL}/${todoId}`;
	await callDelete<void>(url);
}

export async function getTodoHierarchy(todoId: number | null): Promise<TodoHierachyDto> {
    const url = `${baseTodoURL}/hierarchy/${todoId === null ? '' : todoId}`;
	const result = await callGet<TodoHierachyDto>(url);
    return result.data;
}

export async function getAllTodos(): Promise<TodoDto[]> {
    const url = baseTodoURL;
	const result = await callGet<TodoDto[]>(url);
    return result.data;
}

export async function moveTodo(moveTodoDto: MoveTodoDto): Promise<void> {
    const url = `${baseTodoURL}/move`;
	await callPatch<void>(url, moveTodoDto);
}