import type { Todo, TodoHierachy } from "$lib/types/todo";

export function constructHierarchy(arr: Todo[]): TodoHierachy[] {
    const buckets = {} as Record<number, Todo[]>;
    // collect "parent id -> childs" pairs
    // and root elements - without parents
    const roots: TodoHierachy[] = [];
    for (let todo of arr) {
        if (todo.parent != null) {
            if (!buckets[todo.parent]) {
                buckets[todo.parent] = [];
            }
            buckets[todo.parent].push(todo);
        } else {
            roots.push({id: todo.id, name: todo.name, status: todo.status, childs: []});
        }
    }
    // build hierarchy
    const parentsQueue: TodoHierachy[] = [...roots];
    while (parentsQueue.length > 0) {
        const curParent = parentsQueue.shift() as TodoHierachy;
        const curChilds = buckets[curParent.id];
        if (curChilds) {
            for (const child of curChilds) {
                const childHierarchy: TodoHierachy = {
                    id: child.id,
                    name: child.name,
                    status: child.status,
                    childs: [],
                }
                curParent.childs.push(childHierarchy);
                // if childHierarchy has childs then add it to the queue
                if (buckets[childHierarchy.id]?.length > 0) {
                    parentsQueue.push(childHierarchy);
                }
            }
        }
    }
    return roots;
}