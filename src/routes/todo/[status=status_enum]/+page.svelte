<script lang="ts">
	import SplitPane from './../../components/SplitPane.svelte';
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import type { TodoHierachyDto } from '$lib/types/todo';
	import TodoCard from '../components/TodoCard.svelte';

	// import { createTodo, deleteTodo, updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	// import type { CustomSvelteEvent } from '$lib/types/general';
	// import type { TodoDetailedPageData } from '$lib/types/pages-data';
	// import type {
	// 	CreateTodoDto,
	// 	SaveHistoryDto,
	// 	TodoHierachyDto,
	// 	UpdateTodoData
	// } from '$lib/types/todo';
	// import { EXPANDER_ARROW_ICON_URL, ROOT_MENU_ICON_URL } from '$lib/utils/assets-references';
	// import { returnAllParents } from '$lib/utils/todo-helpers';
	// import SplitPane from '../../components/SplitPane.svelte';
	// import SideMenu from './components/SideMenu.svelte';
	// import TodoCard from './components/TodoCard.svelte';
	// import TodoHistory from './components/TodoHistory.svelte';

	// // state
	export let data: TodosWithStatusPageData;
	// $: parentTodos = returnAllParents(data.todoHierachyDto);
	// $: selectedTodo = data.todoHierachyDto;

	// // handlers
	// const updateTodoHandler = async (saveTodoEvent: CustomSvelteEvent<UpdateTodoData>) => {
	// 	const updateData = saveTodoEvent.detail;
	// 	await updateTodo(updateData.id, updateData.updatedTodoDto);
	// 	// TODO: make slighter
	// 	window.location.reload();
	// };

	// const createTodoHandler = async (createTodoEvent: CustomSvelteEvent<CreateTodoDto>) => {
	// 	await createTodo(createTodoEvent.detail);
	// 	// TODO: make slighter
	// 	window.location.reload();
	// };

	// const deleteTodoHandler = async (deleteTodoEvent: CustomSvelteEvent<number>) => {
	// 	await deleteTodo(deleteTodoEvent.detail);
	// 	// TODO: make slighter
	// 	window.location.href = '/todo';
	// };

	// const historySaveHandler = async (saveHistoryEvent: CustomSvelteEvent<SaveHistoryDto>) => {
	// 	const saveHistoryDto = saveHistoryEvent.detail;
	// 	const savedTodoHistoryDto = await updateTodoHistory(saveHistoryDto.todoId, saveHistoryDto);
	// 	data = {
	// 		...data,
	// 		todoHistoryRecords: savedTodoHistoryDto.records
	// 	};
	// };
	function extractAllParents(todoHierarchyDto: TodoHierachyDto) {
		let parents = [] as TodoHierachyDto[];
		let curParent = todoHierarchyDto.parent;
		while (curParent) {
			parents.push(curParent);
			curParent = curParent.parent;
		}
		return parents;
	}
</script>

<div class="todos-with-status">
	<div class="main-todos">
		{#each data.todoHierarchyDtos as todoHierarchyDto}
			<div class="main-todo">
				<TodoCard todo={todoHierarchyDto} />
			</div>
			<div class="parent-todos">
				{#each extractAllParents(todoHierarchyDto) as parent}
					<TodoCard todo={parent} size="small" />
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todos-with-status {
		@include full-screen-height;
		@include styled-scrollbar;
		overflow-y: auto;
		padding: 8px;

		.main-todo {
			margin-bottom: 4px;
		}

		:global(.todo-card) {
			min-width: 450px;
			max-width: 500px;
		}

		.main-todo {
			:global(.todo-card) {
				@include attractive-component;
				
				&:hover {
					box-shadow: 6px 4px 0px 0px rgba(185, 171, 196, 0.6);
					translate: -2px -2px;
				}
			}
		}

		.parent-todos {
			@include row(10px);
			@include styled-scrollbar(transparent);
			overflow-x: auto;
			max-width: 90vw;
			margin-left: 20px;
			margin-bottom: 20px;
		}
	}
</style>
