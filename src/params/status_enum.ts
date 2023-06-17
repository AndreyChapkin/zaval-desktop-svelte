import { All_TODO_STATUSES, todoStatusFromUrlForm, type TodoStatus } from "$lib/types/todo";

export function match(value: string): boolean {
    const correctedValue = todoStatusFromUrlForm(value);
	return All_TODO_STATUSES.indexOf(correctedValue as TodoStatus) > -1;
}