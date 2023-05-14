<script lang="ts">
	import { STAB_TODO_HIERARCHY, TodoStatus, type TodoHierachy } from '$lib/types/todo';
	import { EXPANDER_ARROW_ICON_URL } from '$lib/utils/assets-references';
	import SplitPane from '../components/SplitPane.svelte';
	import MovementIndicator from './components/MovementIndicator.svelte';
	import TodoCard from './components/TodoCard.svelte';

	// state
	export let data: { todos: TodoHierachy[] };
	const root: TodoHierachy = {
		id: -100,
		name: 'Root',
		status: TodoStatus.ON_HOLD,
		childs: [...data.todos]
	};
	let parentTodos = [root];
	let selectedTodo: TodoHierachy = STAB_TODO_HIERARCHY;
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
	const selectParentHandler = (selectEvent: CustomEvent<TodoHierachy>) => {
		let payloadTodo = selectEvent.detail;
		const selectedParentIndex = parentTodos.findIndex((i) => i.id === payloadTodo.id);
		selectedTodo = payloadTodo;
		showIndicator = true;
		forwardIndicator = true;
		parentTodos = parentTodos.slice(selectedParentIndex);
	};
	const openChildHandler = (selectEvent: CustomEvent<TodoHierachy>) => {
		let payloadTodo = selectEvent.detail;
		parentTodos = [payloadTodo, ...parentTodos];
		selectedTodo = payloadTodo;
		showIndicator = true;
		forwardIndicator = false;
	};

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
						on:select={selectParentHandler}
					/>
					{#if todo.id !== root.id}
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
				{#each selectedTodo.childs as child}
					<TodoCard
						todo={child}
						on:open={openChildHandler}
					/>
				{/each}
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
