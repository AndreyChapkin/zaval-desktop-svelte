import { RICH_ATTRIBUTES } from '$lib/types/rich-text';
import { defineElementType } from '$lib/utils/rich-editor/rich-editor-helpers';

export function setAttributes(
	element: HTMLElement,
	attributes: Record<string, string> | null = null
) {
	const elementType = defineElementType(element);
	if (elementType) {
		const allowedAttributes = RICH_ATTRIBUTES[elementType];
		if (attributes && allowedAttributes) {
			const resultAttributes = Object.entries(attributes).filter(
				([key, value]) => allowedAttributes?.indexOf(key) > -1
			);
			for (let [resKey, resAttribute] of resultAttributes) {
				element.setAttribute(resKey, resAttribute);
			}
		}
	}
}
