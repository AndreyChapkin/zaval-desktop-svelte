<script lang="ts">
	import { CANCEL_ICON_URL, HELP_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import { selectTextInElement } from '$lib/utils/rich-editor/dom-helpers';
	import type { EditorCommand } from '$lib/utils/rich-editor/editor-actions/editor-action-general-types';
	import {
		adjustStrongElementClass,
		detectNativeActions,
		processEditionAction,
		rewriteDefaultBehaviourForSomeInputs,
		translateEventToEditorCommand,
		tryToProcessActionEvent
	} from '$lib/utils/rich-editor/event-helpers';
	import {
		createNewSimpleRichElement,
		isEditorEmpty,
		serializeRichContent
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
			// fill with default paragraph
			const paragraphElement = createNewSimpleRichElement('paragraph', 'placeholder');
			richContentContainer.append(paragraphElement);
		}
		richContentContainer.focus();
		// Listen for changes and make reserve when it is needed
		richContentContainer.addEventListener('input', reservationCaller);
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
			const serializedEditorContent = serializeRichContent(richContentContainer);
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
				const modifyResult = processEditionAction({
					type: 'modify',
					name: 'attributes',
					element: elementToAssist!!,
					data: newElementAttributes
				});
				if (modifyResult) {
					nonTypedModifications++;
					selectTextInElement(elementToAssist!!);
				}
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
		adjustStrongElementClass(event);
		const nativeAction = detectNativeActions(event);
		if (nativeAction === 'paste') {
			nonTypedModifications++;
		}
	};

	const keydownHandler = (event: KeyboardEvent) => {
		// Process global events like save, cancel and etc.
		const editorCommand = translateEventToEditorCommand(event);
		if (editorCommand) {
			manageEditorCommand(editorCommand);
			return;
		}
		// Process content manipulation actions and get new/changed element
		const actionResult = tryToProcessActionEvent(event, richContentContainer);
		if (actionResult) {
			if (actionResult.elementInfo) {
				nonTypedModifications++;
				const { name: actionName, elementInfo } = actionResult;
				if (actionName === 'created' && elementInfo.richType === 'link') {
					// Delegate logic to assistance handler
					assistanceValueName = 'href';
					elementToAssist = elementInfo.element;
					assistancePositionStyle = computeAssistancePosition(elementToAssist);
				}
			}
			return;
		}
		rewriteDefaultBehaviourForSomeInputs(event);
	};

	// functions
	function computeAssistancePosition(anchorElement: HTMLElement): string {
		const rect = anchorElement.getBoundingClientRect();
		const top = anchorElement.offsetTop + rect.height;
		const left = anchorElement.offsetLeft;
		return `top: ${top}px; left: ${left}px`;
	}

	function manageEditorCommand(command: EditorCommand) {
		switch (command.name) {
			case 'save':
				saveHandler();
			case 'cancel':
				dispatch('cancel');
		}
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
			{#key effectiveRichContent}
				<RichText
					richText={effectiveRichContent}
					bind:contentContainer={richContentContainer}
				/>
			{/key}
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

			input {
				color: black;
			}

			.assistance-input {
				@include standard-input;
			}
		}
	}
</style>
