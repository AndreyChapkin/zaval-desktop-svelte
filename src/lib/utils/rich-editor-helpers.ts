import {
	RICH_TYPES_TO_RICH_CLASSES_MAP,
	RICH_TYPES_TO_TAGS_MAP,
	TAGS_TO_RICH_TYPES_MAP,
	type DescriptionFragment,
	type EditorModes,
	type NewPositionType,
	type RichTypes,
	RICH_TYPES,
	RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP,
	RICH_ATTRIBUTES,
	type RichClasses,
	RICH_CLASSES
} from '$lib/types/rich-text';

export function getRichTagClass(richType: RichTypes): string | undefined {
	return RICH_TYPES_TO_RICH_CLASSES_MAP[richType];
}

export function getRichTag(richType: RichTypes): string {
	return RICH_TYPES_TO_TAGS_MAP[richType];
}

function asCorrectRichType(tag: string): RichTypes | null {
	const type = TAGS_TO_RICH_TYPES_MAP[tag];
	if (type) {
		return type;
	}
	return null;
}

export function serializeDescription(descriptionElement: HTMLElement): string {
	const fragments: DescriptionFragment[] = [];
	const nodesToProcess: [HTMLElement, DescriptionFragment][] = [];
	for (let childNode of descriptionElement.childNodes) {
		if (childNode instanceof HTMLElement) {
			const childFragment = serializeElement(childNode, null, nodesToProcess);
			if (childFragment) {
				fragments.push(childFragment);
			}
		}
	}
	while (nodesToProcess.length > 0) {
		const [element, fragment] = nodesToProcess.pop() as [HTMLElement, DescriptionFragment];
		serializeElement(element, fragment, nodesToProcess);
	}
	const noEmptyFragments = removeEmptyFragments(fragments);
	return JSON.stringify(noEmptyFragments);
}

function removeEmptyFragments(fragments: DescriptionFragment[]): DescriptionFragment[] {
	const result = fragments.filter((f) => f.children.length > 0);
	const fragmentsToProcess: DescriptionFragment[] = [...result];
	while (fragmentsToProcess.length > 0) {
		const curFragment = fragmentsToProcess.pop()!!;
		// Preserve all text nodes and fragment nodes with children. Plan to check fragment nodes too.
		curFragment.children = curFragment.children.filter((c) => {
			if (typeof c === 'string') {
				return true;
			}
			if (c.children.length > 0) {
				fragmentsToProcess.push(c);
				return true;
			}
			return false;
		});
	}
	return result;
}

export function parseDescription(description: string): DescriptionFragment[] {
	if (description) {
		const fragments: DescriptionFragment[] = JSON.parse(description);
		return fragments;
	}
	return [];
}

function serializeElement(
	element: HTMLElement,
	fragment: DescriptionFragment | null,
	nodesToProcess: [HTMLElement, DescriptionFragment][]
): DescriptionFragment | null {
	const richType = asCorrectRichType(element.tagName.toLowerCase());
	if (richType) {
		const parentFragment: DescriptionFragment = fragment
			? fragment
			: {
					richType,
					children: []
			  };
		for (let childNode of element.childNodes) {
			if (childNode instanceof HTMLElement) {
				const htmlChildNode = childNode as HTMLElement;
				const childType = asCorrectRichType(htmlChildNode.tagName.toLowerCase());
				if (childType) {
					const childBlankFragment: DescriptionFragment = {
						richType: childType,
						children: []
					};
					// serialize attributes if any
					const allowedAttributes = RICH_ATTRIBUTES[childType];
					if (allowedAttributes) {
						const attributes: Record<string, string> = {};
						for (let attr of allowedAttributes) {
							const realAttributeValue = htmlChildNode.getAttribute(attr);
							if (realAttributeValue) {
								attributes[attr] = realAttributeValue;
							}
						}
						// if any attribute
						if (Object.keys(attributes).length > 0) {
							childBlankFragment.attributes = attributes;
						}
					}
					parentFragment.children.push(childBlankFragment);
					nodesToProcess.push([htmlChildNode, childBlankFragment]);
				}
			} else if (childNode instanceof Text) {
				const text = (childNode as Text).textContent;
				if (text) {
					const prevChild =
						parentFragment.children.length > 0
							? parentFragment.children[parentFragment.children.length - 1]
							: null;
					if (typeof prevChild === 'string') {
						// Merge sibling text nodes
						const mergedString = prevChild + text;
						parentFragment.children[parentFragment.children.length - 1] = mergedString;
					} else {
						// Or just add new child
						parentFragment.children.push(text);
					}
				}
			}
		}
		return parentFragment;
	}
	return null;
}

