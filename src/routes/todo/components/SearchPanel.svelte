<script lang="ts">
	import { findTodosWithNameFragment } from '$lib/api/todo-calls';
	import type { TodoDto } from '$lib/types/todo';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import { getContext } from 'svelte';
	import ModalWindow from '../../components/ModalWindow.svelte';
	import LoadingIndicator from '../../components/LoadingIndicator.svelte';
	import TodoCard from './TodoCard.svelte';

	// data
	let searchValue: string;
	let todos: TodoDto[];
	let isLoading = false;
	const { isOpen } = getContext('is-search-panel-open') as any;

	// events

	// handlers
	const closeHandler = () => {
		$isOpen = false;
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
