<script lang="ts">
	import type { SaveHistoryDto } from '$lib/types/todo';
	import {
		CANCEL_ICON_URL,
		EDIT_ICON_URL,
		HISTORY_RECORD_SIGN_URL,
		SAVE_ICON_URL
	} from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';

	// data
	export let todoId: number;
	export let records: string[];
	export let viewMode = false;
	let editRecords = records.join('\n');
	export let isEditMode = false;
	let textAreaElement: HTMLTextAreaElement;

	// events and issuers
	type EventType = {
		save: SaveHistoryDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	let editHandler = () => {
		isEditMode = true;
	};

	const keyUpHandler = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			const curDate = new Date();
			const formattedDateStr = curDate.toLocaleDateString(); //`${curDate.getFullYear()}.${curDate.getMonth()}.${curDate.getDay()}`;
			textAreaElement.value =
				textAreaElement.value.substring(0, textAreaElement.selectionStart + 1) +
				formattedDateStr +
				' ';
			textAreaElement.value.substring(textAreaElement.selectionEnd, textAreaElement.value.length);
		}
	};

	let saveHandler = () => {
		dispatch('save', {
			todoId,
			records: editRecords.split('\n').filter((i) => !!i)
		});
		isEditMode = false;
	};

	let cancelHandler = () => {
		isEditMode = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-history">
	{#if !viewMode}
		<div class={`todo-history-menu ${isEditMode ? 'edit-menu' : ''}`}>
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
	{/if}
	{#if isEditMode}
		<textarea
			cols="30"
			rows="10"
			bind:this={textAreaElement}
			bind:value={editRecords}
			on:keyup={keyUpHandler}
		/>
	{:else}
		<div class="todo-history-body">
			{#each records as record}
				<div class="todo-history-item">
					<img
						src={HISTORY_RECORD_SIGN_URL}
						alt="status"
					/>
					{record}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.todo-history {
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

		.todo-history-menu {
			background-color: $second-color;
			padding: $small-size;

			@include row-center($normal-size);

			img {
				@include icon-normal-sized;
			}
		}

		.edit-menu {
			background: $strong-gradient;
		}

		.todo-history-body {
			flex: 1;
			overflow: auto;
			padding: $normal-size;
			@include styled-scrollbar;
		}

		.todo-history-item {
			margin-bottom: $wide-size;
			color: $base-contrast-color;
			padding-bottom: $small-size;
			@include row-center($normal-size);
			@include bordered(bottom, $base-light-color, $border-small-size);

			img {
				@include icon-normal-sized;
			}
		}
	}
</style>
