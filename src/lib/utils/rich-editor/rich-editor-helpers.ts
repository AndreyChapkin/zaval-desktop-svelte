import {
	RICH_ATTRIBUTES,
	RICH_CLASSES,
	RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP,
	RICH_TYPES_TO_RICH_CLASSES_MAP,
	RICH_TYPES_TO_TAGS_MAP,
	TAGS_TO_RICH_TYPES_MAP,
	type DescriptionFragment,
	type NewPositionType,
	type RichClasses,
	type RichTypes
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

export function tryToMoveSelectedElement(containerElement: HTMLElement, position: NewPositionType) {
	const selectedIndependentElement = findSelectedIndependentRichElement(containerElement);
	if (selectedIndependentElement) {
		switch (position) {
			case 'before':
				let previousElement = selectedIndependentElement.previousElementSibling;
				previousElement?.before(selectedIndependentElement);
				break;
			case 'after':
				let nextElement = selectedIndependentElement.nextElementSibling;
				nextElement?.after(selectedIndependentElement);
				break;
		}
		selectTextInElement(selectedIndependentElement);
	}
}

export function selectTextInElement(
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

export function setAttributesToElement(
	richElement: HTMLElement,
	attributes: Record<string, string>
) {
	const richType = defineElementRichType(richElement);
	if (richType) {
		const allowedAttributes = RICH_ATTRIBUTES[richType];
		if (allowedAttributes) {
			for (let allowedAttribute of allowedAttributes) {
				const allowedAttributeValue = attributes[allowedAttribute];
				if (allowedAttributeValue) {
					richElement.setAttribute(allowedAttribute, allowedAttributeValue);
				}
			}
		}
	}
}

function createNewRichElement(
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

export function createNewRichElementRelativeToCurrentPosition(
	containerElement: HTMLElement,
	richType: RichTypes,
	attributes: Record<string, string> | null = null,
): HTMLElement {
	const newElement = createNewRichElement(richType, "placeholder", attributes)!!;
	const isDependent = RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP[richType] === 'dependent';
	if (isDependent) {
		placeDependentRichElementInSelectedPosition(newElement, containerElement);
	} else {
		placeIndependentRichElementInContainer(newElement, containerElement);
	}
	selectTextInElement(newElement);
	return newElement;
}

// Use for dependent elements. No checks
export function placeDependentRichElementInSelectedPosition(
	newRichElement: HTMLElement,
	containerElement: HTMLElement,
) {
	const selectedElement = findSelectedElement(containerElement);
	const textNode = findSelectedText();
	let selection = window.getSelection();
	if (selectedElement && selection && textNode) {
		const range = selection.getRangeAt(0);
		if (range) {
			const fullText = textNode.textContent ?? '';
			const firstTextPart = fullText.substring(0, range.startOffset);
			const newRichElementText = fullText.substring(range.startOffset, range.endOffset);
			const secondTextPart = fullText.substring(range.endOffset);
			const selectedType = defineElementType(selectedElement);
			if (selectedType) {
				newRichElement.textContent = newRichElementText ? newRichElementText : newRichElement.textContent;
				const replacingElements = [firstTextPart, "[", newRichElement, "]", secondTextPart].filter(
					(el) => !!el
				);
				textNode.replaceWith(...replacingElements);
				return newRichElement;
			}
		}
	}
}

// Use for independent elements. No checks
function placeIndependentRichElementInContainer(element: HTMLElement, containerElement: HTMLElement) {
	const selectedIndependentElement = findSelectedIndependentRichElement(containerElement);
	if (selectedIndependentElement) {
		selectedIndependentElement.after(element);
	} else {
		containerElement.append(element);
	}
}

export function createDefaultContentInContainer(containerElement: HTMLElement) {
	const paragraphElement = createNewRichElement('paragraph')!!;
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

export function defineElementType(element: HTMLElement): RichTypes | null {
	if (element) {
		return TAGS_TO_RICH_TYPES_MAP[element.tagName.toLowerCase()] ?? null;
	}
	return null;
}

export function chooseNewRichElementType(
	event: KeyboardEvent,
): RichTypes | null {
	if (event.altKey) {
		switch (event.code) {
			case 'Digit1':
				return 'title';
			case 'Digit2':
				return 'paragraph';
			case 'Digit3':
				return 'link';
		}
	}
	return null;
}

export function chooseNewPosition(
	event: KeyboardEvent,
): NewPositionType | null {
	if (event.altKey) {
		switch (event.code) {
			case 'ArrowUp':
				return 'before';
			case 'ArrowDown':
				return 'after';
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
				if (range.startOffset >= textNode.textContent!!.length) {
					textNode.after("\r\n\r\n");
					selectText(textNode.nextSibling as Text, 2, 2);
				} else {
					const prevText = textNode.textContent ?? '';
					const newText = prevText.substring(0, textOffset) + '\r\n' + prevText.substring(textOffset);
					textNode.textContent = newText;
					selectText(textNode, textOffset + 2, textOffset + 2);
				}
			}
		}
	}
}

export function changeDefaultTabBehaviour(event: KeyboardEvent) {
	if (event.code === 'Tab') {
		event.preventDefault();
		const textNode = findSelectedText();
		let selection = window.getSelection();
		if (selection && textNode) {
			const range = selection.getRangeAt(0);
			if (range) {
				const textOffset = range.startOffset;
				const prevText = textNode.textContent ?? '';
				const newText = prevText.substring(0, textOffset) + '  ' + prevText.substring(textOffset);
				textNode.textContent = newText;
				selectText(textNode, textOffset + 2, textOffset + 2);
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
export function isEditorEmpty(
	containerElement: HTMLElement
): boolean {
	for (let child of containerElement.childNodes) {
		if ((child instanceof HTMLElement) && defineElementRichType(child)) {
			return false;
		}
	}
	return true;
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

export function checkIfCreatedElementAndMakeRich(event: KeyboardEvent, containerElement: HTMLElement) {
	if (event.ctrlKey) {
		if (event.code === "KeyB") {
			const element = findSelectedElement(containerElement);
			if (element) {
				const probablyStrongType = defineElementType(element);
				if (probablyStrongType && probablyStrongType === 'strong') {
					tryToMakeElementRich(element);
				} else {
					const text = element.textContent ?? "???";
					element.replaceWith(text);
				}
			}
		}
	}
}

export function tryToMakeElementRich(element: HTMLElement) {
	const elementType = defineElementType(element);
	if (elementType) {
		const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP[elementType];
		if (richClass) {
			element.classList.add(richClass);
		}
	}
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