export function moveElement(element: HTMLElement, position: NewPositionType) {
	switch (position) {
		case 'before':
			let previousElement = element.previousElementSibling;
			previousElement?.before(element);
			break;
		case 'after':
			let nextElement = element.nextElementSibling;
			nextElement?.after(element);
			break;
	}
}

export function addNewElementInsteadOfPlaceholder(
	newElementType: RichTypes,
	placeholderElement: HTMLElement,
	editorMode: EditorModes,
	attributes: Record<string, string> | null = null
) {
	let allowedElements: RichTypes[] = [];
	if (editorMode === 'addition') {
		allowedElements = RICH_TYPES.filter(
			(t) => RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP[t] === 'independent'
		);
	} else if (editorMode === 'insertion') {
		allowedElements = [...RICH_TYPES];
	}
	if (allowedElements.indexOf(newElementType) > -1) {
		const newElement = createNewElement(newElementType, null, attributes);
		if (newElement) {
			const newElementHierarchyType = RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP[newElementType];
			if (editorMode === 'insertion') {
				if (newElementHierarchyType === 'independent') {
					splitAndReplaceParentOfElementWithItself(placeholderElement);
				}
			}
			const defaultText =
				newElementType === 'link' && attributes
					? attributes['href']
					: placeholderElement.textContent;
			newElement.textContent = defaultText;
			placeholderElement.replaceWith(newElement);
			selectTextInElement(newElement);
		}
	}
}

function splitAndReplaceParentOfElementWithItself(element: HTMLElement) {
	const parentType = element.parentElement && defineElementType(element.parentElement);
	if (parentType) {
		const firstHalfParentElement = createNewElement(parentType);
		const secondHalfParentElement = createNewElement(parentType);
		if (firstHalfParentElement && secondHalfParentElement) {
			firstHalfParentElement.textContent = '';
			secondHalfParentElement.textContent = '';
			let toFirstHalf = true;
			let childrenOfFirst: Node[] = [];
			let childrenOfSecond: Node[] = [];
			for (let child of element.parentElement!!.childNodes) {
				if (child === element) {
					toFirstHalf = false;
					continue;
				}
				if (toFirstHalf) {
					childrenOfFirst.push(child);
				} else {
					childrenOfSecond.push(child);
				}
			}
			firstHalfParentElement.append(...childrenOfFirst);
			secondHalfParentElement.append(...childrenOfSecond);
			element.parentElement.replaceWith(firstHalfParentElement, element, secondHalfParentElement);
		}
	}
}

function selectTextInElement(
	element: HTMLElement,
	startOffset: number | null = null,
	endOffset: number | null = null
) {
	const elementText = element.firstChild;
	if (elementText) {
		const range = new Range();
		range.setStart(elementText, startOffset == null ? 0 : startOffset);
		const textLength = elementText.textContent?.length ?? 0;
		range.setEnd(elementText, endOffset == null ? textLength : endOffset);
		window.getSelection()?.removeAllRanges();
		window.getSelection()?.addRange(range);
	}
}

function selectText(
	textNode: Text,
	startOffset: number | null = null,
	endOffset: number | null = null
) {
	const range = new Range();
	range.setStart(textNode, startOffset == null ? 0 : startOffset);
	const textLength = textNode.textContent?.length ?? 0;
	range.setEnd(textNode, endOffset == null ? textLength : endOffset);
	window.getSelection()?.removeAllRanges();
	window.getSelection()?.addRange(range);
}

