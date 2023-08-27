<script lang="ts">
	import { updateTodo } from '$lib/api/todo-calls';
	import type { NewPositionType } from '$lib/types/rich-text';
	import type { DetailedTodoDto } from '$lib/types/todo';
	import { CANCEL_ICON_URL, EDIT_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import {
		addNewElement,
		chooseNewElementType,
		chooseNewPosition,
		adjustPosition,
		findSelectedElement,
		parseDescription,
		serializeDescription,

		changeDefaultEnterBehaviour

	} from '$lib/utils/rich-editor-helpers';
	import { createEventDispatcher } from 'svelte';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let detailedTodoDto: DetailedTodoDto;
	$: descriptionFragments = parseDescription(detailedTodoDto.description);
	let descriptionContainer: HTMLDivElement;
	let isEditMode = false;
	let savedNewElementPosition: NewPositionType | null = null;
	let rerenderKey = Date.now();

	// events and issuers
	type EventType = {
		update: DetailedTodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	let editHandler = () => {
		isEditMode = true;
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
		isEditMode = false;
	};

	let cancelHandler = () => {
		isEditMode = false;
		rerenderKey = Date.now();
	};

	const keydownHandler = (event: KeyboardEvent) => {
		changeDefaultEnterBehaviour(event);
		// position choosing branch
		const newPosition = chooseNewPosition(event);
		if (newPosition) {
			savedNewElementPosition = newPosition;
			return;
		}
		// element choosing branch
		const newElementType = chooseNewElementType(event);
		if (newElementType) {
			const anchorElement = findSelectedElement();
			if (anchorElement) {
				let resultPosition: NewPositionType = 'append';
				if (anchorElement !== descriptionContainer) {
					resultPosition = adjustPosition(savedNewElementPosition, newElementType);
				}
				addNewElement(newElementType, anchorElement, resultPosition);
				savedNewElementPosition = null;
			}
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-description">
	<div class={`todo-description-menu ${isEditMode ? 'edit-menu' : ''}`}>
		{#if isEditMode}
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
			contenteditable={isEditMode}
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
	}
</style>
