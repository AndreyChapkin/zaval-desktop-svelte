<script lang="ts">
	import { createTodo, deleteTodo, updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type { CreateTodoDto, SaveHistoryDto, UpdateTodoData } from '$lib/types/todo';
	import { EXPANDER_ARROW_ICON_URL, ROOT_MENU_ICON_URL } from '$lib/utils/assets-references';
	import { returnAllParents } from '$lib/utils/todo-helpers';
	import SplitPane from '../../components/SplitPane.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoHistory from './components/TodoHistory.svelte';

	// state
	export let data: TodoDetailedPageData;
	let movindTodo: string | null;
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
		const createdTodo = await createTodo(createTodoEvent.detail);
		// TODO: make slighter
		window.location.href = `/todo/${createdTodo.id}`;
	};

	const deleteTodoHandler = async (deleteTodoEvent: CustomSvelteEvent<number>) => {
		await deleteTodo(deleteTodoEvent.detail);
		// TODO: make slighter
		window.location.href = '/todo';
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

<div class="todo-details">
	{#if movindTodo}
		<div class="moving-todo">{movindTodo}</div>
	{/if}
	<SplitPane>
		<svelte:fragment slot="left">
			{#if !data.isRoot}
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
			{:else}
				<div class="root-logo">
					<img
						src={ROOT_MENU_ICON_URL}
						alt="root"
					/>
				</div>
			{/if}
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

	.todo-details {
		background-color: $base-color;

		:global(.split-pane) {
			@include full-screen-height;
		}

		.root-logo {
			padding: $wide-size;
			@include content-centered;
			height: 100%;

			img {
				@include icon-super-large-sized;
			}
		}

		.left-dock {
			height: 100%;
			@include column-justifyied;

			.todo-top-branch {
				padding: $wide-size;
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
				padding: $wide-size;
				@include responsive-grid(300px, $x-gap: $large-size, $y-gap: $wide-size);
			}
		}
	}
</style>
