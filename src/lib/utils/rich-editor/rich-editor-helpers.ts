import {
	RICH_ATTRIBUTES,
	RICH_CLASSES,
	RICH_CLASSES_TO_RICH_TYPES_MAP,
	RICH_TYPES_TO_POSSIBLE_PARENT_TYPES,
	RICH_TYPES_TO_RICH_CLASSES_MAP,
	SIMPLE_RICH_TYPES_TO_TAGS_MAP,
	TAGS_TO_SIMPLE_RICH_TYPES_MAP,
	isComplexRichType,
	type DescriptionFragment,
	type NewPositionType,
	type NewTransformationType,
	type RichClasses,
	type RichComplexTypes,
	type RichSimpleTypes,
	type RichTitleTypes,
	type RichTypes
} from '$lib/types/rich-text';
import { appendToListItem, createList, createListItem, createUnitedBlock, insertListChildren, insertListItemChildren, insertUnitedBlockChildren } from './complex-rich-element-creators';
import { findNearestParentElement, findSelectedElement, selectTextInElement } from './dom-helpers';
import type { TransformTitleAction } from './editor-actions/transform-actions';

export function getRichTagClass(richType: RichTypes): string | undefined {
	return RICH_TYPES_TO_RICH_CLASSES_MAP[richType];
}

export function getSimpleRichTag(richType: RichSimpleTypes): string | undefined {
	return SIMPLE_RICH_TYPES_TO_TAGS_MAP[richType];
}

function asCorrectRichType(tag: string): RichTypes | null {
	const type = TAGS_TO_SIMPLE_RICH_TYPES_MAP[tag];
	if (type) {
		return type;
	}
	return null;
}

