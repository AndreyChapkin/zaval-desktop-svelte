import { ROOT_TODO_HIERARCHY, type DeprTodo, type DeprTodoHierachy, type Todo, type TodoHierachyDto } from "$lib/types/todo";

export function allHierarchyBranchIds(arr: DeprTodo[], rootId: number): number[] {
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
    for (let todo of arr) {
        const curParentId = todo.parentId === null ? ROOT_TODO_HIERARCHY.id : todo.parentId;
        if (!resultMap[curParentId]) {
            resultMap[curParentId] = [todo];
        } else {
            resultMap[curParentId].push(todo);
        }
    }
    return resultMap;
}

// return  parent <- parent <- todo -> children
export function constructShallowHierarchyBranch(arr: Todo[], id: number | null): TodoHierachyDto | null {
    // collect "parent id -> childs" pairs
    const buckets = constructParentIdToChildrenMap(arr);
    // and root elements - without parents
    let result: TodoHierachyDto | null = null;
    if (id !== null) {
        const requestedTodo = arr.find(i => i.id === id);
        if (requestedTodo) {
            result = {
                ...requestedTodo,
                children: null,
                parent: null,
                isComplex: !!buckets[requestedTodo.id],
            };
            // initialize parent chain
            let curChild = result;
            let curParent = requestedTodo.parentId === null ? null : arr.find(i => i.id === requestedTodo.parentId);
            while (curParent) {
                curChild.parent = {
                    ...curParent,
                    children: null,
                    parent: null,
                    isComplex: true,
                };
                curChild = curChild.parent;
                curParent = curParent.parentId === null ? null : arr.find(i => i.id === curParent!!.parentId);
            }
            curChild.parent = {
                ...ROOT_TODO_HIERARCHY
            };
            // initialize children
            result.children = buckets[result.id] ? buckets[result.id].map(i => ({
                ...i,
                parent: null,
                children: null,
                isComplex: !!buckets[i.id],
            })) : null;
        }
    } else {
        result = {...ROOT_TODO_HIERARCHY};
        // initialize children
        result.children = buckets[ROOT_TODO_HIERARCHY.id] ? buckets[ROOT_TODO_HIERARCHY.id].map(i => ({
            ...i,
            parent: null,
            children: null,
            isComplex: !!buckets[i.id],
        })) : null;
    }
    return result;
}

// return  parent <- parent <- todo -> children
export function childrenOf(arr: Todo[], id: number | null): TodoHierachyDto[] | null {
    // collect "parent id -> childs" pairs
    const buckets = constructParentIdToChildrenMap(arr);
    let result: TodoHierachyDto[] | null = null;
    if (id !== null) {
        result = buckets[id].map(i => ({
            ...i,
            parent: null,
            children: null,
            isComplex: !!buckets[i.id],
        })) ?? null;
    }
    return result;
}

export function constructHierarchy(arr: DeprTodo[]): DeprTodoHierachy[] {
    // collect "parent id -> childs" pairs
    const buckets = {} as Record<number, DeprTodo[]>;
    // and root elements - without parents
    const roots: DeprTodoHierachy[] = [];
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
    const parentsQueue: DeprTodoHierachy[] = [...roots];
    while (parentsQueue.length > 0) {
        const curParent = parentsQueue.shift() as DeprTodoHierachy;
        const curChilds = buckets[curParent.id];
        if (curChilds) {
            for (const child of curChilds) {
                const childHierarchy: DeprTodoHierachy = {
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