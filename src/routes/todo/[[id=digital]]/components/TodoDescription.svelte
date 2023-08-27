<script lang="ts">
	import { updateTodo } from '$lib/api/todo-calls';
	import type { EditorModes } from '$lib/types/rich-text';
	import type { DetailedTodoDto } from '$lib/types/todo';
	import { CANCEL_ICON_URL, EDIT_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import {
		addNewElementInsteadOfPlaceholder,
		changeDefaultEnterBehaviour,
		checkIfChangeMode,
		checkIfEscapeModes,
		checkIfSave,
		chooseNewElementType,
		chooseNewPosition,
		createPlaceHolderAfterSelectedElement,
		createPlaceHolderInSelectedPosition,
		moveElement,
		parseDescription,
		serializeDescription
	} from '$lib/utils/rich-editor-helpers';
	import { createEventDispatcher } from 'svelte';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let detailedTodoDto: DetailedTodoDto;
	$: descriptionFragments = parseDescription(detailedTodoDto.description);
	let descriptionContainer: HTMLDivElement;
	let editorMode: EditorModes = 'read';
	let placeholderElement: HTMLElement | null = null;
	let rerenderKey = Date.now();

	// events and issuers
	type EventType = {
		update: DetailedTodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	let editHandler = () => {
		editorMode = 'edit';
	};

	let saveHandler = async () => {
		const editedDescription = serializeDescription(descriptionContainer);
		await updateTodo(detailedTodoDto.id, {
			description: editedDescription
		});
		dispatch('update', {
			...detailedTodoDto,
			description: editedDescription
		});
		editorMode = 'read';
	};

	let cancelHandler = () => {
		editorMode = 'read';
		rerenderKey = Date.now();
	};

	const keydownHandler = (event: KeyboardEvent) => {
		if (checkIfSave(event)) {
			saveHandler();
			return;
		}
		if (checkIfEscapeModes(event)) {
			if (editorMode === 'addition' || editorMode === 'insertion') {
				editorMode = 'edit';
				placeholderElement?.remove();
				placeholderElement = null;
			} else if (editorMode === 'edit') {
				cancelHandler();
			}
			return;
		}
		if (editorMode === 'addition' || editorMode === 'insertion') {
			if (placeholderElement) {
				if (editorMode === 'addition') {
					const newPosition = chooseNewPosition(event);
					if (newPosition) {
						moveElement(placeholderElement, newPosition);
						return;
					}
				}
				const newElementType = chooseNewElementType(event);
				if (newElementType) {
					addNewElementInsteadOfPlaceholder(newElementType, placeholderElement, editorMode);
					editorMode = 'edit';
				}
				return;
			}
		}
		const newMode = checkIfChangeMode(event);
		if (newMode) {
			editorMode = newMode;
			if (newMode === 'addition') {
				placeholderElement = createPlaceHolderAfterSelectedElement(descriptionContainer);
			}
			if (newMode === 'insertion') {
				placeholderElement = createPlaceHolderInSelectedPosition(descriptionContainer);
			}
			return;
		}
		changeDefaultEnterBehaviour(event);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-description">
	<div class={`todo-description-menu ${editorMode !== 'read' ? 'edit-menu' : ''}`}>
		{#if editorMode !== 'read'}
			<button on:click={saveHandler}>
				<img
					src={SAVE_ICON_URL}
					alt="status"
				/>
			</button>
			<button on:click={cancelHandler}>
				<img
					src={CANCEL_ICON_URL}
					alt="status"
				/>
			</button>
			{#if editorMode === 'addition'}
				<span>Alt+Up</span>
				<span>Alt+Down</span>
			{:else}
				<span>Alt+:</span>
				<span>1->Title</span>
			{/if}
		{:else}
			<button on:click={editHandler}>
				<img
					src={EDIT_ICON_URL}
					alt="status"
				/>
			</button>
		{/if}
	</div>
	{#key rerenderKey}
		<div
			class="todo-description-body"
			bind:this={descriptionContainer}
			contenteditable={editorMode !== 'read'}
			on:keydown={keydownHandler}
		>
			{#each descriptionFragments as fragment}
				<RenderedFragment {fragment} />
			{/each}
		</div>
	{/key}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.todo-description {
		@include column;

		textarea {
			padding: $normal-size;
			color: $base-contrast-color;
			background-color: transparent;
			resize: none;
			outline: none;
			flex: 1;
			@include styled-scrollbar;
		}

		.todo-description-menu {
			background-color: $base-color;
			padding: $small-size;
			color: $base-contrast-color;

			@include row-centered($normal-size);

			img {
				@include icon-normal-sized;
			}
		}

		.edit-menu {
			background: $strong-gradient;
			@include bordered(bottom, $strong-second-color, $border-small-size);
		}

		.todo-description-body {
			flex: 1;
			overflow: auto;
			padding: $normal-size;
			outline: none;
			white-space: pre-wrap;
			@include styled-scrollbar;
		}

		:global(.rich-title) {
			color: rgb(227, 97, 97);
			font-size: large;
			font-weight: bold;
			margin-bottom: $normal-size;
		}
		:global(.rich-paragraph) {
			color: $base-contrast-color;
			margin-bottom: $normal-size;
		}
		:global(.rich-strong) {
			color: rgb(255, 153, 0);
		}
		:global(.rich-link) {
			color: rgb(76, 224, 211);
		}
		:global(.rich-placeholder) {
			border-width: $border-small-size;
			border-color: $strong-second-color;
		}
	}
</style>
