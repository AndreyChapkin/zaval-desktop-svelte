<script lang="ts">
	import { ROOT_TODO_HIERARCHY, STAB_TODO_HIERARCHY, type TodoHierachy } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { statusImageUrl } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import TodoMenu from './TodoMenu.svelte';

	// state
	export let todo: TodoHierachy = STAB_TODO_HIERARCHY;
	export let isSelected: boolean = false;
	let isMenuOpen = false;
	let menuX = 0;
	let menuY = 0;

	// events
	type EventType = {
		select: TodoHierachy;
		open: TodoHierachy;
		rightClick: { todo: TodoHierachy; x: number; y: number };
	};
	const dispatch = createEventDispatcher<EventType>();
	const issueSelectEvent = () => dispatch('select', todo);
	const issueOpenEvent = () => dispatch('open', todo);

	// handlers
	const backgroundClickHandler = () => (isMenuOpen = false);
	const specificRightClickHandler = (e: MouseEvent) => {
		if (e.ctrlKey) {
			isMenuOpen = true;
			menuX = e.clientX;
			menuY = e.clientY;
			e.preventDefault();
			e.stopPropagation();
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="todo-card"
	class:todo-card-selected={isSelected}
	on:click={issueSelectEvent}
	on:contextmenu={specificRightClickHandler}
>
	{#if todo.isComplex}
		<div
			class="todo-complex-image"
			on:click={issueOpenEvent}
		>
			<a href={`/fresh-todo/${todo.id === ROOT_TODO_HIERARCHY.id ? "" : todo.id}`}
				><img
					src={TODO_COMPLEX_ICON_URL}
					alt="composition"
				/></a
			>
		</div>
	{/if}
	<img
		src={statusImageUrl(todo.status)}
		alt="status"
	/>
	<div class="todo-name">
		{todo.name}
	</div>
	{#if isMenuOpen}
		<TodoMenu
			{todo}
			on:save
			on:create
			on:delete
			on:backgroundClick={backgroundClickHandler}
		/>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-card {
		@include row;
		@include dark-component;
		@apply p-2 space-x-2;

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

	.todo-card-selected {
		@include attractive-component;
	}
</style>
