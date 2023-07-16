<script lang="ts">
	import { createTodo, deleteTodo, updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type {
		CreateTodoDto,
		SaveHistoryDto,
		UpdateTodoData
	} from '$lib/types/todo';
	import { directParent, findParentOfInHeirarchy } from '$lib/utils/todo-helpers';
	import SplitPane from '../../components/SplitPane.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoHistory from './components/TodoHistory.svelte';

	// state
	export let data: TodoDetailedPageData;
	$: mainTodo = data.todoHierachyDto;
	$: parentTodos = (mainTodo.parents ?? []).reverse();
	

	// handlers
	const updateTodoHandler = async (saveTodoEvent: CustomSvelteEvent<UpdateTodoData>) => {
		alert("hello");
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
		<div class="right-dock">
			<div class="todo-children">
				{#if mainTodo.children}
					{#each mainTodo.children as child (child.id)}
						<TodoCard
							todo={child}
							parentTodo={null}
							on:update={updateTodoHandler}
							on:create={createTodoHandler}
							on:delete={deleteTodoHandler}
						/>
					{/each}
				{/if}
			</div>
		</div>
	{:else}
		<SplitPane>
			<svelte:fragment slot="left">
				<div class="left-dock">
					<div class="todo-top-branch">
						<div class="main-todo">
							<TodoCard
								todo={mainTodo}
								parentTodo={directParent(mainTodo)}
								on:update={updateTodoHandler}
								on:create={createTodoHandler}
								on:delete={deleteTodoHandler}
								isSelected={true}
							/>
						</div>
						<div class="parent-todos">
							{#each parentTodos as todo (todo.id)}
								<div class="arrow">/\</div>
								<TodoCard
									{todo}
									parentTodo={directParent(todo)}
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
						{#if mainTodo.children}
							{#each mainTodo.children as child (child.id)}
								<TodoCard
									todo={child}
									parentTodo={mainTodo}
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
	{/if}
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-details {
		background-color: $base-color;

		:global(.split-pane) {
			@include full-screen-height;
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

					.arrow {
						color: white;
						margin-top: $narrow-size;
						margin-bottom: $narrow-size;
						margin-left: auto;
						margin-right: auto;
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
