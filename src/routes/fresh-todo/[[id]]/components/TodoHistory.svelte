<script lang="ts">
	import type { SaveHistoryDto } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';

	// data
	export let todoId: number;
	export let records: string[];
	let editRecords = records.join("\n");
	let isEditMode = false;

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
		dispatch("save", {
			todoId,
			records: editRecords.split("\n").filter(i => !!i),
		});
		isEditMode = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-history">
	<div class="todo-hostory-menu">
		{#if isEditMode}
			<button on:click={saveHandler}>Save</button>
		{:else}
			<button on:click={editHandler}>Edit</button>
		{/if}
	</div>
	{#if isEditMode}
		<textarea cols="30" rows="10" bind:value={editRecords}></textarea>
	{:else}
		{#each records as record}
			<div class="todo-hostory-item">
				{record}
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-history {
		textarea {
			@include dark-component;
		}
	}
</style>
