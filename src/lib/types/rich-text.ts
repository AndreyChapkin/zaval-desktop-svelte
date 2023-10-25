import { createListItem } from "$lib/utils/rich-editor/complex-rich-element-creators";

export const RICH_TYPES = [
	'title', 'title-1', 'title-2', 'title-3', 'title-4',
	'paragraph', 'strong', 'link',
	'list', 'list-item',
	'expandable-block',
	'additional-info-block', 'bad-block',
] as const;
export type RichTypes = (typeof RICH_TYPES)[number];

export const RICH_CLASSES = [
	'rich-title', 'rich-title-1', 'rich-title-2', 'rich-title-3', 'rich-title-4',
	'rich-paragraph', 'rich-strong', 'rich-link',
	'rich-list', 'rich-list-item',
	'rich-expandable-block',
	'rich-additional-info-block', 'rich-bad-block',
] as const;
export type RichClasses = (typeof RICH_CLASSES)[number];

export const RICH_ATTRIBUTES: Partial<Record<RichTypes, string[]>> = {
	'link': ['href'],
	'title-1': ['id'],
	'title-2': ['id'],
	'title-3': ['id'],
	'title-4': ['id'],
};

export type NewPositionType = 'before' | 'after';

export type NewTransformationType = 'left' | 'right';

export type EditorModes = 'edit' | 'read';

export type PossibleRichParentTypes = RichTypes | 'root';

export const SIMPLE_RICH_TYPES_TO_TAGS_MAP: Partial<Record<RichTypes, string>> = {
	"title": 'h1',
	"title-1": 'h1',
	"title-2": 'h2',
	"title-3": 'h3',
	"title-4": 'h4',
	'paragraph': 'p',
	'strong': 'b',
	'link': 'a',
	'list': 'ul',
} as const;

export const COMPLEX_RICH_TYPES_TO_CREATOR_MAP: Partial<Record<RichTypes, ((text: string | null) => HTMLElement)>> = {
	'list-item': createListItem,
	// 'expandable-block': 'div',
	// 'additional-info-block': 'div',
	// 'bad-block': 'div'
};

export function defineRichTypeComplexity(richType: RichTypes): 'complex' | 'simple' {
	return COMPLEX_RICH_TYPES_TO_CREATOR_MAP[richType]
		? 'complex'
		: 'simple';
}

export const TAGS_TO_SIMPLE_RICH_TYPES_MAP: Record<string, RichTypes> = Object.entries(
	SIMPLE_RICH_TYPES_TO_TAGS_MAP
).reduce((acc, cur) => {
	acc[cur[1]] = cur[0];
	return acc;
}, {} as Record<string, string>) as Record<string, RichTypes>;

export const RICH_TYPES_TO_POSSIBLE_PARENT_TYPES: Record<RichTypes, PossibleRichParentTypes[]> = {
	'title': ['root'],
	'title-1': ['root'],
	'title-2': ['root'],
	'title-3': ['root'],
	'title-4': ['root'],
	'paragraph': ['root', 'list-item'],
	'strong': ['paragraph'],
	'link': ['paragraph'],
	'list': ['root',],
	'list-item': ['list'],
	'expandable-block': ['root', 'list-item'],
	'additional-info-block': ['root', 'list-item'],
	'bad-block': ['root', 'list-item']
};

export const RICH_TYPES_TO_RICH_CLASSES_MAP: Record<RichTypes, RichClasses> = {
	'title': 'rich-title',
	'title-1': 'rich-title-1',
	'title-2': 'rich-title-2',
	'title-3': 'rich-title-3',
	'title-4': 'rich-title-4',
	'paragraph': 'rich-paragraph',
	'strong': 'rich-strong',
	'link': 'rich-link',
	'list': 'rich-list',
	'list-item': 'rich-list-item',
	'expandable-block': 'rich-expandable-block',
	'additional-info-block': 'rich-additional-info-block',
	'bad-block': 'rich-bad-block',
};

export const RICH_LIST_ITEM_SIGN_CLASS = `${RICH_TYPES_TO_RICH_CLASSES_MAP['list-item']}-sign`;
export const RICH_LIST_ITEM_CONTENT_CLASS = `${RICH_TYPES_TO_RICH_CLASSES_MAP['list-item']}-content`;

export const RICH_CLASSES_TO_RICH_TYPES_MAP: Record<RichClasses, RichTypes> = Object.entries(
	RICH_TYPES_TO_RICH_CLASSES_MAP
).reduce((acc, cur) => {
	acc[cur[1]] = cur[0];
	return acc;
}, {} as Record<string, string>) as Record<RichClasses, RichTypes>;

export interface DescriptionFragment {
	richType: RichTypes;
	attributes?: Record<string, string> | null;
	children: (string | DescriptionFragment)[];
}