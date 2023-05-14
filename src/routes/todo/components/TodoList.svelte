<script lang="ts">
	import type { Todo, TodoHierachy } from '$lib/types/todo';
	import TodoItem from './TodoItem.svelte';
	import TodoMenu from './TodoMenu.svelte';

	// data
	let clazz: string | null = null;
	export { clazz as class };

	export let todos: TodoHierachy[];
	export let selectedTodo: Todo | null = null;
	let isMenuOpen = false;
	let menuX = 0;
	let menuY = 0;
	let clickedTodo: TodoHierachy | null = null;

	// handlers
	const backgroundClickHandler = () => (isMenuOpen = false);
	const itemRightClickHandler = (e: any) => {
		const { todo, x, y } = e.detail;
		isMenuOpen = true;
		menuX = x;
		menuY = y;
		clickedTodo = todo;
	};
	const listRightClickHandler = (e: MouseEvent) => {
		if (e.ctrlKey) {
			const x = e.clientX;
			const y = e.clientY;
			isMenuOpen = true;
			menuX = x;
			menuY = y;
			clickedTodo = null;
			e.preventDefault();
		}
	};
</script>

<div
	on:contextmenu={listRightClickHandler}
	class={`todo-list ${clazz}`}
>
	{#each todos as todo (todo.id)}
		<TodoItem
			{selectedTodo}
			selectedClass="selected-todo"
			on:rightClick={itemRightClickHandler}
			on:select
			{todo}
		/>
	{/each}
</div>
{#if isMenuOpen}
	<TodoMenu
		todo={clickedTodo}
		x={menuX}
		y={menuY}
		on:save
		on:create
		on:delete
		on:backgroundClick={backgroundClickHandler}
	/>
{/if}

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-list {
		background-color: $base-color;
		overflow-y: auto;
		@include styled-scrollbar;
		@apply p-2 pt-4 w-full h-full;
	}
</style>
