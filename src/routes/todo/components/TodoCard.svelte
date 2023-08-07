<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type TodoHierachyDto } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { chooseStatusClass } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import TodoMenu from '../[[id=digital]]/components/TodoMenu.svelte';
	import MovingTodoPanel from '../[[id=digital]]/components/MovingTodoPanel.svelte';

	// state
	export let todo: TodoHierachyDto;
	export let parentTodo: TodoHierachyDto | null = null;
	let isMenuOpen = false;
	let isMoveMenuOpen = false;
	export let size: 'small' | 'normal' | 'large' = 'normal';
	export let type: 'interactive' | 'simple' = 'interactive';

	$: statusClass = chooseStatusClass(todo.status);
	$: sizeClass = `${size}-todo`;

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
	const moveHandler = () => {
		isMoveMenuOpen = true;
	};
	const moveMenuCloseHandler = () => {
		isMoveMenuOpen = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class={`todo-card ${statusClass} ${sizeClass}`}
	on:click={cardClickHandler}
	on:contextmenu={specificRightClickHandler}
>
	<div class="todo-name">
		{todo.name}
	</div>
	{#if type === 'interactive'}
		<div class="go-to-todo">
			<a href={`/todo/${todo.id === ROOT_TODO_HIERARCHY.id ? '' : todo.id}`}>
				<div class="link-area">
					<img
						src={TODO_COMPLEX_ICON_URL}
						alt="composition"
					/>
				</div>
			</a>
		</div>
	{/if}
	{#if isMenuOpen}
		<TodoMenu
			todoHierarchyDto={todo}
			on:update
			on:create
			on:move={moveHandler}
			on:delete
			on:backgroundClick={backgroundClickHandler}
		/>
	{/if}
	{#if isMoveMenuOpen}
		<MovingTodoPanel
			movingTodoDto={todo}
			potentialNewParentDto={parentTodo}
			on:close={moveMenuCloseHandler}
		/>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/todo-variables.scss';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/common/size/';
	@import '/static/style/common/color/';

	.todo-card {
		background-color: $base-light-color;
		color: $base-contrast-color;

		@include row;		
		@apply p-2 space-x-2;
		@include bordered(left, $size: $border-wide-size);
		border-radius: $normal-size;

		.go-to-todo {
			@include bordered(left, $base-contrast-color, $border-small-size);
			@apply pl-2;

			.link-area {
				height: 100%;
			}
		}

		.todo-name {
			@apply flex-1;
		}
	}

	.small-todo {
		font-size: small;
		font-weight: bold;
		img {
			@include icon-normal-sized;
		}
	}

	.normal-todo {
		font-size: medium;
		img {
			@include icon-large-sized;
		}
	}

	.large-todo {
		font-size: large;
		img {
			@include icon-super-large-sized;
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

	.next-to-take-status {
		border-color: $next-to-take-status-color;
	}

	.in-progress-status {
		border-color: $in-progress-status-color;
	}
</style>
