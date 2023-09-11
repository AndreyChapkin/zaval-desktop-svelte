<script lang="ts">
	import SplitPane from './../../components/SplitPane.svelte';
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import TodoCard from '../components/TodoCard.svelte';
	import PrimitiveCard from './components/PrimitiveCard.svelte';
	import StatusSwitcher from './components/StatusSwitcher.svelte';

	// state
	export let data: TodosWithStatusPageData;
	$: todosList = data.todosList.todos;
	$: parentsMap = data.todosList.parentBranchesMap;
	$: chosenStatus = data.status;
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
					/>
					{#if todoAndParentBranchIdDto.parentBranchId != null}
						<div class="parents">
							{#each [...parentsMap[todoAndParentBranchIdDto.parentBranchId]].reverse() as parentTodoDto}
								<PrimitiveCard todo={parentTodoDto} />
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
			Test dasd asd asd asd asd asd asdasdas
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

				.parents {
					@include row($small-size);
					margin-top: $small-size;
					margin-bottom: $large-size;
					
					overflow-x: auto;

					@include styled-scrollbar;
				}
			}
		}

		.todo-info {
			flex: 1;
			background-color: pink;
		}
	}
</style>
