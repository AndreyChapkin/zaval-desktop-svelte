import {
	RICH_TYPES_TO_RICH_CLASSES_MAP,
	RICH_TYPES_TO_TAGS_MAP,
	TAGS_TO_RICH_TYPES_MAP,
	type DescriptionFragment,
	type NewPositionType,
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
	return JSON.stringify(fragments);
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
					const childFragment: DescriptionFragment = {
						richType: childType,
						children: []
					};
					parentFragment.children.push(childFragment);
					nodesToProcess.push([htmlChildNode, childFragment]);
				}
			} else if (childNode instanceof Text) {
				const text = (childNode as Text).textContent;
				if (text) {
					parentFragment.children.push(text);
				}
			}
		}
		return parentFragment;
	}
	return null;
}

export function addNewElement(
	newElementType: RichTypes,
	anchorElement: HTMLElement,
	position: NewPositionType
) {
	const newElement = createNewElement(newElementType);
	if (!newElement) {
		return;
	}
	console.log('@@@ newElementType = ' + newElementType);
	console.log('@@@ anchorElement');
	console.log(anchorElement);
	console.log('@@@ position = ' + position);
	switch (position) {
		case 'before':
			anchorElement.before(newElement);
			break;
		case 'after':
			anchorElement.after(newElement);
			break;
		case 'in place':
			anchorElement.append(newElement);
		case 'append':
			anchorElement.append(newElement);
	}
	selectTextInElement(newElement);
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

function createNewElement(richType: RichTypes): HTMLElement | null {
	const tagName = RICH_TYPES_TO_TAGS_MAP[richType];
	const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP[richType];
	if (tagName && richClass) {
		const newElement = document.createElement(tagName);
		newElement.classList.add(richClass);
		newElement.innerText = 'placeholder';
		return newElement;
	}
	return null;
}

export function defineElementType(element: HTMLElement): RichTypes | null {
	if (element) {
		return TAGS_TO_RICH_TYPES_MAP[element.tagName.toLowerCase()] ?? null;
	}
	return null;
}

export function chooseNewElementType(event: KeyboardEvent): RichTypes | null {
	if (event.altKey) {
		switch (event.code) {
			case 'Digit1':
				return 'title';
			case 'Digit2':
				return 'paragraph';
			case 'Digit3':
				return 'strong';
		}
	}
	return null;
}

export function chooseNewPosition(event: KeyboardEvent): NewPositionType | null {
	if (event.altKey) {
		switch (event.code) {
			case 'ArrowUp':
				return 'before';
			case 'ArrowDown':
				return 'after';
			case 'ArrowRight':
				return 'in place';
		}
	}
	return null;
}

export function changeDefaultEnterBehaviour(event: KeyboardEvent) {
	if (event.code === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		const textNode = findSelectedText();
		console.log('@@@ text = ' + textNode?.textContent);
		let selection = window.getSelection();
		if (selection && textNode) {
			const range = selection.getRangeAt(0);
			if (range) {
				const textOffset = range.startOffset;
				const prevText = textNode.textContent ?? '';
				const newText = prevText.substring(0, textOffset) + '\n' + prevText.substring(textOffset);
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

export function findSelectedElement(): HTMLElement | null {
	let selection = window.getSelection();
	if (selection) {
		let container: HTMLElement | null = null;
		if (selection.anchorNode) {
			let curNode = selection.anchorNode as Node | ParentNode | null;
			while (curNode && !(curNode instanceof HTMLElement)) {
				curNode = curNode.parentNode;
			}
			container = curNode ?? null;
		}
		return container;
	}
	return null;
}

export function adjustPosition(
	position: NewPositionType | null,
	newElementType: RichTypes
): NewPositionType {
	if (!position) {
		if (newElementType === 'paragraph') {
			return 'after';
		}
		if (newElementType === 'title') {
			return 'before';
		}
		return 'in place';
	} else {
		return position;
	}
}

export function findNearestElementWithType(
	childElement: HTMLElement,
	tagretType: RichTypes,
	boundingElement: HTMLElement
): HTMLElement | null {
	let curNode: Node | null = childElement;
	while (curNode && curNode !== boundingElement) {
		if (curNode instanceof HTMLElement) {
			const curElement = curNode as HTMLElement;
			const curElementType = defineElementType(curElement);
			if (curElementType === tagretType) {
				return curElement;
			}
		}
		curNode = curNode.parentNode;
	}
	return null;
}
