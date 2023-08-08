<script lang="ts">
	import type { TodosWithStatusPageData } from '$lib/types/pages-data';
	import { todoStatusToLabel } from '$lib/utils/todo-helpers.js';
	import SimpleTodoCard from '../components/SimpleTodoCard.svelte';

	// // state
	export let data: TodosWithStatusPageData;
</script>

<div class="todos-with-status">
	<div class="todo-status-label">{todoStatusToLabel(data.status)}</div>
	<div class="main-todos">
		{#each data.branches as branch}
			<div class="todos-branch">
				<div class="parent-todos">
					{#each branch.parents ?? [] as parent}
						<SimpleTodoCard
							todo={parent}
							size="small"
						/>
					{/each}
				</div>
				<div class="leaf-todos">
					{#each branch.leaves ?? [] as leaf}
						<SimpleTodoCard todo={leaf} />
					{/each}
				</div>
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

		.parent-todos {
			overflow-x: auto;
			max-width: 90vw;
			margin-bottom: $normal-size;
			@include row($normal-size);
			@include styled-scrollbar(transparent);
		}

		.leaf-todos {
			margin-left: $large-size;
			@include column($normal-size);
		}

		:global(.todo-card) {
			min-width: 450px;
			max-width: 500px;
		}
	}
</style>
