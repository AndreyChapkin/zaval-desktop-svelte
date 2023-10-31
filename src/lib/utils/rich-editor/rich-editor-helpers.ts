import {
	COMPLEX_RICH_TYPES_TO_CREATOR_MAP,
	RICH_ATTRIBUTES,
	RICH_CLASSES,
	RICH_TYPES_TO_POSSIBLE_PARENT_TYPES,
	RICH_TYPES_TO_RICH_CLASSES_MAP,
	SIMPLE_RICH_TYPES_TO_TAGS_MAP,
	TAGS_TO_SIMPLE_RICH_TYPES_MAP,
	type DescriptionFragment,
	type NewPositionType,
	type NewTransformationType,
	type RichClasses,
	type RichTypes,
	RICH_CLASSES_TO_RICH_TYPES_MAP,
	defineRichTypeComplexity,
	RICH_LIST_ITEM_CONTENT_CLASS,
	type RichTitleTypes
} from '$lib/types/rich-text';
import { extractRichElementChildren } from './complex-rich-element-creators';
import { findNearestParentElement, findSelectedElement, getSelectedText, pasteElementsInSelection, selectTextInElement } from './dom-helpers';
import type { EditionResult, TransformAction } from './editor-actions/editor-action-general-types';

export function getRichTagClass(richType: RichTypes): string | undefined {
	return RICH_TYPES_TO_RICH_CLASSES_MAP[richType];
}

