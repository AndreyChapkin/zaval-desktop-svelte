import { TAGS_TO_SIMPLE_RICH_TYPES_MAP, type NewPositionType, type RichTypes, RICH_TYPES_TO_RICH_CLASSES_MAP } from "$lib/types/rich-text";
import { findSelectedElement, findSelectedTextNode, getSelectedText, selectText } from "./dom-helpers";
import { defineElementRichType } from "./rich-editor-helpers";

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

export function chooseNewRichElementType(
	event: KeyboardEvent,
): RichTypes | null {
	if (event.altKey) {
		switch (event.code) {
			case 'Digit1':
				return 'title-1';
			case 'Digit2':
				return 'paragraph';
			case 'Digit3':
				return 'link';
			case 'Digit4':
				return 'list-item';
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

export function changeDefaultEnterBehaviour(event: KeyboardEvent) {
	if (event.code === 'Enter' && !event.shiftKey) {
		event.preventDefault();
		const textNode = findSelectedTextNode();
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
		const textNode = findSelectedTextNode();
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