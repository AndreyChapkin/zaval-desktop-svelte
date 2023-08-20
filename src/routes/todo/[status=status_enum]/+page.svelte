<script lang="ts">
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import { todoStatusToLabel } from '$lib/utils/todo-helpers.js';
	import TodoCard from '../components/TodoCard.svelte';
	import PrimitiveCard from './components/PrimitiveCard.svelte';

	// // state
	export let data: TodosWithStatusPageData;
	$: todosList = data.todosList.todos;
	$: parentsMap = data.todosList.parentBranchesMap;
</script>

<div class="todos-with-status">
	<div class="todo-status-label">{todoStatusToLabel(data.status)}</div>
	<div class="main-todos">
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

	.todos-with-status {
		padding: $wide-size;

		@include full-screen-height;
		@include scrollable;

		.todo-status-label {
			font-size: x-large;
			padding-left: $wide-size;
			color: white;
			border-bottom-width: 4px;
			border-image-slice: 1;
			border-image-source: linear-gradient(to right, white, transparent 50%, transparent);
			margin-bottom: $large-size;
		}

		.todos-branch {
			margin-bottom: $large-size;
			padding-bottom: $large-size;
			width: 90vw;
			@include bordered(bottom, $color: $second-light-color);
		}

		.main-todo-and-parents {
			@include row($wide-size);
		}

		.parents {
			overflow-x: auto;
			max-width: 60vw;
			margin-bottom: $normal-size;
			@include row-align-start($normal-size);
			@include styled-scrollbar(transparent);
		}

		.main-todos {
			margin-left: $large-size;
			@include column($large-size);
		}

		:global(.main-todo) {
			min-width: 450px !important;
			max-width: 500px;
		}

		:global(.todo-card) {
			min-width: 150px;
			max-width: 500px;
		}
	}
</style>
