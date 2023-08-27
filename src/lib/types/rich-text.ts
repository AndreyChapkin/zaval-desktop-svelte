export const RICH_TYPES = ['title', 'paragraph', 'strong'] as const;
export type RichTypes = (typeof RICH_TYPES)[number];

export const RICH_CLASSES = ['rich-title', 'rich-paragraph', 'rich-strong'] as const;
export type RichClasses = (typeof RICH_CLASSES)[number];

export type NewPositionType = 'before' | 'after' | 'in place' | 'append';

export const RICH_TYPES_TO_TAGS_MAP: Record<RichTypes, string> = {
	title: 'h1',
	paragraph: 'p',
	strong: 'strong'
} as const;

export const TAGS_TO_RICH_TYPES_MAP: Record<string, RichTypes> = Object.entries(
	RICH_TYPES_TO_TAGS_MAP
).reduce((acc, cur) => {
	acc[cur[1]] = cur[0];
	return acc;
}, {} as Record<string, string>) as Record<string, RichTypes>;

export const RICH_TYPES_TO_RICH_CLASSES_MAP: Record<RichTypes, RichClasses> = {
	'title': 'rich-title',
	'paragraph': 'rich-paragraph',
	'strong': 'rich-strong'
};

export interface DescriptionFragment {
	richType: RichTypes;
	children: (string | DescriptionFragment)[];
}