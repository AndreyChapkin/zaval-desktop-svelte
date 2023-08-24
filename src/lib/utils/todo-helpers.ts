import type { DetailedTodoDto, LightTodoDto, TodoStatus } from '$lib/types/todo';
import {
	BACKLOG_MENU_ICON_URL,
	DONE_MENU_ICON_URL,
	IN_PROGRESS_MENU_ICON_URL,
	NEXT_TO_TAKE_MENU_ICON_URL,
	PING_ME_MENU_ICON_URL,
	TODO_STATUS_IN_PROGRESS_ICON_URL,
	TODO_STATUS_NEED_ATTENTION_ICON_URL,
	TODO_STATUS_ON_HOLD_ICON_URL,
	WILL_BE_BACK_MENU_ICON_URL
} from './assets-references';

// helpers
export function statusImageUrl(status: TodoStatus): string {
	switch (status) {
		case 'IN_PROGRESS':
			return TODO_STATUS_IN_PROGRESS_ICON_URL;
		case 'BACKLOG':
			return TODO_STATUS_NEED_ATTENTION_ICON_URL;
		default:
			return TODO_STATUS_ON_HOLD_ICON_URL;
	}
}

export function todoStatusFromUrlForm(value: string): TodoStatus {
	return value.replaceAll('-', '_').toUpperCase() as TodoStatus;
}

export function todoStatusToUrlForm(status: TodoStatus): TodoStatus {
	return status.replaceAll('_', '-').toLowerCase() as TodoStatus;
}

export function todoStatusToLabel(status: TodoStatus): string {
	return status.replaceAll('_', ' ');
}

export function chooseStatusImgUrl(status: TodoStatus): string {
	switch (status) {
		case 'DONE':
			return DONE_MENU_ICON_URL;
		case 'BACKLOG':
			return BACKLOG_MENU_ICON_URL;
		case 'WILL_BE_BACK':
			return WILL_BE_BACK_MENU_ICON_URL;
		case 'PING_ME':
			return PING_ME_MENU_ICON_URL;
		case 'NEXT_TO_TAKE':
			return NEXT_TO_TAKE_MENU_ICON_URL;
		case 'IN_PROGRESS':
			return IN_PROGRESS_MENU_ICON_URL;
	}
}

export function chooseStatusClass(status: TodoStatus): string {
	switch (status) {
		case 'DONE':
			return 'done-status';
		case 'BACKLOG':
			return 'backlog-status';
		case 'WILL_BE_BACK':
			return 'will-be-back-status';
		case 'PING_ME':
			return 'ping-me-status';
		case 'NEXT_TO_TAKE':
			return 'next-to-take-status';
		case 'IN_PROGRESS':
			return 'in-progress-status';
	}
}

export function returnParentId(todo: DetailedTodoDto | LightTodoDto): number | null {
	const todoDto = todo as LightTodoDto;
	if (Number.isInteger(new Number(todoDto.parentId))) {
		return todoDto.parentId;
	}
	const todoHierarchyDto = todo as DetailedTodoDto;
	if (todoHierarchyDto.parents && todoHierarchyDto.parents.length > 0) {
		return todoHierarchyDto.parents[todoHierarchyDto.parents.length - 1].id;
	}
	return null;
}

const RICH_TYPES = ['title', 'paragraph', 'strong'] as const;
export type RichTypes = (typeof RICH_TYPES)[number];

const RICH_CLASSES = ['rich-title', 'rich-paragraph', 'rich-strong'] as const;
export type RichClasses = (typeof RICH_CLASSES)[number];

const RICH_TYPES_TO_TAGS_MAP: Record<RichTypes, string> = {
	title: 'h1',
	paragraph: 'p',
	strong: 'strong'
} as const;

const TAGS_TO_RICH_TYPES_MAP: Record<string, RichTypes> = Object.entries(
	RICH_TYPES_TO_TAGS_MAP
).reduce((acc, cur) => {
	acc[cur[1]] = cur[0];
	return acc;
}, {} as Record<string, string>) as Record<string, RichTypes>;

const TAGS_TO_RICH_CLASSES_MAP: Record<string, string> = {
	h1: 'rich-title',
	p: 'rich-paragraph',
	strong: 'rich-strong'
};

export function getRichTagClass(richType: RichTypes): string | undefined {
	return TAGS_TO_RICH_CLASSES_MAP[getRichTag(richType)];
}

export function getRichTag(richType: RichTypes): string {
	return RICH_TYPES_TO_TAGS_MAP[richType];
}

function asCorrectRichType(tag: string): RichTypes | null {
	const type = TAGS_TO_RICH_TYPES_MAP[tag];
	if (type) {
		return type;
	}
	return null;
}

export interface DescriptionFragment {
	richType: RichTypes;
	children: (string | DescriptionFragment)[];
}

export function parseDescription(description: string): DescriptionFragment[] {
	if (description) {
		const fragments: DescriptionFragment[] = JSON.parse(description);
		return fragments;
	}
	return [];
}

export function findSelectedElement(): HTMLElement | null {
	let selection = window.getSelection();
	if (selection) {
		let container = findDirectSelectedParent(selection.anchorNode);
		if (container) {
			return container;
		}
	}
	return null;
}

function findDirectSelectedParent(node: Node | ParentNode | null): HTMLElement | null {
	if (node) {
		let curNode = node as Node | ParentNode | null;
		while (curNode && !(curNode instanceof HTMLElement)) {
			curNode = curNode.parentNode;
		}
		return curNode ?? null;
	}
	return null;
}

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
		for (let childNode of element.childNodes) {
			if (childNode instanceof HTMLElement) {
				const htmlChildNode = childNode as HTMLElement;
				const childType = asCorrectRichType(htmlChildNode.tagName.toLowerCase());
				if (childType) {
					const childFragment: DescriptionFragment = {
						richType: childType,
						children: []
					};
					parentFragment.children.push(childFragment);
					nodesToProcess.push([htmlChildNode, childFragment]);
				}
			} else if (childNode instanceof Text) {
				const text = (childNode as Text).textContent;
				if (text) {
					parentFragment.children.push(text);
				}
			}
		}
		return parentFragment;
	}
	return null;
}

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
		const [element, fragment] = nodesToProcess.pop() as [HTMLElement, DescriptionFragment];
		serializeElement(element, fragment, nodesToProcess);
	}
	return JSON.stringify(fragments);
}