function createNewElement(
	richType: RichTypes,
	text: string | null = null,
	attributes: Record<string, string> | null = null
): HTMLElement | null {
	const tagName = RICH_TYPES_TO_TAGS_MAP[richType];
	const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP[richType];
	if (tagName && richClass) {
		const newElement = document.createElement(tagName);
		newElement.classList.add(richClass);
		newElement.innerText = text === null ? 'placeholder' : text;
		const allowedAttributes = RICH_ATTRIBUTES[richType];
		if (attributes && allowedAttributes) {
			const resultAttributes = Object.entries(attributes).filter(
				([key, value]) => allowedAttributes?.indexOf(key) > -1
			);
			for (let [resKey, resAttribute] of resultAttributes) {
				newElement.setAttribute(resKey, resAttribute);
			}
		}
		return newElement;
	}
	return null;
}

export function createPlaceholderElement(): HTMLElement {
	const newElement = document.createElement('div');
	newElement.classList.add('rich-placeholder');
	newElement.innerText = 'placeholder';
	return newElement;
}

export function createInlinePlaceholderElement(): HTMLElement {
	const newElement = document.createElement('span');
	newElement.classList.add('rich-placeholder');
	newElement.innerText = 'placeholder';
	return newElement;
}

export function createPlaceHolderAfterSelectedElement(
	containerElement: HTMLElement
): HTMLElement | null {
	const richIndependentElement = findSelectedIndependentRichElement(containerElement);
	const placeholderElement = createPlaceholderElement();
	if (richIndependentElement) {
		richIndependentElement.after(placeholderElement);
	} else {
		containerElement.append(placeholderElement);
	}
	return placeholderElement;
}

export function createPlaceHolderInSelectedPosition(
	containerElement: HTMLElement
): HTMLElement | null {
	const selectedElement = findSelectedElement(containerElement);
	const textNode = findSelectedText();
	let selection = window.getSelection();
	if (selectedElement && selection && textNode) {
		const range = selection.getRangeAt(0);
		if (range) {
			const fullText = textNode.textContent ?? '';
			const firstTextPart = fullText.substring(0, range.startOffset);
			const placeholderElementText = fullText.substring(range.startOffset, range.endOffset);
			const secondTextPart = fullText.substring(range.endOffset);
			const selectedType = defineElementType(selectedElement);
			if (selectedType) {
				const placeholderElement = createInlinePlaceholderElement();
				placeholderElement.textContent = placeholderElementText || 'placeholder';
				const replacingElements = [firstTextPart, placeholderElement, secondTextPart].filter(
					(el) => !!el
				);
				textNode.replaceWith(...replacingElements);
				return placeholderElement;
			}
		}
	}
	return null;
}

export function createDefaultContentInContainer(containerElement: HTMLElement) {
	const paragraphElement = createNewElement('paragraph')!!;
	const garbageChildren = [...containerElement.childNodes];
	garbageChildren.forEach((child) => child.remove());
	containerElement.append(paragraphElement);
	selectTextInElement(paragraphElement);
}

export function defineElementRichType(element: HTMLElement): RichTypes | null {
	if (element) {
		let richClass: RichClasses | null = null;
		element.classList.forEach((className) => {
			if (RICH_CLASSES.indexOf(className as any) > -1) {
				richClass = className as RichClasses;
			}
		});
		if (richClass) {
			return TAGS_TO_RICH_TYPES_MAP[element.tagName.toLowerCase()] ?? null;
		}
	}
	return null;
}

// TODO: deprecated
export function defineElementType(element: HTMLElement): RichTypes | null {
	if (element) {
		return TAGS_TO_RICH_TYPES_MAP[element.tagName.toLowerCase()] ?? null;
	}
	return null;
}

