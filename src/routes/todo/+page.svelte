<script lang="ts">
	import { TODO_ITEM_PARAM, TODO_PRESENTATION_PARAM } from '$lib/api/param/todo-params';
	import {
		TodoPageMode,
		type Todo,
		type TodoHierachy,
		TodoStatus,
		TODO_PRESENTATIONS,
		STAB_TODO,
		type UpdateTodoAction,
		type CustomSvelteEvent
	} from '$lib/types/todo';
	import { callDelete, callGet, callPatch, callPost } from '$lib/utils/call-helpers';
	import SplitPane from '../components/SplitPane.svelte';
	import TodoInfo from './components/TodoInfo.svelte';
	import TodoList from './components/TodoList.svelte';
	import type { SaveInfoEventPayload } from './components/types';

	// data
	export let data: { todos: TodoHierachy[] };
	let selectedTodo: Todo = STAB_TODO;
	let mode: TodoPageMode = TodoPageMode.ALL_TASKS;

	// handlers
	const updateTodoHandler = async (saveTodoEvent: any) => {
		const editedTodo = saveTodoEvent.detail;
		const updateTodoAction: UpdateTodoAction = {
			type: 'general',
			todo: editedTodo
		};
		await callPatch<Todo>('/api/todo', updateTodoAction);
		// refetch all hierachies
		await refetchTodos();
	};
	const updateTodoInfoHandler = async (
		saveTodoInfoEvent: CustomSvelteEvent<SaveInfoEventPayload>
	) => {
		const saveInfoPayload = saveTodoInfoEvent.detail;
		saveInfoPayload.saveCallbackStarter(async (saveInfo) => {
			const updateTodoInfoAction: UpdateTodoAction = {
				type: 'info',
				todo: saveInfo
			};
			const response = await callPatch<Todo>('/api/todo', updateTodoInfoAction);
			return response.data.data;
		});
	};
	const createTodoHandler = async (createEvent: any) => {
		const todo = createEvent.detail;
		await callPost('/api/todo', todo);
		// refetch all hierachies
		await refetchTodos();
	};
	const deleteTodoHandler = async (deleteEvent: any) => {
		const todo = deleteEvent.detail;
		await callDelete('/api/todo', todo);
		// refetch all hierachies
		await refetchTodos();
	};
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

	// other
	const refetchTodos = async () => {
		const res = await callGet<TodoHierachy[]>('/api/todo', {
			[TODO_PRESENTATION_PARAM]: 'HIERARCHY'
		});
		const changedHierarchy = res.data.data;
		data = {
			todos: changedHierarchy
		};
	};
</script>

<div class="todos-page">
	<!-- <button on:click={swithModeHandler}>Switch mode</button> -->
	<SplitPane class="todos-workbench">
		<svelte:fragment slot="left">
			<TodoList
				todos={data.todos}
				{selectedTodo}
				on:save={updateTodoHandler}
				on:create={createTodoHandler}
				on:delete={deleteTodoHandler}
				on:select={selectHandler}
			/>
		</svelte:fragment>
		<svelte:fragment slot="right">
			{#key selectedTodo.id}
				<TodoInfo
					on:save={updateTodoInfoHandler}
					todo={selectedTodo}
				/>
			{/key}
		</svelte:fragment>
	</SplitPane>
</div>

<style lang="scss">
	.todos-page {
	}
</style>
