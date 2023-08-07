<script lang="ts">
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import { todoStatusToLabel } from '$lib/utils/todo-helpers.js';
	import TodoCard from '../components/TodoCard.svelte';

	// // state
	export let data: TodosWithStatusPageData;
</script>

<div class="todos-with-status">
	<div class="todo-status-label">{todoStatusToLabel(data.status)}</div>
	<div class="main-todos">
		{#each data.todoHierarchyDtos as todoHierarchyDto}
			<div class="main-todo">
				<TodoCard todo={todoHierarchyDto} />
			</div>
			<div class="parent-todos">
				{#each todoHierarchyDto.parents ?? [] as parent}
					<TodoCard
						todo={parent}
						size="small"
					/>
				{/each}
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
		background-color: $base-dark-color;

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

		.main-todo {
			margin-bottom: 4px;
		}

		:global(.todo-card) {
			min-width: 450px;
			max-width: 500px;
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
