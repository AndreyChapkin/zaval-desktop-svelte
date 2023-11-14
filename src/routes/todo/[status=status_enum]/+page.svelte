<script lang="ts">
	import { getTodoHeavyDetails } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import type { DetailedTodoDto, LightTodoDto, TodoHeavyDetailsDto } from '$lib/types/todo';
	import RichText from '../../components/RichText.svelte';
	import TodoHistory from '../[id=digital]/components/TodoHistory.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import SplitPane from './../../components/SplitPane.svelte';
	import PrimitiveCard from './components/PrimitiveCard.svelte';
	import StatusSwitcher from './components/StatusSwitcher.svelte';

	// state
	export let data: TodosWithStatusPageData;
	let chosenTodo: LightTodoDto | DetailedTodoDto | null;
	let chosenTodoHeavyDetails: TodoHeavyDetailsDto | null;
	$: todosList = data.todosList.todos;
	$: parentsMap = data.todosList.parentBranchesMap;
	$: chosenStatus = data.status;

	// reactive
	$: {
		if (chosenTodo) {
			getTodoHeavyDetails(chosenTodo.id).then((data) => {
				chosenTodoHeavyDetails = data;
			});
		} else {
			chosenTodoHeavyDetails = null;
		}
	}

	// handlers
	const selectTodoHandler = async (
		selectTodoEvent: CustomSvelteEvent<DetailedTodoDto | LightTodoDto>
	) => {
		const selectedTodoDto = selectTodoEvent.detail;
		chosenTodo = selectedTodoDto;
	};
</script>

<div class="todos-with-status">
	<StatusSwitcher {chosenStatus} />
	<SplitPane contextName="TodoWithStatusPage-1">
		<div
			slot="first"
			class="todos"
		>
			{#each todosList as todoAndParentBranchIdDto}
				<div class="main-todo-and-parents">
					<TodoCard
						todo={todoAndParentBranchIdDto.todo}
						externalClass="main-todo"
						on:select={selectTodoHandler}
					/>
					{#if todoAndParentBranchIdDto.parentBranchId != null}
						<div class="parents">
							{#each [...parentsMap[todoAndParentBranchIdDto.parentBranchId]].reverse() as parentTodoDto}
								<PrimitiveCard
									todo={parentTodoDto}
									on:select={selectTodoHandler}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<div
			slot="second"
			class="todo-info"
		>
			{#if chosenTodoHeavyDetails && chosenTodo}
				{#key chosenTodo}
					<div class="chosen-todo-name">{chosenTodo.name}</div>
					<SplitPane
						type="vertical"
						contextName="TodoWitStatusPage-2"
					>
						<RichText
							slot="first"
							richText={chosenTodoHeavyDetails.description ?? ""}
						/>
						<TodoHistory
							slot="second"
							todoId={chosenTodo.id}
							records={chosenTodoHeavyDetails.history?.records ?? []}
							viewMode={true}
						/>
					</SplitPane>
				{/key}
			{:else}
				No info
			{/if}
		</div>
	</SplitPane>
</div>

<style lang="scss">
	@import '/static/style/common/color';
	@import '/static/style/common/size';
	@import '/static/style/common/facade';
	@import '/static/style/common/composition';
	@import '/static/style/todo-variables.scss';

	:global(.split-pane) {
		min-height: 0px;
	}

	:global(.primitive-card) {
		min-width: 350px;
	}

	.todos-with-status {
		flex: 1;
		height: 100vh;
		padding: $wide-size;

		@include column;
		min-width: 0px;

		.todos {
			padding-right: $normal-size;
			overflow-y: auto;

			@include styled-scrollbar;

			.main-todo-and-parents {
				@include column;
				min-width: 0px;
				margin-bottom: $large-size;

				.parents {
					@include row($small-size);
					margin-top: $small-size;

					overflow-x: auto;

					@include styled-scrollbar;
				}
			}
		}

		.todo-info {
			@include column;
			padding-left: $normal-size;

			.chosen-todo-name {
				color: $base-contrast-color;
				background-color: $base-color;
				margin: $small-size $normal-size;

				@include standard-container;
			}

			:global(.split-pane) {
				@include scrollable-in-column;
			}
		}
	}
</style>
