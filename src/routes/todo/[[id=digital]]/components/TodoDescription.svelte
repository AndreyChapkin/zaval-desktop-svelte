<script lang="ts">
	import { updateTodo } from '$lib/api/todo-calls';
	import type { EditorModes, RichTypes } from '$lib/types/rich-text';
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
		createDefaultContentInContainer,
		createPlaceHolderAfterSelectedElement,
		createPlaceHolderInSelectedPosition,
		findSelectedElement,
		isEditorEmpty,
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
	let assistanceValueName: string | null = null;
	// TODO: bad decision
	$: if (!assistanceValueName && descriptionContainer) {
		setTimeout(() => descriptionContainer.focus(), 300);
	}
	let savedNewElementType: RichTypes | null = null;
	let assistanceValue: string | null = null;
	let assistancePositionStyle: string | null = null;
	let rerenderKey = Date.now();

	$: if (placeholderElement) {
		defineAssistancePosition();
	} else {
		assistancePositionStyle = null;
	}

	// initial description edition - create some paragraph to edit
	$: if (editorMode === 'edit') {
		if (isEditorEmpty(descriptionContainer)) {
			createDefaultContentInContainer(descriptionContainer);
			descriptionContainer.focus();
		}
	}

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

	const assistanceHandler = (event: KeyboardEvent) => {
		if (event.code === 'Enter' && assistanceValueName && assistanceValue) {
			let newElementAttributes = {
				[assistanceValueName]: assistanceValue
			};
			assistanceValueName = null;
			assistanceValue = null;
			if (savedNewElementType && placeholderElement) {
				addNewElementInsteadOfPlaceholder(
					savedNewElementType,
					placeholderElement,
					editorMode,
					newElementAttributes
				);
				editorMode = 'edit';
			}
			event.stopPropagation();
		}
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
		if (assistanceValueName) {
			return;
		}
		if (editorMode === 'addition' || editorMode === 'insertion') {
			if (placeholderElement) {
				const newPosition = chooseNewPosition(event, editorMode);
				if (newPosition) {
					moveElement(placeholderElement, newPosition);
					return;
				}
				const newElementType = chooseNewElementType(event, editorMode);
				if (newElementType) {
					if (newElementType === 'link') {
						savedNewElementType = newElementType;
						assistanceValueName = 'href';
						return;
					}
					addNewElementInsteadOfPlaceholder(newElementType, placeholderElement, editorMode);
					editorMode = 'edit';
				}
				return;
			}
		}
		const newMode = checkIfChangeMode(event);
		if (newMode) {
			if (newMode === 'addition') {
				placeholderElement = createPlaceHolderAfterSelectedElement(descriptionContainer);
			}
			if (newMode === 'insertion') {
				const selectedElement = findSelectedElement(descriptionContainer);
				if (selectedElement === descriptionContainer) {
					return;
				}
				placeholderElement = createPlaceHolderInSelectedPosition(descriptionContainer);
			}
			editorMode = newMode;
			return;
		}
		changeDefaultEnterBehaviour(event);
	};

	// functions
	function defineAssistancePosition() {
		if (placeholderElement) {
			const rect = placeholderElement.getBoundingClientRect();
			const top = placeholderElement.offsetTop + rect.height;
			const left = placeholderElement.offsetLeft;
			assistancePositionStyle = `top: ${top}px; left: ${left}px`;
		}
	}
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
			{#if editorMode === 'edit'}
				<span class="control-prompt">Alt+A -> ADD</span>
				<span class="control-prompt">Alt+I -> INSERT</span>
			{:else if editorMode === 'addition'}
				<span class="control-prompt">Alt+Up -> Move Up</span>
				<span class="control-prompt">Alt+Down -> Move Down</span>
				<span class="control-prompt">Alt+1 -> Title</span>
				<span class="control-prompt">Alt+2 -> Paragraph</span>
			{:else if editorMode === 'insertion'}
				<span class="control-prompt">Alt+1 -> Strong</span>
				<span class="control-prompt">Alt+2 -> Link</span>
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
			contenteditable={editorMode === 'edit'}
			tabindex="-1"
			on:keydown={keydownHandler}
		>
			{#each descriptionFragments as fragment}
				<RenderedFragment {fragment} />
			{/each}
			{#if assistanceValueName}
				<div
					class="assistance"
					style={assistancePositionStyle}
				>
					<label for="assistance-value">href</label>
					<input
						name="assistance-value"
						class="assistance-input"
						type="text"
						autofocus
						bind:value={assistanceValue}
						on:keydown={assistanceHandler}
					/>
				</div>
			{/if}
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

			.control-prompt {
				font-size: smaller;
				border-radius: $small-size;
				padding: 0 $border-normal-size 0 $border-normal-size;
				@include bordered(all, $base-contrast-color, $border-small-size);
			}
		}

		.todo-description-body {
			position: relative;
			flex: 1;
			overflow: auto;
			padding: $normal-size;
			outline: none;
			white-space: pre-wrap;
			@include styled-scrollbar;
		}

		.assistance {
			position: absolute;
			display: inline-block;
			@include standard-basis;

			label {
				color: $base-contrast-color;
			}

			.assistance-input {
				@include standard-input;
			}
		}

		:global(.rich-title) {
			color: $second-contrast-color;
			font-size: large;
			font-weight: bold;
			font-family: Verdana, sans-serif;
			margin-bottom: $normal-size;
		}
		:global(.rich-paragraph) {
			color: $base-contrast-color;
			margin-bottom: $normal-size;
			font-family: Tahoma, sans-serif;
		}
		:global(.rich-strong) {
			color: $strong-second-weak-color;
		}
		:global(.rich-link) {
			color: rgb(125, 212, 205);
		}
		:global(.rich-placeholder) {
			border-width: $border-small-size;
			border-color: $strong-second-color;
		}
	}
</style>
