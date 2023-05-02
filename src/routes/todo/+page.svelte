<script lang="ts">
	import { TODO_ITEM_PARAM, TODO_PRESENTATION_PARAM } from '$lib/api/param/todo-params';
	import { TodoPageMode, type Todo, type TodoHierachy, TodoStatus } from '$lib/types/todo';
	import { callGet } from '$lib/utils/call-helpers';
	import SplitPane from '../components/SplitPane.svelte';
	import TodoInfo from './components/TodoInfo.svelte';
	import TodoList from './components/TodoList.svelte';

	// data
	export let data: { todos: TodoHierachy[] };
	const STAB_TODO: Todo = {
		id: -100,
		name: 'nothing',
		info: '-',
		status: TodoStatus.ON_HOLD,
		parent: null
	};
	let selectedTodo: Todo = STAB_TODO;
	let mode: TodoPageMode = TodoPageMode.ALL_TASKS;
	// $: visibleTasks =
	// 	mode === TodoPageMode.ALL_TASKS
	// 		? data.todos
	// 		: data.todos.filter((i) => i.status === TodoStatus.IN_PROGRESS);

	// handlers
	const selectHandler = (selectEvent: CustomEvent<number>) => {
		let selectedTodoId = selectEvent.detail;
		callGet<Todo>('/api/todo', {
			[TODO_PRESENTATION_PARAM]: 'ITEM',
			[TODO_ITEM_PARAM]: selectedTodoId
		}).then((res) => {
			selectedTodo = res.data.data;
		});
	};
	const swithModeHandler = () => {
		mode =
			mode === TodoPageMode.ALL_TASKS ? TodoPageMode.IN_PROGRESS_TASKS : TodoPageMode.ALL_TASKS;
	};
	const saveChangesHandler = async (saveChangesEvent: CustomEvent<Todo>) => {
		// callPatch<Todo>('/api/todo', saveChangesEvent.detail).then((res) => {
		// callGet<TodoHierachy[]>('/api/todo', {
		// 	[TODO_PRESENTATION_PARAM]: 'HIERARCHY'
		// }); //.then(res => data.todos = res.data);
		// const patchedTodo = res.data;
		// const patchedIndex = data.todos.findIndex((i) => i.id === patchedTodo.id);
		// data.todos[patchedIndex] = patchedTodo;
		// });
	};
</script>

<div class="todos-page">
	<button on:click={swithModeHandler}>Switch mode</button>
	<SplitPane class="todos-workbench">
		<div
			slot="left"
			class="workbanch-left"
		>
			<TodoList
				todos={data.todos}
				on:select={selectHandler}
			/>
		</div>
		<div
			slot="right"
			class="workbanch-right"
		>
			{#key selectedTodo.id}
				<TodoInfo
					todo={selectedTodo}
					on:save={saveChangesHandler}
				/>
			{/key}
		</div>
	</SplitPane>
</div>

<style lang="postcss">
	.todos-page {
		height: 100vh;
		@apply border-red-500 border-2;
	}
	:global(.todos-workbench) {
		/* width: calc(100vw - (100vw - 100%)); */
		@apply border-green-500 border-2;
	}
</style>
