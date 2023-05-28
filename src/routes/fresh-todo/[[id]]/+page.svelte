<script lang="ts">
	import type { TodoHierachy } from '$lib/types/todo';
	import { returnWithAllParents } from '$lib/utils/todo-helpers';
	import SplitPane from '../../components/SplitPane.svelte';
	import MovementIndicator from './components/MovementIndicator.svelte';
	import TodoCard from './components/TodoCard.svelte';

	// state
	export let data: { todo: TodoHierachy };
	$: parentTodos = returnWithAllParents(data.todo);
	$: selectedTodo = data.todo;
	let showIndicator = false;
	let forwardIndicator = true;

	// handlers
	// const updateTodoHandler = async (saveTodoEvent: any) => {
	// 	const editedTodo = saveTodoEvent.detail;
	// 	const updateTodoAction: UpdateTodoAction = {
	// 		type: 'general',
	// 		todo: editedTodo
	// 	};
	// 	await callPatch<Todo>('/api/todo', updateTodoAction);
	// 	// refetch all hierachies
	// 	await refetchTodos();
	// };
	// const updateTodoInfoHandler = async (
	// 	saveTodoInfoEvent: CustomSvelteEvent<SaveInfoEventPayload>
	// ) => {
	// 	const saveInfoPayload = saveTodoInfoEvent.detail;
	// 	saveInfoPayload.saveCallbackStarter(async (saveInfo) => {
	// 		const updateTodoInfoAction: UpdateTodoAction = {
	// 			type: 'info',
	// 			todo: saveInfo
	// 		};
	// 		const response = await callPatch<Todo>('/api/todo', updateTodoInfoAction);
	// 		return response.data.data;
	// 	});
	// };
	// const createTodoHandler = async (createEvent: any) => {
	// 	const todo = createEvent.detail;
	// 	await callPost('/api/todo', todo);
	// 	// refetch all hierachies
	// 	await refetchTodos();
	// };
	// const deleteTodoHandler = async (deleteEvent: any) => {
	// 	const todo = deleteEvent.detail;
	// 	await callDelete('/api/todo', todo);
	// 	// refetch all hierachies
	// 	await refetchTodos();
	// };
	// const selectHandler = (selectEvent: CustomEvent<TodoHierachy>) => {
	// 	let payloadTodo = selectEvent.detail;
	// 	const selectedParentIndex = parentTodos.findIndex((i) => i.id === payloadTodo.id);
	// 	selectedTodo = payloadTodo;
	// 	showIndicator = true;
	// 	forwardIndicator = true;
	// 	parentTodos = parentTodos.slice(selectedParentIndex);
	// };
	// const openChildHandler = (selectEvent: CustomEvent<TodoHierachy>) => {
	// 	let payloadTodo = selectEvent.detail;
	// 	parentTodos = [payloadTodo, ...parentTodos];
	// 	selectedTodo = payloadTodo;
	// 	showIndicator = true;
	// 	forwardIndicator = false;
	// };

	// other
	// const refetchTodos = async () => {
	// 	const res = await callGet<TodoHierachy[]>('/api/todo', {
	// 		[TODO_PRESENTATION_PARAM]: 'HIERARCHY'
	// 	});
	// 	const changedHierarchy = res.data.data;
	// 	data = {
	// 		todos: changedHierarchy
	// 	};
	// };
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
						isSelected={todo.id === selectedTodo.id}
					/>
				{/each}
			</div>
		</svelte:fragment>
		<svelte:fragment slot="right">
			<div class="selected-todo-children">
				{#if selectedTodo.children}
					{#each selectedTodo.children as child}
						<TodoCard todo={child} />
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
			padding: $normal-size;

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
