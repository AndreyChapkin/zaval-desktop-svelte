<script lang="ts">
	import { TodoStatus, type Todo, type TodoHierachy } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';

	// data
	export let todo: TodoHierachy;
	export let selectedTodo: Todo | null = null;
	export let selectedClass: string = '';
	let isOpen: boolean = false;
	$: isSelected = selectedTodo && todo.id === selectedTodo.id;

	// events
	type EventType = {
		select: number;
		rightClick: { todo: TodoHierachy; x: number; y: number };
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const issueSelectEvent = () => dispatch('select', todo.id);
	const issueRightClickEvent = (e: MouseEvent) => {
		if (e.ctrlKey) {
			const detail = {
				todo: todo,
				x: e.clientX,
				y: e.clientY
			};
			dispatch('rightClick', detail);
			e.preventDefault();
			e.stopPropagation();
		}
	};
	const handleClick = () => {
		isOpen = !isOpen;
	};

	// helpers
	function statusImageUrl(status: TodoStatus): string {
		switch (status) {
			case TodoStatus.IN_PROGRESS:
				return '/todo-status/in_progress.svg';
			case TodoStatus.NEED_ATTENTION:
				return '/todo-status/need_attention.svg';
			default:
				return '/todo-status/on_hold.svg';
		}
	}
</script>

<div class="todo-item-container">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class={`todo-item ${isSelected ? 'todo-item-selected' : ''} ${
			isOpen ? 'todo-item-opened' : ''
		}`}
		on:click={issueSelectEvent}
		on:contextmenu={issueRightClickEvent}
	>
		{#if todo.childs?.length > 0}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="expander"
				on:click|stopPropagation={handleClick}
			>
				<img
					src="expander/expander-arrow.svg"
					alt="arrow"
				/>
			</div>
		{/if}

		<div class="todo-status-image">
			<img
				src={statusImageUrl(todo.status)}
				alt="status"
			/>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div>
			{todo.name}
		</div>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class={`todo-children ${isOpen ? '' : 'todo-hidden-children'}`}>
		{#each todo.childs as child (child.id)}
			<svelte:self
				{selectedTodo}
				{selectedClass}
				on:rightClick
				on:select
				todo={child}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-item {
		@include dark-component;
		@include row;
		@apply mb-1 space-x-2 p-1 cursor-pointer;

		.expander {
			@apply pr-1 border-r-2 border-white;

			img {
				@include icon-normal-sized;
				transition: rotate 300ms;
			}
		}
	}

	.todo-item-opened {
		.expander {
			img {
				rotate: 180deg;
			}
		}
	}

	.todo-item-selected {
		@include attractive-component;
	}

	.todo-status-image img {
		@include icon-normal-sized;
	}

	.todo-children {
		@apply pl-4;
	}

	.todo-hidden-children {
		display: none;
	}
</style>