export function serializeRichContent(richContentContainer: HTMLElement): string {
	const resultFragments: DescriptionFragment[] = [];
	const nodeAndFragmentToProcess: [HTMLElement, DescriptionFragment][] = [];
	// root children
	for (let rootChildNode of richContentContainer.childNodes) {
		if (rootChildNode instanceof HTMLElement) {
			const rootChildFragment = serializeRichElement(rootChildNode);
			if (rootChildFragment) {
				resultFragments.push(rootChildFragment);
				if (rootChildNode.childNodes.length > 0) {
					nodeAndFragmentToProcess.push([rootChildNode, rootChildFragment]);
				}
			}
		}
	}
	// process remained all level children
	while (nodeAndFragmentToProcess.length > 0) {
		// Fragment is already inside its parent children array
		const [curNode, curFragment] = nodeAndFragmentToProcess.pop()!!;
		const curChildren = extractRichElementChildren(curNode, curFragment.richType);
		for (let childNode of curChildren) {
			if (childNode instanceof HTMLElement) {
				// Create fragment in parent's children
				const childFragment = serializeRichElement(childNode);
				if (childFragment) {
					curFragment.children.push(childFragment);
					if (childNode.childNodes.length > 0) {
						// if has children - plan to check it too
						nodeAndFragmentToProcess.push([childNode, childFragment]);
					}
				}
			} else if (childNode instanceof Text) {
				const text = childNode.textContent;
				if (text) {
					// Merge with last child if it is text too
					const lastChild = curFragment.children.pop();
					if (typeof lastChild === 'string') {
						const mergedString = lastChild + text;
						curFragment.children.push(mergedString);
					} else {
						// return last child if any
						if (lastChild) {
							curFragment.children.push(lastChild);
						}
						// Add just add new child
						curFragment.children.push(text);
					}
				}
			}
		}
	}
	const noEmptyFragments = removeEmptyFragments(resultFragments);
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

function serializeRichElement(element: HTMLElement): DescriptionFragment | null {
	let resultFragment: DescriptionFragment | null = null;
	const richType = defineElementRichType(element);
	if (richType) {
		resultFragment = {
			richType,
			children: []
		};
		// serialize attributes if any
		const richAttributes = serializeRichAttributes(element);
		if (richAttributes && Object.keys(richAttributes).length > 0) {
			resultFragment.attributes = richAttributes;
		}
	}
	return resultFragment;
}

function serializeRichAttributes(element: HTMLElement): Record<string, string> | null {
	let resultAttributes = null as Record<string, string> | null;
	const richType = defineElementRichType(element);
	if (richType) {
		resultAttributes = {};
		const allowedAttributeNames = RICH_ATTRIBUTES[richType];
		if (allowedAttributeNames) {
			for (let allowedAttributeName of allowedAttributeNames) {
				const realAttributeValue = element.getAttribute(allowedAttributeName);
				if (realAttributeValue) {
					resultAttributes[allowedAttributeName] = realAttributeValue;
				}
			}
		}
	}
	return resultAttributes;
}

export function tryToChooseNewLevelForSelectedTitle(selectedElement: HTMLElement, action: TransformTitleAction): RichTitleTypes | null {
	const richType = defineElementRichType(selectedElement);
	// if selected element is rich element
	if (richType) {
		// create transformation field
		const richTitleTypes: RichTitleTypes[] = ['title-1', 'title-2', 'title-3', 'title-4'];
		// make transformation value
		const transformationDirection = action.description === 'upgrade' ?
			-1 :
			action.description === 'downgrade' ?
				1 :
				0;
		const currentTypePosition = richTitleTypes.indexOf(richType as any);
		// if current element is rich title
		if (currentTypePosition > -1) {
			// try to transform current rich title according to the transformation value
			const transformedTypePosition = currentTypePosition + transformationDirection;
			if (0 <= transformedTypePosition && transformedTypePosition < richTitleTypes.length) {
				return richTitleTypes[transformedTypePosition];
			}
		}

	}
	return null;
}

export function setAttributesToElement(
	richElement: HTMLElement,
	attributes: Record<string, string | number>
) {
	const richType = defineElementRichType(richElement);
	if (richType) {
		const allowedAttributes = RICH_ATTRIBUTES[richType];
		if (allowedAttributes) {
			for (let allowedAttribute of allowedAttributes) {
				const allowedAttributeValue = attributes[allowedAttribute];
				if (allowedAttributeValue) {
					richElement.setAttribute(allowedAttribute, String(allowedAttributeValue));
				}
			}
		}
	}
}

export function createNewSimpleRichElement(
	richType: RichSimpleTypes,
	text: string | null,
	attributes: Record<string, string> | null = null
): HTMLElement {
	const tagName = SIMPLE_RICH_TYPES_TO_TAGS_MAP[richType];
	const richClass = RICH_TYPES_TO_RICH_CLASSES_MAP[richType];
	const newElement = document.createElement(tagName);
	newElement.classList.add(richClass);
	if (text) {
		newElement.innerText = text;
	}
	const allowedAttributes = RICH_ATTRIBUTES[richType];
	if (attributes && allowedAttributes) {
		const resultAttributes = Object.entries(attributes).filter(
			([key, _]) => allowedAttributes.indexOf(key) > -1
		);
		for (let [resKey, resAttribute] of resultAttributes) {
			newElement.setAttribute(resKey, resAttribute);
		}
	}
	return newElement;
}

export function createNewComplexRichElement(
	richType: RichComplexTypes,
	content: (HTMLElement | string)[] | string | null,
): HTMLElement {
	switch (richType) {
		case 'list':
			return createList(content);
		case 'list-item':
			return createListItem(content);
		default:
			return createUnitedBlock(content);
	}
}

export function extractRichElementChildren(element: HTMLElement, richType: RichTypes): ChildNode[] {
	const resultChildren = [] as ChildNode[];
	const isComplex = isComplexRichType(richType);
	if (isComplex) {
		switch (richType) {
			case 'list':
				insertListChildren(element, resultChildren);
				break;
			case 'list-item':
				insertListItemChildren(element, resultChildren);
				break;
			case 'united-block':
				insertUnitedBlockChildren(element, resultChildren);
				break;
		}
	} else {
		if (richType === 'unknown') {
			// It is not clear how to process unkown element content. So save the raw text at least.
			const textChild = document.createTextNode(element.textContent ?? '');
			resultChildren.push(textChild);
		} else {
			for (let childNode of element.childNodes) {
				resultChildren.push(childNode);
			}
		}
	}
	return resultChildren;
}

export function findTheNearestAppropriatePlace(
	containerElement: HTMLElement,
	richType: RichTypes,
): { anchorElement: HTMLElement, place: 'append' | 'after' } | null {
	let selectedRichElementInfo = findSelectedRichElement(containerElement);
	if (selectedRichElementInfo) {
		const appropriateParentTypes = RICH_TYPES_TO_POSSIBLE_PARENT_TYPES[richType];
		let prevConsideredRichElementInfo: typeof selectedRichElementInfo | null = null;
		// if selected element = null then container is reached
		while (selectedRichElementInfo &&
			!appropriateParentTypes.includes('any-parent') &&
			!appropriateParentTypes.includes(selectedRichElementInfo.richType)
		) {
			prevConsideredRichElementInfo = selectedRichElementInfo;
			selectedRichElementInfo = findNearestRichParentElement(selectedRichElementInfo.element, containerElement);
		}
		if (selectedRichElementInfo) {
			return prevConsideredRichElementInfo
				? {
					anchorElement: prevConsideredRichElementInfo.element,
					place: 'after'
				}
				: {
					anchorElement: selectedRichElementInfo.element,
					place: 'append',
				};
		} else if (appropriateParentTypes.includes('root')) {
			return prevConsideredRichElementInfo
				? {
					anchorElement: prevConsideredRichElementInfo.element,
					place: 'after'
				}
				: {
					anchorElement: containerElement,
					place: 'append',
				};
		}
	}
	return null;
}

export function findSelectedRichElement(containerElement: HTMLElement): { element: HTMLElement, richType: RichTypes } | null {
	let element = findSelectedElement();
	let richType = element && defineElementRichType(element);
	while (element && !richType) {
		if (element === containerElement) {
			return null;
		}
		element = findNearestParentElement(element);
		richType = element && defineElementRichType(element);
	}
	if (richType && element) {
		return {
			element,
			richType
		};
	}
	return null;
}

export function findNearestRichParentElement(
	childElement: Node,
	containerElement: HTMLElement
): { element: HTMLElement, richType: RichTypes } | null {
	let element = findNearestParentElement(childElement);
	let richType = element && defineElementRichType(element);
	while (element && !richType) {
		if (element === containerElement) {
			return null;
		}
		element = findNearestParentElement(element);
		richType = element && defineElementRichType(element);
	}
	if (richType && element) {
		return {
			element,
			richType
		};
	}
	return null;
}

export function findSelectedElementWithRichType(richType: RichTypes, containerElement: HTMLElement): HTMLElement | null {
	let element = findSelectedElement();
	while (element && defineElementRichType(element) !== richType) {
		if (element === containerElement) {
			return null;
		}
		element = findNearestParentElement(element);
	}
	return element;
}

export function createNewRichElementAccordingToSelection(
	containerElement: HTMLElement,
	richType: RichTypes,
	text: string | null,
	attributes: Record<string, string> | null = null,
): HTMLElement | null {
	const appropriatePlace = findTheNearestAppropriatePlace(containerElement, richType);
	if (appropriatePlace) {
		const newElement = isComplexRichType(richType)
			? createNewComplexRichElement(richType, text)
			: createNewSimpleRichElement(richType, text, attributes);
		const { anchorElement, place } = appropriatePlace;
		if (place === 'append') {
			appendToRichOrNotRichElement(anchorElement, newElement);
		} else if (place === 'after') {
			anchorElement.after(newElement);
		}
		return newElement;
	}
	return null;
}

export function defineElementRichType(element: HTMLElement): RichTypes | null {
	if (element) {
		let richClass: RichClasses | null = null;
		for (let className of element.classList) {
			if (RICH_CLASSES.indexOf(className as any) > -1) {
				richClass = className as RichClasses;
				break;
			}
		}
		if (richClass) {
			return RICH_CLASSES_TO_RICH_TYPES_MAP[richClass]!!;
		} else {
			return 'unknown';
		}
	}
	return null;
}

export function markNonRichElements(element: HTMLElement) {
	const richType = defineElementRichType(element);
	if (!richType) {
		element.style.backgroundColor = 'red';
	} else {
		const children = extractRichElementChildren(element, richType);
		children.forEach(child => {
			if (child instanceof HTMLElement) {
				markNonRichElements(child);
			}
		});
	}
}

export function appendToRichOrNotRichElement(parentElement: HTMLElement, childElement: HTMLElement) {
	const richType = defineElementRichType(parentElement);
	if (richType) {
		const isComplex = isComplexRichType(richType);
		if (isComplex) {
			switch (richType) {
				case 'list-item':
					appendToListItem(parentElement, childElement);
					break;
			}
		}
	}
	parentElement.append(childElement);
}

export function chooseNewTransformation(
	event: KeyboardEvent,
): NewTransformationType | null {
	if (event.altKey && event.shiftKey) {
		switch (event.code) {
			case 'ArrowLeft':
				return 'left';
			case 'ArrowRight':
				return 'right';
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
