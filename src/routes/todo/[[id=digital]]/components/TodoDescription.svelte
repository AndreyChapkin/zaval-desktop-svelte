<script lang="ts">
	import { updateTodo } from '$lib/api/todo-calls';
	import type { DetailedTodoDto } from '$lib/types/todo';
	import { CANCEL_ICON_URL, EDIT_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import { findSelectedElement, parseDescription, serializeDescription } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let detailedTodoDto: DetailedTodoDto;
	$: descriptionFragments = parseDescription(detailedTodoDto.description);
	let descriptionContainer: HTMLDivElement;
	let isEditMode = false;

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
	<div
		class="todo-description-body"
		bind:this={descriptionContainer}
		contenteditable={isEditMode}
		on:keydown={(e) => {
			if (e.code === "Enter") {
				// e.preventDefault();
			}
			if (e.code === 'Digit8' && e.ctrlKey) {
				descriptionFragments = [...descriptionFragments, {
					richType: 'paragraph',
					children: [
						"example text\nanother string ",
						{richType: 'strong', children: ["pepper"]},
						" example text\nanother string"
					],
				}];
			}
			if (e.code === 'Digit7' && e.ctrlKey) {
				findSelectedElement();
			}
		}}
	>
		{#each descriptionFragments as fragment}
			<RenderedFragment {fragment} />
		{/each}
	</div>
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
			white-space: pre-wrap;
			color: $base-contrast-color;
			@include styled-scrollbar;

			.styledFragment {
				color: pink;
				display: block;
			}
		}
	}
</style>
