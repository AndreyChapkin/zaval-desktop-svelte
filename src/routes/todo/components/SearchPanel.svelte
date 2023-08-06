<script lang="ts">
	import TodoCard from './TodoCard.svelte';
	import { findTodosWithNameFragment } from '$lib/api/todo-calls';
	import type { TodoDto } from '$lib/types/todo';
	import { each } from 'svelte/internal';
	import ModalWindow from '../../components/ModalWindow.svelte';
	import SimpleTodoCard from './SimpleTodoCard.svelte';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';

	// data
	let searchValue: string;
	let todos: TodoDto[];
	// events

	// handlers

	// reactive functions
	const searchTodos = decreaseNumberOfCalls((value: string) => {
		findTodosWithNameFragment(value).then((data) => {
			todos = data;
		});
	}, 500);

	$: if (searchValue) {
		searchTodos(searchValue);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close>
	<div class="search-panel">
		<input
			class="search-input"
			type="text"
			bind:value={searchValue}
		/>
		<div class="found-todo">
			{#if todos && todos.length > 0}
				{#each todos as todo}
					<SimpleTodoCard {todo} />
				{/each}
			{/if}
		</div>
	</div>
</ModalWindow>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';
	@import '/static/style/todo-variables.scss';

	.search-panel {
		background-color: $base-color;
		padding: $large-size;
		@include screen-sized(80, 80);
		@include column-stretched($wide-size);
	}

	.search-input {
		@include standard-input;
	}

	.found-todo {
		@include scrollable;
		@include responsive-grid(350px);
	}
</style>
