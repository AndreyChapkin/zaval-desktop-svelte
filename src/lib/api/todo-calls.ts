import type { TodosListDto } from "$lib/types/pages-data";
import type { CreateTodoDto, DetailedTodoDto, LightTodoDto, MoveTodoDto, TodoHistoryDto, TodoStatus, UpdateTodoDto } from "$lib/types/todo";
import { callDelete, callGet, callPatch, callPost } from "$lib/utils/call-helpers";
import { baseURL } from "./base";

const baseTodoURL = baseURL + "/todo";

export async function createTodo(createTodoDto: CreateTodoDto): Promise<LightTodoDto> {
    const url = baseTodoURL;
	const result = await callPost<LightTodoDto>(url, createTodoDto);
    return result.data;
}

export async function getTodo(todoId: number): Promise<LightTodoDto> {
    const url = `${baseTodoURL}/${todoId}`;
	const result = await callGet<LightTodoDto>(url);
    return result.data;
}

export async function updateTodo(todoId: number, updateTodoDto: UpdateTodoDto): Promise<LightTodoDto> {
    const url = `${baseTodoURL}/${todoId}`;
	const result = await callPatch<LightTodoDto>(url, updateTodoDto);
    return result.data;
}

export async function deleteTodo(todoId: number): Promise<void> {
    const url = `${baseTodoURL}/${todoId}`;
	await callDelete<void>(url);
}

export async function getDetailedTodo(todoId: number | null): Promise<DetailedTodoDto> {
    const url = `${baseTodoURL}/detailed/${todoId === null ? '' : todoId}`;
	const result = await callGet<DetailedTodoDto>(url);
    return result.data;
}

export async function getAllTodos(): Promise<LightTodoDto[]> {
    const url = baseTodoURL;
	const result = await callGet<LightTodoDto[]>(url);
    return result.data;
}

export async function getPrioritizedListOfTodosWithStatus(status: TodoStatus): Promise<TodosListDto> {
    const url = `${baseTodoURL}/prioritized-list`;
	const result = await callGet<TodosListDto>(url, {
        status
    });
    return result.data;
}

export async function moveTodo(moveTodoDto: MoveTodoDto): Promise<void> {
    const url = `${baseTodoURL}/move`;
	await callPatch<void>(url, moveTodoDto);
}

export async function getTodoHistory(todoId: number): Promise<TodoHistoryDto> {
    const url = `${baseTodoURL}/${todoId}/history`;
    const response = await callGet<TodoHistoryDto>(url);
	return response.data;
}

export async function updateTodoHistory(todoId: number, todoHistoryDto: TodoHistoryDto): Promise<TodoHistoryDto> {
    const url = `${baseTodoURL}/${todoId}/history`;
    const response = await callPatch<TodoHistoryDto>(url, todoHistoryDto);
	return response.data;
}

export async function findTodosWithNameFragment(nameFragment: string): Promise<LightTodoDto[]> {
    const url = `${baseTodoURL}/with-name-fragment`;
    const response = await callGet<LightTodoDto[]>(url, {
        "name-fragment": nameFragment
    });
	return response.data;
}