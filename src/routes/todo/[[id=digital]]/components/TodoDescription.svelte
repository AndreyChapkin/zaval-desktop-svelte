<script lang="ts">
	import { updateTodo } from '$lib/api/todo-calls';
	import type { EditorModes } from '$lib/types/rich-text';
	import type { DetailedTodoDto } from '$lib/types/todo';
	import { CANCEL_ICON_URL, EDIT_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import {
		changeDefaultEnterBehaviour,
		changeDefaultTabBehaviour,
		checkIfCreatedElementAndMakeRich,
		checkIfEscapeModes,
		checkIfSave,
		chooseNewPosition,
		chooseNewRichElementType,
		createDefaultContentInContainer,
		createNewRichElementRelativeToCurrentPosition,
		isEditorEmpty,
		parseDescription,
		pasteInSelection,
		selectTextInElement,
		serializeDescription,
		setAttributesToElement,
		tryToMoveSelectedElement
	} from '$lib/utils/rich-editor/rich-editor-helpers';
	import { createEventDispatcher } from 'svelte';
	import RenderedFragment from '../../../components/RenderedFragment.svelte';

	// const
	const TEMP_RICH_EDITOR_CONTENT_KEY = 'tempRichEditorContent';
	const WAIT_TO_CHECK_INPUT_RATE_MILLIS = 500;
	const MAX_UNSAVED_INPUTS_COUNT = 15;

	// data
	export let detailedTodoDto: DetailedTodoDto;
	$: descriptionFragments = parseDescription(detailedTodoDto.description);

	let hasUnpersistedData = !!localStorage.getItem(TEMP_RICH_EDITOR_CONTENT_KEY);

	let descriptionContainer: HTMLDivElement;

	let editorPrevMode: EditorModes = 'read';
	let editorMode: EditorModes = 'read';

	let assistanceValueName: string | null = null;
	let assistanceValue: string | null = null;
	let elementToAssist: HTMLElement | null = null;
	let assistancePositionStyle: string | null = null;

	let artificialModifications = 0;

	let rerenderKey = Date.now();

	let reservationState = {
		unsavedInputsCount: 0,
		noticedInputsCount: 0,
		isAlreadyTryingToSave: false,
		timerId: 0
	};

	function nonRichPaste(e: ClipboardEvent) {
		const plainTextFromClipboard = e.clipboardData?.getData('Text');
		if (plainTextFromClipboard) {
			pasteInSelection(plainTextFromClipboard);
		}
		e.preventDefault();
	}

	// Reactivity
	// TODO: bad decision
	// Return focus to editor after assistance window disappear
	$: if (!assistanceValueName && descriptionContainer) {
		setTimeout(() => descriptionContainer.focus(), 300);
	}

	// initial description edition - create some paragraph to edit
	$: if (editorMode === 'edit' && editorPrevMode === 'read') {
		if (hasUnpersistedData) {
			let tempSavedContent = localStorage.getItem(TEMP_RICH_EDITOR_CONTENT_KEY);
			if (tempSavedContent) {
				descriptionFragments = parseDescription(tempSavedContent);
			}
		} else if (isEditorEmpty(descriptionContainer)) {
			createDefaultContentInContainer(descriptionContainer);
		}
		descriptionContainer.focus();
		// Listen for changes and make reserve when it is needed
		descriptionContainer.addEventListener('input', reservator);
		descriptionContainer.addEventListener('paste', nonRichPaste);
	} else if (editorMode === 'read') {
		// No need in further listening
		if (descriptionContainer) {
			// when component is fully initialized
			descriptionContainer.removeEventListener('input', reservator);
			descriptionContainer.removeEventListener('paste', nonRichPaste);
			descriptionFragments = parseDescription(detailedTodoDto.description);
		}
		artificialModifications = 0;
	}

	$: {
		if (artificialModifications > 0) {
			reservator();
		}
	}

	// events and issuers
	type EventType = {
		update: DetailedTodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// functions
	const changeMode = (mode: EditorModes) => {
		editorPrevMode = editorMode;
		editorMode = mode;
	};

	// handlers
	let editHandler = () => {
		changeMode('edit');
	};

	function reserve(force: boolean = false) {
		// Not intensive input or max number of savings was skipped.
		// Save what was changed.
		const hasUnsavedInputs = reservationState.unsavedInputsCount > 0;
		const waitForMore = reservationState.unsavedInputsCount > reservationState.noticedInputsCount;
		const tooManyUnsavedInputs = reservationState.unsavedInputsCount >= MAX_UNSAVED_INPUTS_COUNT;
		if (force || tooManyUnsavedInputs || (!waitForMore && hasUnsavedInputs)) {
			reservationState.isAlreadyTryingToSave = true;
			// Refresh values cause we took their into account
			reservationState.unsavedInputsCount = 0;
			reservationState.noticedInputsCount = 0;
			const serializedEditorContent = serializeDescription(descriptionContainer);
			if (serializedEditorContent) {
				localStorage.setItem(TEMP_RICH_EDITOR_CONTENT_KEY, serializedEditorContent);
			}
			reservationState.isAlreadyTryingToSave = false;
			// Check if new changes appeared while was saving
			reserve();
		} else if (waitForMore) {
			// There is intensive input. Lets give one more time window for input.
			reservationState.isAlreadyTryingToSave = true;
			reservationState.noticedInputsCount = reservationState.unsavedInputsCount;
			reservationState.timerId = setTimeout(reserve, WAIT_TO_CHECK_INPUT_RATE_MILLIS);
		} else {
			reservationState.isAlreadyTryingToSave = false;
		}
	}

	let reservator = () => {
		reservationState.unsavedInputsCount++;
		if (!reservationState.isAlreadyTryingToSave) {
			reservationState.isAlreadyTryingToSave = true;
			reservationState.noticedInputsCount = reservationState.unsavedInputsCount;
			reservationState.timerId = setTimeout(reserve, WAIT_TO_CHECK_INPUT_RATE_MILLIS);
		}
	};

	let makePersisted = () => {
		hasUnpersistedData = false;
		localStorage.removeItem(TEMP_RICH_EDITOR_CONTENT_KEY);
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
		changeMode('read');
		makePersisted();
	};

	let backToRead = () => {
		changeMode('read');
		rerenderKey = Date.now();
	};

	let cancelHandler = () => {
		backToRead();
		makePersisted();
	};

	const assistanceHandler = (event: KeyboardEvent) => {
		if (event.code === 'Enter' && assistanceValue) {
			if (assistanceValue) {
				let newElementAttributes = {
					[assistanceValueName!!]: assistanceValue
				};
				setAttributesToElement(elementToAssist!!, newElementAttributes);
				artificialModifications++;
				selectTextInElement(elementToAssist!!);
				assistanceValueName = null;
				assistanceValue = null;
				elementToAssist = null;
				assistancePositionStyle = null;
			}
		} else if (event.code === 'Escape') {
			assistanceValueName = null;
			assistanceValue = null;
			elementToAssist = null;
			assistancePositionStyle = null;
		}
		event.stopPropagation();
	};

	const keyupHandler = (event: KeyboardEvent) => {
		checkIfCreatedElementAndMakeRich(event, descriptionContainer);
	};

	const keydownHandler = (event: KeyboardEvent) => {
		if (checkIfSave(event)) {
			saveHandler();
			return;
		}
		if (checkIfEscapeModes(event)) {
			if (editorMode === 'edit') {
				backToRead();
			}
			return;
		}
		const newElementType = chooseNewRichElementType(event);
		if (newElementType) {
			const newElement = createNewRichElementRelativeToCurrentPosition(
				descriptionContainer,
				newElementType
			);
			artificialModifications++;
			if (newElementType === 'link') {
				// Delegate logic to assistance handler
				assistanceValueName = 'href';
				elementToAssist = newElement;
				assistancePositionStyle = computeAssistancePosition(newElement);
			}
			return;
		}
		const newPosition = chooseNewPosition(event);
		if (newPosition) {
			tryToMoveSelectedElement(descriptionContainer, newPosition);
			return;
		}
		changeDefaultEnterBehaviour(event);
		changeDefaultTabBehaviour(event);
	};

	// functions
	function computeAssistancePosition(anchorElement: HTMLElement): string {
		const rect = anchorElement.getBoundingClientRect();
		const top = anchorElement.offsetTop + rect.height;
		const left = anchorElement.offsetLeft;
		return `top: ${top}px; left: ${left}px`;
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
				<span class="control-prompt"><b>+Title</b> Alt+1</span>
				<div class="prompt-separator" />
				<span class="control-prompt"><b>+Paragraph</b> Alt+2</span>
				<div class="prompt-separator" />
				<span class="control-prompt"><b>+Link</b> Alt+3</span>
				<div class="prompt-separator" />
				<span class="control-prompt"><b>Move Up</b> Alt+Up</span>
				<div class="prompt-separator" />
				<span class="control-prompt"><b>Move Down</b> Alt+Down</span>
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
			on:keyup={assistanceValueName || editorMode !== 'edit' ? null : keyupHandler}
			on:keydown={assistanceValueName || editorMode !== 'edit' ? null : keydownHandler}
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
						on:keyup={assistanceHandler}
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

	@font-face {
		font-family: Nunito;
		font-weight: normal;
		src: url('$lib/assets/fonts/Nunito-Regular.ttf');
	}

	@font-face {
		font-family: Nunito;
		font-weight: bold;
		src: url('$lib/assets/fonts/Nunito-Black.ttf');
	}

	.todo-description {
		@include column;

		.todo-description-menu {
			background-color: $second-light-color;
			padding: $small-size;
			color: $base-contrast-color;

			@include row-centered($normal-size);

			img {
				@include icon-normal-sized;
			}
		}

		.edit-menu {
			background: $strong-gradient;

			.control-prompt {
				color: $base-weak-contrast-color;
				font-size: smaller;

				b {
					color: $base-contrast-color;
				}
			}

			.prompt-separator {
				width: $border-normal-size;
				height: $border-normal-size;
				border-radius: $border-normal-size;
				background-color: $strong-second-color;
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
			color: rgb(236, 178, 70);
			font-size: larger;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}
		:global(.rich-paragraph) {
			color: $base-contrast-color;
			margin-bottom: $normal-size;
			font-family: Nunito;
		}
		:global(.rich-strong) {
			color: rgb(218, 129, 64);
		}
		:global(.rich-link) {
			color: rgb(125, 180, 212);
			text-decoration: underline dotted;
		}
		:global(.rich-placeholder) {
			border-width: $border-small-size;
			border-color: $strong-second-color;
		}
	}
</style>
