<script lang="ts">
	import type { SaveHistoryDto } from '$lib/types/todo';
	import { CANCEL_ICON_URL, EDIT_ICON_URL, HISTORY_RECORD_SIGN_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';

	// data
	export let todoId: number;
	export let records: string[];
	let editRecords = records.join('\n');
	// $: editRecords = records.join('\n');
	let isEditMode = false;
	$: console.log("@@@ editRecords: " + editRecords)

	// events and issuers
	type EventType = {
		save: SaveHistoryDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	let editHandler = () => {
		isEditMode = true;
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
	<div class={`todo-history-menu ${isEditMode ? "edit-menu" : ""}`}>
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
	{#if isEditMode}
		<textarea
			cols="30"
			rows="10"
			bind:value={editRecords}
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
	@import '/static/style/variables-mixins.scss';

	.todo-history {
		@include column;
		background-color: column;

		textarea {
			padding: $narrow-size;
			resize: none;
			@include dark-component;
			@include styled-scrollbar;
			flex: 1;
			outline: none;
		}

		.todo-history-menu {
			@include dark-component;
			@include row-centered($normal-size);
			padding: $narrow-size;

			img {
				@include icon-normal-sized;
			}
		}

		.edit-menu {
			@include bordered(bottom, white, $border-narrow-size);
		}

		.todo-history-body {
			flex: 1;
			overflow: auto;
			padding: $normal-size;
			@include styled-scrollbar;
		}

		.todo-history-item {
			margin-bottom: $wide-size;
			color: white;
			padding-bottom: $narrow-size;
			@include row-centered($normal-size);
			@include bordered(bottom, $base-pale-color, $border-narrow-size);

			img {
				@include icon-normal-sized;
			}
		}
	}
</style>
