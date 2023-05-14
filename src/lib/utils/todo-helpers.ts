import { TodoStatus } from "$lib/types/todo";
import { TODO_STATUS_IN_PROGRESS_ICON_URL, TODO_STATUS_NEED_ATTENTION_ICON_URL, TODO_STATUS_ON_HOLD_ICON_URL } from "./assets-references";

// helpers
export function statusImageUrl(status: TodoStatus): string {
    switch (status) {
        case TodoStatus.IN_PROGRESS:
            return TODO_STATUS_IN_PROGRESS_ICON_URL;
        case TodoStatus.NEED_ATTENTION:
            return TODO_STATUS_NEED_ATTENTION_ICON_URL;
        default:
            return TODO_STATUS_ON_HOLD_ICON_URL;
    }
}