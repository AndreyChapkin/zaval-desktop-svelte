<script lang="ts">
	import { updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type { DetailedTodoDto, SaveHistoryDto } from '$lib/types/todo';
	import SplitPane from '../../components/SplitPane.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoDescription from './components/TodoDescription.svelte';
	import TodoHistory from './components/TodoHistory.svelte';

	// state
	export let data: TodoDetailedPageData;
	$: mainDetailedTodoDto = data.detailedTodoDto;
	$: parentTodos = (mainDetailedTodoDto.parents ?? []).slice().reverse();

	$: shownItems = 'all' as ('1' | '2' | '3')[] | 'all';

	// handlers
	const todoDescriptionUpdateHandler = (event: CustomSvelteEvent<DetailedTodoDto>) => {
		const updatedDetailedTodoDto = event.detail;
		mainDetailedTodoDto = updatedDetailedTodoDto;
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
			{#if mainDetailedTodoDto.children}
				{#each mainDetailedTodoDto.children as child (child.id)}
					<TodoCard todo={child} />
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
						todo={mainDetailedTodoDto}
						isNavigable={false}
					/>
				</div>
				<TodoDescription
					detailedTodoDto={mainDetailedTodoDto}
					slot="second"
					on:update={todoDescriptionUpdateHandler}
				/>
				<TodoHistory
					slot="third"
					todoId={data.detailedTodoDto.id}
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
						<TodoCard {todo} />
					{/each}
				</div>
				<div
					class="children-todos"
					slot="second"
				>
					{#if mainDetailedTodoDto.children}
						{#each mainDetailedTodoDto.children as child (child.id)}
							<div class="arrow">||</div>
							<TodoCard todo={child} />
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
