import { RICH_LIST_ITEM_CONTENT_CLASS, RICH_LIST_ITEM_SIGN_CLASS, RICH_TYPES_TO_RICH_CLASSES_MAP } from "$lib/types/rich-text";
import { createNewSimpleRichElement } from "./rich-editor-helpers";

export function createList(content: (HTMLElement | string)[] | string | null): HTMLElement {
    const listWrapper = document.createElement('ul');
    const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP['list'];
    listWrapper.classList.add(richClass);
    if (content) {
        if (typeof content === 'string') {
            // string content
            listWrapper.append(createListItem(content));
        } else {
            // array content
            for (let contentElement of content) {
                if (typeof contentElement === 'string') {
                    listWrapper.append(createListItem(contentElement));
                } else {
                    listWrapper.append(contentElement);
                }
            }
        }
    }
    return listWrapper;
}

export function createListItem(content: (HTMLElement | string)[] | string | null): HTMLElement {
    const listItemWrapper = document.createElement('div');
    const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP['list-item'];
    listItemWrapper.classList.add(richClass);

    const signElement = document.createElement('div');
    signElement.classList.add(RICH_LIST_ITEM_SIGN_CLASS);

    const contentElement = document.createElement('li');
    contentElement.classList.add(RICH_LIST_ITEM_CONTENT_CLASS);

    if (typeof content === 'string') {
        const paragraphElement = createNewSimpleRichElement('paragraph', content ?? 'placeholder');
        contentElement.append(paragraphElement);
    } else if (content) {
        contentElement.append(...content);
    }

    listItemWrapper.append(signElement, contentElement);
    return listItemWrapper;
}

export function appendToListItem(listItemElement: HTMLElement, childElement: HTMLElement) {
    const contentElement = listItemElement.querySelector(`.${RICH_LIST_ITEM_CONTENT_CLASS}`);
    if (contentElement) {
        contentElement.append(childElement);
    }
}

export function insertListChildren(element: HTMLElement, childrenArray: ChildNode[]) {
    for (let childNode of element.childNodes) {
        childrenArray.push(childNode);
    }
}

export function insertListItemChildren(element: HTMLElement, childrenArray: ChildNode[]) {
    const contentElement = element.querySelector(`.${RICH_LIST_ITEM_CONTENT_CLASS}`);
    if (contentElement) {
        for (let childNode of contentElement.childNodes) {
            childrenArray.push(childNode);
        }
    }
}

export function createUnitedBlock(content: (string | HTMLElement)[] | string | null): HTMLElement {
    const unitedBlockWrapper = document.createElement('div');
    const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP['united-block'];
    unitedBlockWrapper.classList.add(richClass);

    if (typeof content === 'string') {
        // string content
        const paragraphElement = createNewSimpleRichElement('paragraph', content);
        unitedBlockWrapper.append(paragraphElement);
    } else if (content) {
        // array content
        unitedBlockWrapper.append(...content);
    } else {
        // null content
        const paragraphElement = createNewSimpleRichElement('paragraph', 'placeholder');
        unitedBlockWrapper.append(paragraphElement);
    }
    return unitedBlockWrapper;
}

export function insertUnitedBlockChildren(element: HTMLElement, childrenArray: ChildNode[]) {
    for (let childNode of element.childNodes) {
        childrenArray.push(childNode);
    }
}