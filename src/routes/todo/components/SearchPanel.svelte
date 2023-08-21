<script lang="ts">
	import { findTodosWithNameFragment } from '$lib/api/todo-calls';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import { createEventDispatcher } from 'svelte';
	import LoadingIndicator from '../../components/LoadingIndicator.svelte';
	import ModalWindow from '../../components/ModalWindow.svelte';
	import TodoCard from './TodoCard.svelte';
	import type { LightTodoDto } from '$lib/types/todo';

	// data
	let searchValue: string;
	let todos: LightTodoDto[];
	let isLoading = false;

	// events
	type EventType = {
		close: null;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const closeHandler = () => {
		dispatch('close');
	};

	// reactive functions
	const searchTodos = decreaseNumberOfCalls((value: string) => {
		isLoading = true;
		findTodosWithNameFragment(value).then((data) => {
			isLoading = false;
			todos = data;
		});
	}, 500);

	$: if (searchValue) {
		searchTodos(searchValue);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close={closeHandler}>
	<div class="search-panel">
		<input
			class="search-input"
			type="text"
			bind:value={searchValue}
			autofocus
		/>
		{#if isLoading}
			<LoadingIndicator />
		{:else}
			<div class="found-todo">
				{#if todos && todos.length > 0}
					{#each todos as todo}
						<TodoCard
							{todo}
							on:select={closeHandler}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</ModalWindow>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.search-panel {
		background-color: $base-dark-color;
		padding: $large-size;

		@include bordered($color: $base-color, $size: $border-small-size);
		@include screen-sized(80, 80);
		@include column-stretched($wide-size);
	}

	.search-input {
		color: $base-contrast-color;
		background: $strong-gradient;
		@include bordered($color: $strong-second-color, $size: $border-small-size);
		@include standard-input;
	}

	.found-todo {
		@include scrollable;
		@include responsive-grid(350px);
	}
</style>
