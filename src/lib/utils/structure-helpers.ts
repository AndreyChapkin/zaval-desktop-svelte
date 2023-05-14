import type { Todo, TodoHierachy } from "$lib/types/todo";

export function allHierarchyBranchIds(arr: Todo[], rootId: number): number[] {
    const resultHierarchyBranchIds: number[] = [];
    const parentIdToChildrenMap = constructParentIdToChildrenMap(arr);
    const lookingForQueue: number[] = [rootId];
    // collect all hierarchy branch ids
    while (lookingForQueue.length > 0) {
        const curParentId = lookingForQueue.shift() as number;
        resultHierarchyBranchIds.push(curParentId);
        const curChildrenIds = parentIdToChildrenMap[curParentId]?.map(i => i.id);
        if (curChildrenIds) {
            for (let curChildId of curChildrenIds) {
                lookingForQueue.push(curChildId);
            }
        }
    }
    return resultHierarchyBranchIds;
}

export function constructParentIdToChildrenMap(arr: Todo[]): Record<number, Todo[]> {
    const resultMap = {} as Record<number, Todo[]>;
    // and root elements - without parents
    for (let todo of arr) {
        if (todo.parent != null) {
            if (!resultMap[todo.parent]) {
                resultMap[todo.parent] = [];
            }
            resultMap[todo.parent].push(todo);
        }
    }
    return resultMap;
}

export function constructHierarchy(arr: Todo[]): TodoHierachy[] {
    // collect "parent id -> childs" pairs
    const buckets = {} as Record<number, Todo[]>;
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