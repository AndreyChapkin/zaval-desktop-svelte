import { RICH_TYPES_TO_RICH_CLASSES_MAP, TAGS_TO_SIMPLE_RICH_TYPES_MAP, defineRichTypeComplexity } from "$lib/types/rich-text";
import { findSelectedElement, getSelectedText, pasteElementsInSelection, pasteEnterInSelection, pasteSpacesInSelection, selectTextInElement } from "./dom-helpers";
import type { CreateAction, CreateComplexAction, CreateSimpleAction } from "./editor-actions/create-actions";
import type { EditionAction, EditionResult, EditorCommand } from "./editor-actions/editor-action-general-types";
import type { ModifyAction } from "./editor-actions/modify-action";
import type { MoveAction } from "./editor-actions/move-actions";
import type { TransformTitleAction } from "./editor-actions/transform-actions";
import { createNewRichElement, createNewRichElementAccordingToSelection, defineElementRichType, findSelectedElementWithRichType, findTheNearestAppropriatePlace, setAttributesToElement, tryToChooseNewLevelForSelectedTitle } from "./rich-editor-helpers";

const KEY_TO_EDITION_ACTION_MAP: Record<string, EditionAction> = {
	'Alt+Digit1': {
		type: 'create',
		name: 'draft',
		richType: 'title-1',
	},
	'Alt+Digit2': {
		type: 'create',
		name: 'draft',
		richType: 'paragraph',
	},
	'Alt+Digit3': {
		type: 'create',
		name: 'draft',
		richType: 'link',
	},
	'Alt+Digit4': {
		type: 'create',
		name: 'draft',
		richType: 'list-item',
	},
	'Alt+Digit5': {
		type: 'modify',
		name: 'draftExtendList',
	},
	'Alt+ArrowUp': {
		type: 'move',
		name: 'within',
		direction: 'up'
	},
	'Alt+ArrowDown': {
		type: 'move',
		name: 'within',
		direction: 'down'
	},
	'Alt+Shift+ArrowLeft': {
		type: 'transform',
		name: 'title',
		description: 'upgrade'
	},
	'Alt+Shift+ArrowRight': {
		type: 'transform',
		name: 'title',
		description: 'downgrade'
	},
};


const KEY_TO_EDITION_COMMAND_MAP: Record<string, EditorCommand> = {
	'Alt+KeyS': {
		name: 'save',
	},
	'Esc': {
		name: 'cancel'
	},
};

export function translateToEditionActionEventAndProcess(event: KeyboardEvent, contentContainer: HTMLElement) {
	let action = defineEditionAction(event);
	if (action) {
		if (action.type === 'create' && action.name === 'draft') {
			action = {
				type: 'create',
				name: defineRichTypeComplexity(action.richType),
				richType: action.richType,
				container: contentContainer,
			} as CreateAction;
		} else if (action.type === 'modify' && action.name === 'draftExtendList') {
			action = {
				type: 'modify',
				name: 'extendList',
				container: contentContainer,
			};
		}
		return processEditionAction(action);
	}
	return null;
}

export function translateEventToEditorCommand(event: KeyboardEvent): EditorCommand | null {
	if (event.altKey) {
		let combination = `Alt+${event.code}`;
		return KEY_TO_EDITION_COMMAND_MAP[combination] ?? null;
	}
	return KEY_TO_EDITION_COMMAND_MAP[event.code] ?? null;
}

export function rewriteDefaultBehaviourForSomeInputs(event: KeyboardEvent): 'done' | null {
	// paste enter without shift
	if (event.code === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		pasteEnterInSelection();
		return 'done';
	}
	// paste several spaces when press tab instead of switching
	if (event.code === 'Tab') {
		event.preventDefault();
		pasteSpacesInSelection();
		return 'done';
	}
	return null;
}

function defineEditionAction(event: KeyboardEvent): EditionAction | null {
	if (event.altKey) {
		let pressedCombinationName = event.code;
		if (event.shiftKey) {
			pressedCombinationName = `Shift+${pressedCombinationName}`;
		}
		pressedCombinationName = `Alt+${pressedCombinationName}`;
		return KEY_TO_EDITION_ACTION_MAP[pressedCombinationName] ?? null;
	}
	return null;
}

export function processEditionAction(action: EditionAction): EditionResult | null {
	switch (action.type) {
		case 'create':
			return createNewRichElementAndResult(action);
		case 'move':
			return moveRichElementAndResult(action);
		case 'transform':
			return transformRichTitleElementAndResult(action);
		case 'modify':
			return modifyRichElementAndResult(action);
	}
	return null;
}

function createNewRichElementAndResult(action: CreateAction): EditionResult | null {
	console.log("@@@ action" + JSON.stringify(action));
	let newElement: HTMLElement | null = null;
	if (action.name === 'simple') {
		newElement = createNewSimpleRichElementAccordingToSelection(action);
	} else if (action.name === 'complex') {
		newElement = createNewComplexRichElementAccordingToSelection(action);
	}
	if (newElement) {
		return {
			name: 'created',
			elementInfo: {
				richType: action.richType,
				element: newElement,
			}
		};
	}
	return null;
}

