import { All_TODO_STATUSES, type TodoStatus } from "$lib/types/todo";
import { todoStatusFromUrlForm } from "$lib/utils/todo-helpers";

export function match(value: string): boolean {
    const correctedValue = todoStatusFromUrlForm(value);
	return All_TODO_STATUSES.indexOf(correctedValue as TodoStatus) > -1;
}