export function chooseNewElementType(
	event: KeyboardEvent,
	editorMode: EditorModes
): RichTypes | null {
	if (event.altKey) {
		if (editorMode === 'addition') {
			switch (event.code) {
				case 'Digit1':
					return 'title';
				case 'Digit2':
					return 'paragraph';
			}
		} else if (editorMode === 'insertion') {
			switch (event.code) {
				case 'Digit1':
					return 'strong';
				case 'Digit2':
					return 'link';
			}
		}
	}
	return null;
}

export function chooseNewPosition(
	event: KeyboardEvent,
	editorMode: EditorModes
): NewPositionType | null {
	if (event.altKey) {
		if (editorMode === 'addition') {
			switch (event.code) {
				case 'ArrowUp':
					return 'before';
				case 'ArrowDown':
					return 'after';
			}
		}
	}
	return null;
}

export function checkIfSave(event: KeyboardEvent): boolean {
	if (event.code === 'KeyS' && event.altKey) {
		return true;
	}
	return false;
}

export function checkIfChangeMode(
	event: KeyboardEvent
): Extract<EditorModes, 'addition' | 'insertion'> | null {
	if (event.altKey) {
		if (event.code === 'KeyA') {
			return 'addition';
		}
		if (event.code === 'KeyI') {
			return 'insertion';
		}
	}
	return null;
}

export function checkIfEscapeModes(event: KeyboardEvent): boolean {
	if (event.code === 'Escape') {
		return true;
	}
	return false;
}

export function changeDefaultEnterBehaviour(event: KeyboardEvent) {
	if (event.code === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		const textNode = findSelectedText();
		let selection = window.getSelection();
		if (selection && textNode) {
			const range = selection.getRangeAt(0);
			if (range) {
				const textOffset = range.startOffset;
				const prevText = textNode.textContent ?? '';
				const newText = prevText.substring(0, textOffset) + '\r\n' + prevText.substring(textOffset);
				textNode.textContent = newText;
				selectText(textNode, textOffset + 1, textOffset + 1);
			}
		}
	}
}

export function findSelectedText(): Text | null {
	let selection = window.getSelection();
	if (selection) {
		if (selection.anchorNode) {
			let curNode = selection.anchorNode as Node | ParentNode | null;
			if (curNode && curNode instanceof Text) {
				return curNode as Text;
			}
		}
	}
	return null;
}

// TODO: refactor
export function findSelectedIndependentRichElement(
	containerElement: HTMLElement
): HTMLElement | null {
	let selection = window.getSelection();
	if (selection) {
		let container: HTMLElement | null = null;
		if (selection.anchorNode) {
			let curNode = selection.anchorNode as Node | ParentNode | null;
			let independentElementIsFound = false;
			while (curNode) {
				// go to the nearest HTMLElement node
				while (curNode && !(curNode instanceof HTMLElement)) {
					curNode = curNode.parentNode;
				}
				if (!curNode || curNode === containerElement) {
					// further search makes no sense
					break;
				}
				const richType = defineElementRichType(curNode as HTMLElement);
				const hierarchicalType = richType
					? RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP[richType]
					: null;
				if (hierarchicalType === 'independent') {
					independentElementIsFound = true;
					break;
				}
				// force switching from current improper HTMLElement to parent
				curNode = curNode.parentNode;
			}
			container = independentElementIsFound ? (curNode as HTMLElement) : null;
		}
		return container;
	}
	return null;
}

// TODO: deprecated
export function findSelectedElement(containerElement: HTMLElement): HTMLElement | null {
	let selection = window.getSelection();
	if (selection) {
		let selectedElement: HTMLElement | null = null;
		if (selection.anchorNode) {
			let curNode = selection.anchorNode as Node | ParentNode | null;
			while (curNode && !(curNode instanceof HTMLElement) && curNode !== containerElement) {
				curNode = curNode.parentNode;
			}
			if (curNode && curNode !== containerElement) {
				selectedElement = curNode as HTMLElement;
			}
		}
		return selectedElement;
	}
	return null;
}
