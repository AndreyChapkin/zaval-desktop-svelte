import { RICH_TYPES_TO_RICH_CLASSES_MAP, TAGS_TO_SIMPLE_RICH_TYPES_MAP } from "$lib/types/rich-text";
import { findSelectedElement, getSelectedText, pasteEnterInSelection, pasteSpacesInSelection, selectTextInElement } from "./dom-helpers";
import type { CreateSimpleAction } from "./editor-actions/create-actions";
import type { EditionAction, EditionResult, EditorCommand } from "./editor-actions/editor-action-general-types";
import type { ModifyAction } from "./editor-actions/modify-action";
import type { MoveAction } from "./editor-actions/move-actions";
import type { TransformTitleAction } from "./editor-actions/transform-actions";
import { createAndManageNewRichElement, createNewRichElement, defineElementRichType, setAttributesToElement, tryToChooseNewLevelForSelectedTitle } from "./rich-editor-helpers";

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
		name: 'extendList',
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
				name: 'simple',
				richType: action.richType,
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
			if (action.name === 'simple') {
				return createRichElementAndResult(action);
			}
			break;
		case 'move':
			return moveRichElementAndResult(action);
		case 'transform':
			return transformRichTitleElementAndResult(action);
		case 'modify':
			return modifyRichElementAndResult(action);
	}
	return null;
}

function createRichElementAndResult(action: CreateSimpleAction): EditionResult | null {
	const newElement = createAndManageNewRichElement(action.container, action.richType);
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