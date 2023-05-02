<script lang="ts">
	import { callDelete, callPost } from '$lib/utils/call-helpers';
	import type { Todo, TodoHierachy } from '$lib/types/todo';
	import TodoItem from './TodoItem.svelte';
	import TodoMenu from './TodoMenu.svelte';

	// data
	let clazz: string | null = null;
	export { clazz as class };

	export let todos: TodoHierachy[];
	let isMenuOpen = false;
	let menuX = 0;
	let menuY = 0;
	let clickedTodo: Todo | null = null;

	// handlers
	const createTodoHandler = (createEvent: any) => {
		const todo = createEvent.detail;
		callPost('/api/todo', {todo});
	};
	const deleteTodoHandler = (deleteEvent: any) => {
		const todo = deleteEvent.detail;
		callDelete("/api/todo", {todo});
	};
	const backgroundClickHandler = () => (isMenuOpen = false);
	const itemRightClickHandler = (e: any) => {
		const { todo, x, y } = e.detail;
		isMenuOpen = true;
		menuX = x;
		menuY = y;
		clickedTodo = todo;
	};
</script>

<div class={"todo-list" + ` ${clazz}`}>
	{#each todos as todo (todo.id)}
		<TodoItem
			on:rightClick={itemRightClickHandler}
			on:select
			todo={todo}
		/>
	{/each}
</div>
{#if isMenuOpen && clickedTodo}
	<TodoMenu
		todo={clickedTodo}
		x={menuX}
		y={menuY}
		on:create={createTodoHandler}
		on:delete={deleteTodoHandler}
		on:backgroundClick={backgroundClickHandler}
	/>
{/if}
