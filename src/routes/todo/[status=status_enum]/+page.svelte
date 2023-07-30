<script lang="ts">
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import TodoCard from '../components/TodoCard.svelte';

	// // state
	export let data: TodosWithStatusPageData;
</script>

<div class="todos-with-status">
	<div class="title">Statused</div>
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
	@import '/static/style/variables-mixins.scss';

	.title {
		font-size: x-large;
		padding-left: $wide-size;
		color: $base-pale-color;
		border-bottom-width: 4px;
		border-image-slice: 1;
		border-image-source: linear-gradient(to right, $base-pale-color, transparent 50%, transparent);
		margin-bottom: $large-size;
	}

	.todos-with-status {
		@include full-screen-height;
		@include styled-scrollbar;
		overflow-y: auto;
		padding: 8px;

		.main-todo {
			margin-bottom: 4px;
		}

		:global(.todo-card) {
			min-width: 450px;
			max-width: 500px;
		}

		.main-todo {
			:global(.todo-card) {
				@include attractive-component;
			}
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
