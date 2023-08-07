<script lang="ts">
	import { createTodo, deleteTodo, updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type { CreateTodoDto, SaveHistoryDto, UpdateTodoData } from '$lib/types/todo';
	import { directParent, findParentOfInHeirarchy } from '$lib/utils/todo-helpers';
	import SplitPane from '../../components/SplitPane.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoHistory from './components/TodoHistory.svelte';

	// state
	export let data: TodoDetailedPageData;
	$: mainTodo = data.todoHierachyDto;
	$: parentTodos = (mainTodo.parents ?? []).reverse();

	$: shownItems = 'all' as ('1' | '2' | '3')[] | 'all';

	// handlers
	const updateTodoHandler = async (saveTodoEvent: CustomSvelteEvent<UpdateTodoData>) => {
		const updateData = saveTodoEvent.detail;
		await updateTodo(updateData.id, updateData.updatedTodoDto);
		// TODO: make slighter
		window.location.reload();
	};

	const createTodoHandler = async (createTodoEvent: CustomSvelteEvent<CreateTodoDto>) => {
		const createdTodo = await createTodo(createTodoEvent.detail);
		// TODO: make slighter
		window.location.reload();
	};

	const deleteTodoHandler = async (deleteTodoEvent: CustomSvelteEvent<number>) => {
		const parentTodo = findParentOfInHeirarchy(deleteTodoEvent.detail, data.todoHierachyDto);
		await deleteTodo(deleteTodoEvent.detail);
		// TODO: make slighter
		window.location.href = `/todo/${parentTodo?.id ?? ''}`;
	};

	const historySaveHandler = async (saveHistoryEvent: CustomSvelteEvent<SaveHistoryDto>) => {
		const saveHistoryDto = saveHistoryEvent.detail;
		const savedTodoHistoryDto = await updateTodoHistory(saveHistoryDto.todoId, saveHistoryDto);
		data = {
			...data,
			todoHistoryRecords: savedTodoHistoryDto.records
		};
	};
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="todo-details">
	{#if data.isRoot}
		<div class="root-todos">
			{#if mainTodo.children}
				{#each mainTodo.children as child (child.id)}
					<TodoCard
						todo={child}
						parentTodo={mainTodo}
						size="small"
						on:update={updateTodoHandler}
						on:create={createTodoHandler}
						on:delete={deleteTodoHandler}
					/>
				{/each}
			{/if}
		</div>
	{:else}
		<SplitPane
			type="vertical"
			contextName="TodoWithIdPage-0"
			{shownItems}
			class="container-split"
		>
			<SplitPane
				type="horizontal"
				contextName="TodoWithIdPage-1"
				slot="first"
				class="main-split"
			>
				<div
					class="main-todo"
					slot="first"
				>
					<TodoCard
						todo={mainTodo}
						parentTodo={directParent(mainTodo)}
						on:update={updateTodoHandler}
						on:create={createTodoHandler}
						on:delete={deleteTodoHandler}
						type="simple"
					/>
				</div>
				<TodoHistory
					slot="second"
					todoId={data.todoHierachyDto.id}
					records={data.todoHistoryRecords ?? []}
					on:save={historySaveHandler}
				/>
			</SplitPane>
			<SplitPane
				type="horizontal"
				contextName="TodoWithIdPage-2"
				slot="second"
				class="secondary-split"
				><div
					class="parent-todos"
					slot="first"
				>
					{#each parentTodos as todo (todo.id)}
						<div class="arrow">/\</div>
						<TodoCard
							{todo}
							parentTodo={directParent(todo)}
							size="small"
							on:update={updateTodoHandler}
							on:create={createTodoHandler}
							on:delete={deleteTodoHandler}
						/>
					{/each}
				</div>
				<div
					class="children-todos"
					slot="second"
				>
					{#if mainTodo.children}
						{#each mainTodo.children as child (child.id)}
							<div class="arrow">||</div>
							<TodoCard
								todo={child}
								parentTodo={mainTodo}
								size="small"
								on:update={updateTodoHandler}
								on:create={createTodoHandler}
								on:delete={deleteTodoHandler}
							/>
						{/each}
					{/if}
				</div>
			</SplitPane>
		</SplitPane>
	{/if}
</div>

<style lang="scss">
	/* @import '/static/style/variables-mixins.scss'; */
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.todo-details {
		height: 100vh;

		.main-todo,
		.parent-todos,
		.children-todos {
			padding: $wide-size;
		}

		:global(.container-split) {
			:global(.split-separator) {
				background-color: $base-dark-color;
			}
		}

		:global(.container-split > .split-area:first-child) {
			position: relative;
			z-index: 1;
			box-shadow: 3px 5px 5px rgba(0, 0, 0, 0.3);
		}

		:global(.main-split) {
			:global(.split-separator) {
				background-color: $base-color;
			}
		}

		:global(.secondary-split) {
			:global(.split-separator) {
				background-color: $base-color;
			}
		}

		.arrow {
			color: $base-light-color;
			margin-top: $small-size;
			margin-bottom: $small-size;
			margin-left: auto;
			margin-right: auto;
			font-weight: bold;
		}

		.root-todos {
			padding: $wide-size;
			@include responsive-grid(300px, $x-gap: $large-size, $y-gap: $wide-size);
		}

		.parent-todos {
			@include column;
			@include styled-scrollbar;
		}

		.children-todos {
			padding: $wide-size;
			@include column;
		}
	}
</style>