export function createNewSimpleRichElementAccordingToSelection(action: CreateSimpleAction): HTMLElement | null {
	switch (action.richType) {
		case 'link':
			return createLinkElementAccordingToSelection(action.container);
	}
	// if title - create id
	if (['title-1', 'title-2', 'title-3', 'title-4'].indexOf(action.richType) > -1) {
		return createTitleElementAccordingToSelection(action);
	}
	// other simple elements
	return createNewRichElementAccordingToSelection(action.container,
		action.richType,
		action.data as string || 'placeholder',
		{}
	);
}

export function createNewComplexRichElementAccordingToSelection(action: CreateComplexAction): HTMLElement | null {
	switch (action.richType) {
		case 'list-item':
			const listItemElement = createListItemAccordingToSelection('placeholder', action.container);
			return listItemElement;
	}
	return null;
}

function createLinkElementAccordingToSelection(containerElement: HTMLElement): HTMLElement | null {
	const selectedText = getSelectedText();
	if (selectedText) {
		const newElement = createNewRichElementAccordingToSelection(containerElement, 'link', selectedText);
		if (newElement) {
			pasteElementsInSelection(["[", newElement, "]"]);
			return newElement;
		}
	}
	return null;
}

function createTitleElementAccordingToSelection(action: CreateSimpleAction): HTMLElement | null {
	const newElement = createNewRichElementAccordingToSelection(
		action.container,
		action.richType,
		"placeholder",
		{
			id: `${Math.floor(Math.random() * 1000000000)}`
		}
	);
	return newElement;
}

function createListItemAccordingToSelection(text: string, containerElement: HTMLElement): HTMLElement | null {
	console.log("@@@ createListItemAccordingToSelection");
	const nearestAppropriatePlace = findTheNearestAppropriatePlace(containerElement, 'list-item');
	const needCreateList = !nearestAppropriatePlace
		|| defineElementRichType(nearestAppropriatePlace.anchorElement) !== 'list';
	nearestAppropriatePlace && console.log("@@@ " + defineElementRichType(nearestAppropriatePlace.anchorElement));
	const newListItemElement = createNewRichElement('list-item', text);
	if (needCreateList) {
		const newListElement = createNewRichElementAccordingToSelection(
			containerElement,
			'list',
			null,
		);
		if (newListElement) {
			newListElement.append(newListItemElement);
			return newListItemElement;
		}
	}
	return newListItemElement;
}

function moveRichElementAndResult(action: MoveAction): EditionResult | null {
	let result: EditionResult | null = null;
	const selectedElement = findSelectedElement();
	const selectedRichType = selectedElement && defineElementRichType(selectedElement);
	if (selectedRichType) {
		switch (action.direction) {
			case 'up':
				let previousElement = selectedElement.previousElementSibling;
				previousElement?.before(selectedElement);
				break;
			case 'down':
				let nextElement = selectedElement.nextElementSibling;
				nextElement?.after(selectedElement);
				break;
		}
		selectedElement.scrollIntoView();
		selectTextInElement(selectedElement);
		result = {
			name: 'moved',
			elementInfo: {
				richType: selectedRichType,
				element: selectedElement,
			},
		};
	}
	return result;
}

export function transformRichTitleElementAndResult(action: TransformTitleAction): EditionResult | null {
	const selectedElement = findSelectedElement();
	if (selectedElement) {
		const newTitleRichType = tryToChooseNewLevelForSelectedTitle(selectedElement, action);
		if (newTitleRichType) {
			const newTitleElement = createNewRichElement(
				newTitleRichType,
				selectedElement.textContent,
				{ 'id': selectedElement.id }
			);
			selectedElement.replaceWith(newTitleElement);
			selectTextInElement(newTitleElement);
			return {
				name: 'transformed',
				elementInfo: {
					richType: newTitleRichType,
					element: newTitleElement,
				},
			};
		}
	}
	return null;
}

export function modifyRichElementAndResult(action: ModifyAction): EditionResult | null {
	switch (action.name) {
		case 'attributes':
			const attributes = action.data;
			setAttributesToElement(action.element, attributes);
			return {
				name: 'modified',
				elementInfo: {
					element: action.element,
					richType: defineElementRichType(action.element)!!,
				}
			};
		case 'extendList':
			const listElement = findSelectedElementWithRichType('list', action.container);
			if (listElement) {
				const listItemElement = createNewRichElement('list-item', 'placeholder');
				listElement.append(listItemElement);
				return {
					name: 'modified',
					elementInfo: {
						element: listElement,
						richType: 'list',
					}
				};
			}
	}
	return null;
}

export function adjustStrongElementClass(event: KeyboardEvent,) {
	if (event.ctrlKey) {
		if (event.code === "KeyB") {
			// make bold element rich
			const element = findSelectedElement();
			if (element) {
				const selectedElementName = element.tagName.toLocaleLowerCase();
				const selectedElementRichType = TAGS_TO_SIMPLE_RICH_TYPES_MAP[selectedElementName];
				if (selectedElementRichType === 'strong') {
					const strongClass = RICH_TYPES_TO_RICH_CLASSES_MAP[selectedElementRichType];
					element.classList.add(strongClass);
				} else {
					const selectedText = getSelectedText();
					if (selectedText) {
						element.replaceWith(selectedText);
					}
				}
			}
		}
	}
}