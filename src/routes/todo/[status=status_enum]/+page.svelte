<script lang="ts">
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import TodoCard from '../components/TodoCard.svelte';
	import PrimitiveCard from './components/PrimitiveCard.svelte';
	import StatusSwitcher from './components/StatusSwitcher.svelte';

	// // state
	export let data: TodosWithStatusPageData;
	$: todosList = data.todosList.todos;
	$: parentsMap = data.todosList.parentBranchesMap;
	$: chosenStatus = data.status;
</script>

<div class="todos-with-status">
	<StatusSwitcher {chosenStatus} />
	<div class="all-todos">
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
</div>

<style lang="scss">
	@import '/static/style/common/color';
	@import '/static/style/common/size';
	@import '/static/style/common/facade';
	@import '/static/style/common/composition';
	@import '/static/style/todo-variables.scss';

	.todos-with-status {
		padding: $wide-size;
		height: 100vh;
		@include column;

		.all-todos {
			@include scrollable;
			@include column;
			box-sizing: border-box;
		}
		
		@media (min-width: 768px) {
			.all-todos {
				max-width: 60%;
			}
		}

		.main-todo-and-parents {
			margin-bottom: $normal-size;
		}

		.parents {
			overflow-x: auto;
			margin-bottom: $normal-size;
			@include row($normal-size);
			@include styled-scrollbar(transparent);
			box-sizing: border-box;
			max-width: 90vw;
		}

		@media (min-width: 1080px) {
			.parents {
				max-width: 95vw;
			}
		}

		@media (max-width: 540px) {
			.parents {
				max-width: 80vw;
			}
		}

		:global(.primitive-card) {
			min-width: 250px;
			max-width: 450px;
		}
	}
</style>
