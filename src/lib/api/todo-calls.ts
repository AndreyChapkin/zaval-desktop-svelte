import type { TodoBranchDto, TodosListDto } from "$lib/types/pages-data";
import type { TodoHierachyDto, CreateTodoDto, TodoDto, UpdateTodoDto, MoveTodoDto, TodoHistoryDto, TodoStatus } from "$lib/types/todo";
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

export async function getAllTodoUpBranches(status: TodoStatus): Promise<TodoHierachyDto[]> {
    const url = `${baseTodoURL}/up-branch`;
	const result = await callGet<TodoHierachyDto[]>(url, {
        status
    });
    return result.data;
}

export async function getAllTodoWithStatusBranches(status: TodoStatus): Promise<TodoBranchDto[]> {
    const url = `${baseTodoURL}/status-branches`;
	const result = await callGet<TodoBranchDto[]>(url, {
        status
    });
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

export async function findTodosWithNameFragment(nameFragment: string): Promise<TodoDto[]> {
    const url = `${baseTodoURL}/with-name-fragment`;
    const response = await callGet<TodoDto[]>(url, {
        "name-fragment": nameFragment
    });
	return response.data;
}