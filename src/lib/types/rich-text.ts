export const RICH_TYPES = ['title', 'paragraph', 'strong', 'link'] as const;
export type RichTypes = (typeof RICH_TYPES)[number];

export const RICH_CLASSES = ['rich-title', 'rich-paragraph', 'rich-strong', 'rich-link'] as const;
export type RichClasses = (typeof RICH_CLASSES)[number];

export const RICH_ATTRIBUTES: Partial<Record<RichTypes, string[]>> = {
	'link': ['href'],
};

export type NewPositionType = 'before' | 'after' | 'in place' | 'append';

export type EditorModes = 'edit' | 'addition' | 'insertion' | 'read';

export type HierarchicalPositionTypes = 'independent' | 'dependent';

export const RICH_TYPES_TO_TAGS_MAP: Record<RichTypes, string> = {
	title: 'h1',
	paragraph: 'p',
	strong: 'strong',
	link: 'a',
} as const;

export const TAGS_TO_RICH_TYPES_MAP: Record<string, RichTypes> = Object.entries(
	RICH_TYPES_TO_TAGS_MAP
).reduce((acc, cur) => {
	acc[cur[1]] = cur[0];
	return acc;
}, {} as Record<string, string>) as Record<string, RichTypes>;

export const RICH_TYPES_TO_HIERARCHICAL_POSITION_MAP: Record<RichTypes, HierarchicalPositionTypes> = {
	'title': 'independent',
	'paragraph': 'independent',
	'strong': 'dependent',
	'link': 'dependent',
};

export const RICH_TYPES_TO_RICH_CLASSES_MAP: Record<RichTypes, RichClasses> = {
	'title': 'rich-title',
	'paragraph': 'rich-paragraph',
	'strong': 'rich-strong',
	'link': 'rich-link',
};

export interface DescriptionFragment {
	richType: RichTypes;
	attributes: Record<string, string> | null;
	children: (string | DescriptionFragment)[];
}