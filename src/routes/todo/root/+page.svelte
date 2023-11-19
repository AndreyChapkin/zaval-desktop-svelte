<script lang="ts">
	import type { TodoRootPageData } from '$lib/types/pages-data';
	import TodoMenu from '../[id=digital]/components/TodoMenu.svelte';
	import TodoCard from '../components/TodoCard.svelte';

	// state
	export let data: TodoRootPageData;
	let rootTodos = data.rootLightTodos;
	let recentTodos = data.recentLightTodos;
	let oldTodos = data.oldLightTodos;
	let createInRootMenuIsOpen = false;

	// handlers
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="root-todo-page">
	<div class="root-todos">
		<div class="root-control-panel">
			<button
				on:click={() => (createInRootMenuIsOpen = true)}
				class="standard-button">Add task</button
			>
		</div>
		<div class="block">
			<div class="block-title">Root:</div>
			<div class="block-body">
				{#each rootTodos as rootTodo}
					<TodoCard todo={rootTodo} />
				{/each}
			</div>
		</div>
	</div>
	<div class="dated-todos">
		<div class="recent-todos block">
			<div class="block-title">Recent:</div>
			<div class="block-body">
				{#each recentTodos as recentTodo}
					<TodoCard todo={recentTodo} />
				{/each}
			</div>
		</div>
		<div class="old-todos block">
			<div class="block-title">Old:</div>
			<div class="block-body">
				{#each oldTodos as oldTodo}
					<TodoCard todo={oldTodo} />
				{/each}
			</div>
		</div>
	</div>
	{#if createInRootMenuIsOpen}
		<TodoMenu
			on:close={() => (createInRootMenuIsOpen = false)}
			todoDto={null}
		/>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.root-todo-page {
		flex: 1;
		height: 100vh;
		padding: $normal-size;

		@include row;

		button {
			@include standard-button;
		}

		.block {
			padding: $normal-size;
			min-height: 0;
			@include column($normal-size);

			.block-title {
				color: $base-contrast-color;
			}

			.block-body {
				@include scrollable-in-column;
			}

			:global(.block-body > div) {
				margin-bottom: $large-size;
			}
		}

		.root-todos {
			flex: 2;
			padding: $normal-size;
			@include column;

			.root-control-panel {
				padding: $wide-size;
			}

			.block {
				min-height: 0;
			}
		}

		.dated-todos {
			flex: 3;
			@include column;
		}
	}
</style>
