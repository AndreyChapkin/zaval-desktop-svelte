export interface ModifyAttributesAction {
    type: 'modify',
    name: 'attributes',
    element: HTMLElement,
    data: Record<string, string | number>,
}

export interface ModifyListAction {
    type: 'modify',
    name: 'extendList',
    data?: string,
}

export type ModifyAction = ModifyAttributesAction | ModifyListAction;