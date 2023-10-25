import { RICH_TYPES_TO_RICH_CLASSES_MAP, defineRichTypeComplexity, type RichTypes, RICH_LIST_ITEM_SIGN_CLASS, RICH_LIST_ITEM_CONTENT_CLASS } from "$lib/types/rich-text";

export function createListItem(text: string | null): HTMLElement {
    const listItemWrapper = document.createElement('div');
    const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP['list-item'];
    listItemWrapper.classList.add(richClass);

    const signElement = document.createElement('div');
    signElement.classList.add(RICH_LIST_ITEM_SIGN_CLASS);

    const contentElement = document.createElement('li');
    if (text) {
        contentElement.textContent = text;
    }
    contentElement.classList.add(RICH_LIST_ITEM_CONTENT_CLASS);

    listItemWrapper.append(signElement, contentElement);
    return listItemWrapper;
}

export function extractRichElementChildren(element: HTMLElement, richType: RichTypes): ChildNode[] {
    const resultChildren = [] as ChildNode[];
    const richTypeComplexity = defineRichTypeComplexity(richType);
    if (richTypeComplexity === 'simple') {
        for (let childNode of element.childNodes) {
            resultChildren.push(childNode);
        }
    } else if (richTypeComplexity === 'complex') {
        switch (richType) {
            case 'list':
                insertListChildren(element, resultChildren);
                break;
            case 'list-item':
                insertListItemChildren(element, resultChildren);
                break;
        }
    }
    return resultChildren;
}

function insertListChildren(element: HTMLElement, childrenArray: ChildNode[]) {
    for (let childNode of element.childNodes) {
        childrenArray.push(childNode);
    }
}

function insertListItemChildren(element: HTMLElement, childrenArray: ChildNode[]) {
    const contentElement = element.querySelector(`.${RICH_LIST_ITEM_CONTENT_CLASS}`);
    if (contentElement) {
        for (let childNode of contentElement.childNodes) {
            childrenArray.push(childNode);
        }
    }    
}