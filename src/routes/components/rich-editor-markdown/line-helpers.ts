import { findSelectedAnchorElementWithClass, findSelectedAnchorTextNode, findSelectedFocusElementWithClass, findSelectedFocusTextNode, findSelectedTextNode, selectTextInNode } from "$lib/utils/rich-editor/dom-helpers";

export function setCaretToPosition(position: number, lineContainer: HTMLElement) {
    if (lineContainer) {
        let passedPosition = 0;
        for (let node of lineContainer.childNodes) {
            const curTextPortion = node.textContent;
            if (curTextPortion) {
                if (position > curTextPortion.length) {
                    passedPosition = curTextPortion.length;
                } else {
                    const localPosition = position - passedPosition;
                    selectTextInNode(node, localPosition, localPosition);
                }
            }
        }
    }
};

export function getTextBeforeSelection(lineContainers: HTMLElement[]): string[] {
    const direction = getSelectionDirection();
    let firstSelectedLineContainer: HTMLElement | null = null;
    let textBeforeCaret = '';
    if (direction === 'forward') {
        const anchorLineContainer = findSelectedAnchorElementWithClass('rich-editor-line');
        if (anchorLineContainer) {
            firstSelectedLineContainer = anchorLineContainer;
            textBeforeCaret = getTextBeforeCaret(anchorLineContainer, 'anchor');
        }
    } else {
        const focusLineContainer = findSelectedFocusElementWithClass('rich-editor-line');
        if (focusLineContainer) {
            firstSelectedLineContainer = focusLineContainer;
            textBeforeCaret = getTextBeforeCaret(focusLineContainer, 'focus');
        }
    }
    const elementsBeforeSelection: HTMLElement[] = [];
    for (let i = 0; i < lineContainers.length; i++) {
        const elem = lineContainers[i];
        if (elem === firstSelectedLineContainer) {
            break;
        }
        elementsBeforeSelection.push(elem);
    }
    return [
        ...elementsBeforeSelection.map(i => i.textContent ?? ""),
        textBeforeCaret,
    ];
}

export function getTextAfterSelection(lineContainers: HTMLElement[]): string[] {
    const direction = getSelectionDirection();
    let lastSelectedLineContainer: HTMLElement | null = null;
    let textAfterCaret = '';
    if (direction === 'forward') {
        const focusLineContainer = findSelectedFocusElementWithClass('rich-editor-line');
        if (focusLineContainer) {
            lastSelectedLineContainer = focusLineContainer;
            textAfterCaret = getTextAfterCaret(focusLineContainer, 'focus');
        }
    } else {
        const anchorLineContainer = findSelectedAnchorElementWithClass('rich-editor-line');
        if (anchorLineContainer) {
            lastSelectedLineContainer = anchorLineContainer;
            textAfterCaret = getTextAfterCaret(anchorLineContainer, 'anchor');
        }
    }
    const elementsAfterSelection: HTMLElement[] = [];
    for (let i = lineContainers.length - 1; i >= 0; i--) {
        const elem = lineContainers[i];
        if (elem === lastSelectedLineContainer) {
            break;
        }
        elementsAfterSelection.push(elem);
    }
    return [
        textAfterCaret,
        ...elementsAfterSelection.toReversed().map(i => i.textContent ?? "")
    ];
}

export function getTextBeforeCaret(lineContainer: HTMLElement, type: 'anchor' | 'focus' = 'anchor'): string {
    const textNode = type === 'anchor' ? findSelectedAnchorTextNode() : findSelectedFocusTextNode();
    if (!textNode) {
        // it is empty line
        return '';
    }
    const selection = window.getSelection()!!;
    const range = selection?.getRangeAt(0)!!;
    const currentTextNodePosition = range.startOffset;
    const currentNodeText = textNode.textContent ?? '';
    const currentNodeTextPortion = currentNodeText.substring(0, currentTextNodePosition);
    const prevNodesText = getAllSiblingNodesBefore(textNode, lineContainer)
        .map((i) => i.textContent)
        .join('');
    return prevNodesText + currentNodeTextPortion;
}

export function getTextAfterCaret(lineContainer: HTMLElement, type: 'anchor' | 'focus' = 'anchor'): string {
    const textNode = type === 'anchor' ? findSelectedAnchorTextNode() : findSelectedFocusTextNode();
    if (!textNode) {
        // it is empty line
        return '';
    }
    const selection = window.getSelection()!!;
    const currentTextNodePosition = type === 'anchor' ? selection.anchorOffset : selection.focusOffset;
    const currentNodeText = textNode.textContent ?? '';
    const currentNodeTextPortion = currentNodeText.substring(currentTextNodePosition);
    const nextNodesText = getAllSiblingNodesAfter(textNode, lineContainer)
        .map((i) => i.textContent)
        .join('');
    return currentNodeTextPortion + nextNodesText;
}

export function findCurrentCaretPosition(lineContainer: HTMLElement): number {
    const textNode = findSelectedTextNode()!!;
    const selection = window.getSelection()!!;
    const range = selection?.getRangeAt(0)!!;
    const currentTextNodePosition = range.startOffset;
    const previousNodes = getAllSiblingNodesBefore(textNode, lineContainer);
    const previousText = previousNodes.map((i) => i.textContent).join('');
    return previousText.length + currentTextNodePosition;
}

export function getAllSiblingNodesBefore(node: Node, lineContainer: HTMLElement): Node[] {
    let result = [] as Node[];
    let anchorNode: Node;
    if (node.parentNode === lineContainer) {
        anchorNode = node;
    } else {
        anchorNode = node.parentNode!!;
    }
    let curNode = anchorNode.previousSibling;
    while (curNode) {
        result.push(curNode);
        curNode = curNode.previousSibling;
    }
    return result.toReversed();
}

export function getAllSiblingNodesAfter(node: Node, lineContainer: HTMLElement): Node[] {
    let result = [] as Node[];
    let anchorNode: Node;
    if (node.parentNode === lineContainer) {
        anchorNode = node;
    } else {
        anchorNode = node.parentNode!!;
    }
    let curNode = anchorNode.nextSibling;
    while (curNode) {
        result.push(curNode);
        curNode = curNode.nextSibling;
    }
    return result;
}

export function getSelectionDirection(): 'backward' | 'forward' | null {
    const selection = window.getSelection();
    if (selection) {
        const range = document.createRange();
        range.setStart(selection.anchorNode!!, selection.anchorOffset);
        range.setEnd(selection.focusNode!!, selection.focusOffset);
        return range.collapsed ? 'backward' : 'forward';
    }
    return null;
};

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}