export function getSimpleRichTag(richType: RichTypes): string | undefined {
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

// Deprecated
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
		const [element, fragment] = nodesToProcess.pop()!!;
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

// Deprecated
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
		// serialize attributes if any
		const richAttributes = serializeRichAttributes(element);
		if (richAttributes && Object.keys(richAttributes).length > 0) {
			parentFragment.attributes = richAttributes;
		}
		for (let childNode of element.childNodes) {
			if (childNode instanceof HTMLElement) {
				const childType = asCorrectRichType(childNode.tagName.toLowerCase());
				if (childType) {
					const childBlankFragment: DescriptionFragment = {
						richType: childType,
						children: []
					};
					// serialize attributes if any
					const richAttributes = serializeRichAttributes(childNode);
					if (richAttributes && Object.keys(richAttributes).length > 0) {
						childBlankFragment.attributes = richAttributes;
					}
					parentFragment.children.push(childBlankFragment);
					nodesToProcess.push([childNode, childBlankFragment]);
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

export function tryToChangeSelectedTitleElement(transformation: NewTransformationType) {
	const selectedElement = findSelectedElement();
	if (selectedElement) {
		const newTitleRichType = tryToChooseNewLevelForSelectedTitle(selectedElement, transformation);
		if (newTitleRichType) {
			const newTitleElement = createNewRichElement(
				newTitleRichType,
				selectedElement.textContent,
				{ 'id': selectedElement.id }
			);
			selectedElement.replaceWith(newTitleElement);
			selectTextInElement(newTitleElement);
		}
	}
}

export function tryToChooseNewLevelForSelectedTitle(selectedElement: HTMLElement, action: TransformAction): RichTitleTypes | null {
	const richType = defineElementRichType(selectedElement);
	// if selected element is rich element
	if (richType) {
		// create transformation field
		const richTitleTypes: Extract<RichTypes, 'title-1' | 'title-2' | 'title-3' | 'title-4'>[] = ['title-1', 'title-2', 'title-3', 'title-4'];
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

// Deprecated
export function tryToMoveSelectedElement(position: NewPositionType) {
	const selectedElement = findSelectedElement();
	const selectedRichType = selectedElement && defineElementRichType(selectedElement);
	if (selectedRichType) {
		switch (position) {
			case 'before':
				let previousElement = selectedElement.previousElementSibling;
				previousElement?.before(selectedElement);
				break;
			case 'after':
				let nextElement = selectedElement.nextElementSibling;
				nextElement?.after(selectedElement);
				break;
		}
		selectedElement.scrollIntoView();
		selectTextInElement(selectedElement);
	}
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

export function createNewRichElement(
	richType: RichTypes,
	text: string | null,
	attributes: Record<string, string> | null = null
): HTMLElement {
	const tagName = SIMPLE_RICH_TYPES_TO_TAGS_MAP[richType];
	if (tagName) {
		// Simple scenario
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
	} else {
		// Complex scenario
		const creator = COMPLEX_RICH_TYPES_TO_CREATOR_MAP[richType]!!;
		const newElement = creator(text);
		return newElement;
	}

}

export function findTheNearestAppropriatePlace(
	containerElement: HTMLElement,
	richType: RichTypes,
): { anchorElement: HTMLElement, place: 'append' | 'after' } | null {
	let selection = window.getSelection();
	if (selection) {
		const appropriateParentTypes = RICH_TYPES_TO_POSSIBLE_PARENT_TYPES[richType];
		let appropriateParentElement: HTMLElement | null = null;
		let prevConsideredElement: HTMLElement | null = null;
		if (selection.anchorNode) {
			let curNode = selection.anchorNode as Node | ParentNode | null;
			while (curNode) {
				// go to the nearest HTMLElement node
				while (curNode && !(curNode instanceof HTMLElement)) {
					curNode = curNode.parentNode;
				}
				if (!curNode) {
					// further search makes no sense
					break;
				}
				if (curNode === containerElement) {
					// If the new element can be placed only in the root relative to the current position
					if (appropriateParentTypes.indexOf('root') > -1) {
						if (prevConsideredElement) {
							return {
								anchorElement: prevConsideredElement,
								place: 'after',
							};
						}
						return {
							anchorElement: containerElement,
							place: 'append'
						};
					}
					return null;
				}
				const curNodeRichType = defineElementRichType(curNode as HTMLElement);
				if (curNodeRichType) {
					// Appropriate parent types contain current
					if (appropriateParentTypes.indexOf(curNodeRichType) > -1) {
						appropriateParentElement = curNode;
						break;
					}
				}
				prevConsideredElement = curNode;
				curNode = curNode.parentNode;
			}
		}
		if (appropriateParentElement) {
			const appropriateParentRichType = defineElementRichType(appropriateParentElement);
			if (appropriateParentRichType) {
				const appropriateParentRichTypeComplexity = defineRichTypeComplexity(appropriateParentRichType);
				if (appropriateParentRichTypeComplexity === 'simple') {
					if (prevConsideredElement) {
						return {
							anchorElement: prevConsideredElement,
							place: 'after',
						};
					}
					return {
						anchorElement: appropriateParentElement,
						place: 'append',
					};
				} else if (appropriateParentRichTypeComplexity === 'complex') {
					const appropriateParentRichType = defineElementRichType(appropriateParentElement);
					if (appropriateParentRichType === 'list-item') {
						const effectiveAnchorElement = appropriateParentElement.querySelector(`.${RICH_LIST_ITEM_CONTENT_CLASS}`) as HTMLElement;
						return {
							anchorElement: effectiveAnchorElement,
							place: 'append'
						};
					} else if (appropriateParentRichType === 'list') {
						if (prevConsideredElement) {
							return {
								anchorElement: prevConsideredElement,
								place: 'after',
							};
						}
						return {
							anchorElement: appropriateParentElement,
							place: 'append',
						};
					}
				}
			}

		}
	}
	return null;
}

export function findSelectedRichElement(containerElement: HTMLElement): { element: HTMLElement, richType: RichTypes} | null {
	let element = findSelectedElement();
	let richType = element && defineElementRichType(element);
	while(element && !richType) {
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
	while(element && defineElementRichType(element) !== richType) {
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
		const newElement = createNewRichElement(richType, text, attributes);
		const { anchorElement, place } = appropriatePlace;
		if (place === 'append') {
			anchorElement.append(newElement);
		} else if (place === 'after') {
			anchorElement.after(newElement);
		}
		return newElement;
	}
	return null;
}

export function createDefaultContentInContainer(containerElement: HTMLElement) {
	const paragraphElement = createNewRichElement('paragraph', 'placeholder')!!;
	const garbageChildren = [...containerElement.childNodes];
	garbageChildren.forEach((child) => child.remove());
	containerElement.append(paragraphElement);
	selectTextInElement(paragraphElement);
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
		}
	}
	return null;
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
