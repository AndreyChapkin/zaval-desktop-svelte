<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type TodoHierachyDto } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { chooseStatusClass } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import TodoMenu from './TodoMenu.svelte';

	// state
	export let todo: TodoHierachyDto;
	export let isSelected: boolean = false;
	let isMenuOpen = false;

	$: statusClass = chooseStatusClass(todo.status);

	// events
	type EventType = {
		select: TodoHierachyDto;
		visit: TodoHierachyDto;
		rightClick: { todo: TodoHierachyDto; x: number; y: number };
	};
	const dispatch = createEventDispatcher<EventType>();
	const cardClickHandler = () => dispatch('select', todo);

	// handlers
	const backgroundClickHandler = () => (isMenuOpen = false);
	const specificRightClickHandler = (e: MouseEvent) => {
		if (e.ctrlKey) {
			isMenuOpen = true;
			e.preventDefault();
			e.stopPropagation();
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class={`todo-card ${statusClass}`}
	class:todo-card-selected={isSelected}
	on:click={cardClickHandler}
	on:contextmenu={specificRightClickHandler}
>
	<div
		class="todo-complex-image"
	>
		<a href={`/fresh-todo/${todo.id === ROOT_TODO_HIERARCHY.id ? '' : todo.id}`}>
			<img
				src={TODO_COMPLEX_ICON_URL}
				alt="composition"
			/>
		</a>
	</div>
	<!-- <img
		src={statusImageUrl(todo.status)}
		alt="status"
	/> -->
	<div class="todo-name">
		{todo.name}
	</div>
	{#if isMenuOpen}
		<TodoMenu
			todoHierarchyDto={todo}
			on:update
			on:create
			on:delete
			on:backgroundClick={backgroundClickHandler}
		/>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';
	@import '/static/style/todo-variables.scss';

	.todo-card {
		@include row;
		@include dark-component;
		@apply p-2 space-x-2;
		@apply border-l-8;
		border-radius: 5px 0px 0px 15px;

		.todo-complex-image {
			@include bordered(right, $base-light-color, $border-narrow-size);
			@apply pr-2;

			img {
				@include icon-large-sized;
			}
		}

		.todo-name {
			@apply flex-1;
		}

		img {
			@include icon-large-sized;
		}
	}

	.done-status {
		border-color: $done-status-color;
	}
	.backlog-status {
		border-color: $backlog-status-color;
	}
	.will-be-back-status {
		border-color: $will-be-back-status-color;
	}
	.ping-me-status {
		border-color: $ping-me-status-color;
	}
	.in-progress-status {
		border-color: $in-progress-status-color;
	}

	.todo-card-selected {
		@include attractive-component;
	}
</style>
