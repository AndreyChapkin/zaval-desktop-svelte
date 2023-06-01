<script lang="ts">
	import { TODO_PRESENTATION_PARAM } from '$lib/api/param/todo-params';
	import { createTodo, deleteTodo, updateTodo } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import {
		ROOT_TODO_HIERARCHY,
		type CreateTodoDto,
		type Todo,
		type TodoHierachyDto,
		type UpdateTodoData,
		type UpdateTodoDto
	} from '$lib/types/todo';
	import { EXPANDER_ARROW_ICON_URL } from '$lib/utils/assets-references';
	import { callGet, callPatch } from '$lib/utils/call-helpers';
	import { returnWithAllParents } from '$lib/utils/todo-helpers';
	import SplitPane from '../../components/SplitPane.svelte';
	import MovementIndicator from './components/MovementIndicator.svelte';
	import TodoCard from './components/TodoCard.svelte';

	// state
	export let data: { todoHierachyDto: TodoHierachyDto };
	$: parentTodos = returnWithAllParents(data.todoHierachyDto);
	$: selectedTodo = data.todoHierachyDto;
	let showIndicator = false;
	let forwardIndicator = true;

	// handlers
	const updateTodoHandler = async (saveTodoEvent: CustomSvelteEvent<UpdateTodoData>) => {
		const updateData = saveTodoEvent.detail;
		console.log('@@@ updateData = ' + updateData);
		await updateTodo(updateData.id, updateData.updatedTodoDto);
		// TODO: make slighter
		window.location.reload();
	};

	const createTodoHandler = async (createTodoEvent: CustomSvelteEvent<CreateTodoDto>) => {
		await createTodo(createTodoEvent.detail);
		// TODO: make slighter
		window.location.reload();
	};

	const deleteTodoHandler = async (deleteTodoEvent: CustomSvelteEvent<number>) => {
		await deleteTodo(deleteTodoEvent.detail);
		// TODO: make slighter
		window.location.href = '/fresh-todo';
	};
</script>

<div class="todos-page">
	<!-- <button on:click={swithModeHandler}>Switch mode</button> -->
	{#if showIndicator}
		<MovementIndicator
			direction={forwardIndicator ? 'forward' : 'backward'}
			on:movementEnd={() => (showIndicator = false)}
		/>
	{/if}
	<SplitPane>
		<svelte:fragment slot="left">
			<div class="parent-stack">
				{#each parentTodos as todo (todo.id)}
					<TodoCard
						{todo}
						on:update={updateTodoHandler}
						on:create={createTodoHandler}
						on:delete={deleteTodoHandler}
						isSelected={todo.id === selectedTodo.id}
					/>
					{#if todo.id !== ROOT_TODO_HIERARCHY.id}
						<img
							src={EXPANDER_ARROW_ICON_URL}
							alt="arrow"
						/>
					{/if}
				{/each}
			</div>
		</svelte:fragment>
		<svelte:fragment slot="right">
			<div class="selected-todo-children">
				{#if selectedTodo.children}
					{#each selectedTodo.children as child (child.id)}
						<TodoCard
							todo={child}
							on:update={updateTodoHandler}
							on:create={createTodoHandler}
							on:delete={deleteTodoHandler}
						/>
					{/each}
				{/if}
			</div>
		</svelte:fragment>
	</SplitPane>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todos-page {
		background-color: $base-color;

		:global(.split-pane) {
			@include full-screen-height;
		}

		.parent-stack {
			@include column;
			@include styled-scrollbar;
			padding: $normal-size;
			overflow-y: auto;
			max-height: 100vh;

			img {
				margin-top: $narrow-size;
				margin-bottom: $narrow-size;
				rotate: 180deg;
				@include icon-normal-sized;
			}
		}

		.selected-todo-children {
			padding: $normal-size;
			@include responsive-grid(300px);
		}
	}
</style>
