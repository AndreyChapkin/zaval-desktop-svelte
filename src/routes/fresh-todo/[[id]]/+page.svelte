<script lang="ts">
	import { createTodo, deleteTodo, updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { CreateTodoDto, SaveHistoryDto, TodoHierachyDto, UpdateTodoData } from '$lib/types/todo';
	import { EXPANDER_ARROW_ICON_URL } from '$lib/utils/assets-references';
	import { returnAllParents } from '$lib/utils/todo-helpers';
	import SplitPane from '../../components/SplitPane.svelte';
	import TodoCard from './components/TodoCard.svelte';
	import TodoHistory from './components/TodoHistory.svelte';
	

	// state
	export let data: { todoHierachyDto: TodoHierachyDto; todoHistoryRecords: string[] | null };
	$: parentTodos = returnAllParents(data.todoHierachyDto);
	$: selectedTodo = data.todoHierachyDto;

	// handlers
	const updateTodoHandler = async (saveTodoEvent: CustomSvelteEvent<UpdateTodoData>) => {
		const updateData = saveTodoEvent.detail;
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

	const historySaveHandler = async (saveHistoryEvent: CustomSvelteEvent<SaveHistoryDto>) => {
		const saveHistoryDto = saveHistoryEvent.detail;
		const savedTodoHistoryDto = await updateTodoHistory(saveHistoryDto.todoId, saveHistoryDto);
		data = {
			...data,
			todoHistoryRecords: savedTodoHistoryDto.records,
		};
	};
</script>

<div class="todos-page">
	<SplitPane>
		<svelte:fragment slot="left">
			<div class="left-dock">
				<div class="todo-top-branch">
					<div class="main-todo">
						<TodoCard
							todo={data.todoHierachyDto}
							on:update={updateTodoHandler}
							on:create={createTodoHandler}
							on:delete={deleteTodoHandler}
							isSelected={true}
						/>
					</div>
					<div class="parent-todos">
						{#each parentTodos as todo (todo.id)}
							<img
								src={EXPANDER_ARROW_ICON_URL}
								alt="arrow"
							/>
							<TodoCard
								{todo}
								on:update={updateTodoHandler}
								on:create={createTodoHandler}
								on:delete={deleteTodoHandler}
							/>
						{/each}
					</div>
				</div>
				<TodoHistory
					todoId={data.todoHierachyDto.id}
					records={data.todoHistoryRecords ?? []}
					on:save={historySaveHandler}
				/>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="right">
			<div class="right-dock">
				<div class="todo-children">
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

		.left-dock {
			height: 100%;
			@include column-justifyied;

			.todo-top-branch {
				padding: $normal-size;
				@apply flex-1;

				.parent-todos {
					@include column;
					@include styled-scrollbar;

					overflow-y: auto;
					max-height: 100vh;

					img {
						margin-top: $narrow-size;
						margin-bottom: $narrow-size;
						rotate: 180deg;
						@include icon-normal-sized;
					}
				}
			}

			:global(.todo-history) {
				height: 250px;

				@include dark-component;
			}
		}

		.right-dock {
			.todo-children {
				padding: $normal-size;
				@include responsive-grid(300px);
			}
		}
	}
</style>
