export const RICH_TYPES = ['title', 'title-1', 'title-2', 'title-3', 'title-4', 'paragraph', 'strong', 'link'] as const;
export type RichTypes = (typeof RICH_TYPES)[number];

export const RICH_CLASSES = ['rich-title', 'rich-title-1', 'rich-title-2', 'rich-title-3', 'rich-title-4', 'rich-paragraph', 'rich-strong', 'rich-link'] as const;
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

export type HierarchicalPositionTypes = 'independent' | 'dependent';

export const RICH_TYPES_TO_TAGS_MAP: Record<RichTypes, string> = {
	title: 'h1',
	"title-1": 'h1',
	"title-2": 'h2',
	"title-3": 'h3',
	"title-4": 'h4',
	paragraph: 'p',
	strong: 'b',
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
	'title-1': 'independent',
	'title-2': 'independent',
	'title-3': 'independent',
	'title-4': 'independent',
	'paragraph': 'independent',
	'strong': 'dependent',
	'link': 'dependent',
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
};

export interface DescriptionFragment {
	richType: RichTypes;
	attributes?: Record<string, string> | null;
	children: (string | DescriptionFragment)[];
}