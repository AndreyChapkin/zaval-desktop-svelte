<script lang="ts">
	import { CANCEL_ICON_URL, HELP_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import {
		changeDefaultEnterBehaviour,
		changeDefaultTabBehaviour,
		checkIfCreatedElementAndMakeRich,
		checkIfEscapeModes,
		checkIfSave,
		chooseNewPosition,
		chooseNewRichElementType,
		chooseNewTransformation,
		createDefaultContentInContainer,
		createNewRichElementRelativeToCurrentPosition,
		isEditorEmpty,
		pasteInSelection,
		selectTextInElement,
		serializeDescription,
		serializeRichContent,
		setAttributesToElement,
		tryToChangeSelectedTitleElement,
		tryToMoveSelectedElement
	} from '$lib/utils/rich-editor/rich-editor-helpers';
	import { createEventDispatcher } from 'svelte';
	import RichEditorShortkeys from './RichEditorShortkeys.svelte';
	import RichText from './RichText.svelte';

	// const
	const TEMP_RICH_EDITOR_CONTENT_KEY = 'tempRichEditorContent';
	const WAIT_TO_CHECK_INPUT_RATE_MILLIS = 500;
	const MAX_UNSAVED_INPUTS_COUNT = 15;

	// data
	export let richContent: string;
	let effectiveRichContent: string = richContent;
	let isPromptShown = false;

	let hasUnpersistedData = !!localStorage.getItem(TEMP_RICH_EDITOR_CONTENT_KEY);

	let richContentContainer: HTMLDivElement;

	let assistanceValueName: string | null = null;
	let assistanceValue: string | null = null;
	let elementToAssist: HTMLElement | null = null;
	let assistancePositionStyle: string | null = null;

	let nonTypedModifications = 0;

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
		reserve(true);
		e.preventDefault();
	}

	// Reactivity
	// TODO: bad decision
	// Return focus to editor after assistance window disappear
	$: if (!assistanceValueName && richContentContainer) {
		setTimeout(() => richContentContainer.focus(), 300);
	}

	// initial description edition - create some paragraph to edit
	$: if (richContentContainer) {
		if (hasUnpersistedData) {
			let tempSavedContent = localStorage.getItem(TEMP_RICH_EDITOR_CONTENT_KEY);
			if (tempSavedContent) {
				effectiveRichContent = tempSavedContent;
			}
		} else if (isEditorEmpty(richContentContainer)) {
			createDefaultContentInContainer(richContentContainer);
		}
		richContentContainer.focus();
		// Listen for changes and make reserve when it is needed
		richContentContainer.addEventListener('input', reservationCaller);
		richContentContainer.addEventListener('paste', nonRichPaste);
	}

	$: {
		if (nonTypedModifications > 0) {
			reservationCaller();
		}
	}

	// events and issuers
	type EventType = {
		save: string;
		cancel: void;
	};
	const dispatch = createEventDispatcher<EventType>();

	// functions
	export const flushContent = () => {
		const editedContent = serializeRichContent(richContentContainer);
		makePersisted();
		return editedContent;
	};

	// handlers

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
			const serializedEditorContent = serializeDescription(richContentContainer);
			if (serializedEditorContent) {
				localStorage.setItem(TEMP_RICH_EDITOR_CONTENT_KEY, serializedEditorContent);
				nonTypedModifications = 0;
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

	let reservationCaller = () => {
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

	let saveHandler = () => {
		const editedContent = flushContent();
		dispatch('save', editedContent);
	};

	let cancelHandler = () => {
		makePersisted();
		dispatch('cancel');
	};

	const assistanceHandler = (event: KeyboardEvent) => {
		if (event.code === 'Enter' && assistanceValue) {
			if (assistanceValue) {
				let newElementAttributes = {
					[assistanceValueName!!]: assistanceValue
				};
				setAttributesToElement(elementToAssist!!, newElementAttributes);
				nonTypedModifications++;
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
		checkIfCreatedElementAndMakeRich(event, richContentContainer);
	};

	const keydownHandler = (event: KeyboardEvent) => {
		if (checkIfSave(event)) {
			saveHandler();
			return;
		}
		if (checkIfEscapeModes(event)) {
			dispatch('cancel');
			return;
		}
		const newElementType = chooseNewRichElementType(event);
		if (newElementType) {
			let attributes = {} as Record<string, string>;
			if (['title-1', 'title-2', 'title-3', 'title-4'].indexOf(newElementType) > -1) {
				attributes['id'] = `${Math.floor(Math.random() * 1000000000)}`;
			}
			const newElement = createNewRichElementRelativeToCurrentPosition(
				richContentContainer,
				newElementType,
				attributes
			);
			nonTypedModifications++;
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
			tryToMoveSelectedElement(richContentContainer, newPosition);
			return;
		}
		const newTransformation = chooseNewTransformation(event);
		if (newTransformation) {
			tryToChangeSelectedTitleElement(richContentContainer, newTransformation);
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
<div class="rich-editor">
	<div class="rich-editor-menu">
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
		<div class="separator" />
		<button
			class="help-button"
			on:click={() => (isPromptShown = !isPromptShown)}
		>
			<img
				src={HELP_ICON_URL}
				alt="status"
			/>
		</button>
	</div>
	{#if isPromptShown}
		<RichEditorShortkeys />
	{/if}
	<div class="rich-content-container">
		<div
			class="rich-content-body"
			contenteditable={true}
			tabindex="-1"
			on:keyup={assistanceValueName ? null : keyupHandler}
			on:keydown={assistanceValueName ? null : keydownHandler}
		>
			<RichText
				richText={effectiveRichContent}
				bind:contentContainer={richContentContainer}
			/>
		</div>
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

	.rich-editor {
		@include column;

		.rich-editor-menu {
			padding: $small-size;
			color: $base-contrast-color;

			@include row-centered($normal-size);

			img {
				@include icon-normal-sized;
			}

			.separator {
				height: 4px;
				width: 4px;
				border-radius: 2px;
				margin: 0 $normal-size;
				background-color: $base-weak-contrast-color;
			}
		}

		.rich-content-container {
			@include scrollable-in-column;
			@include styled-scrollbar;
			border-width: 0 2px 2px 2px;
			border-color: $strong-light-color;
		}

		.rich-content-body {
			flex: 1;
			overflow: auto;
			padding: $normal-size;
			outline: none;
			white-space: pre-wrap;
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

		// :global(.rich-title) {
		// 	color: rgb(236, 178, 70);
		// 	font-size: larger;
		// 	font-weight: bold;
		// 	font-family: Nunito;
		// 	margin-bottom: $normal-size;
		// }
		// :global(.rich-title-1) {
		// 	color: red;
		// 	font-size: larger;
		// 	font-weight: bold;
		// 	font-family: Nunito;
		// 	margin-bottom: $normal-size;
		// }
		// :global(.rich-title-2) {
		// 	color: green;
		// 	font-size: large;
		// 	font-weight: bold;
		// 	font-family: Nunito;
		// 	margin-bottom: $normal-size;
		// }
		// :global(.rich-title-3) {
		// 	color: pink;
		// 	font-size: medium;
		// 	font-weight: bold;
		// 	font-family: Nunito;
		// 	margin-bottom: $normal-size;
		// }
		// :global(.rich-title-4) {
		// 	color: yellow;
		// 	font-size: small;
		// 	font-weight: bold;
		// 	font-family: Nunito;
		// 	margin-bottom: $normal-size;
		// }
		// :global(.rich-paragraph) {
		// 	color: $base-contrast-color;
		// 	margin-bottom: $normal-size;
		// 	font-family: Nunito;
		// }
		// :global(.rich-strong) {
		// 	color: rgb(218, 129, 64);
		// }
		// :global(.rich-link) {
		// 	color: rgb(125, 180, 212);
		// 	text-decoration: underline dotted;
		// }
		// :global(.rich-placeholder) {
		// 	border-width: $border-small-size;
		// 	border-color: $strong-second-color;
		// }
	}
</style>
