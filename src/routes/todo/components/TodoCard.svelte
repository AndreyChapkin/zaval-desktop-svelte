<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type DetailedTodoDto, type LightTodoDto } from '$lib/types/todo';
	import { EDIT_ICON_URL, TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { chooseStatusClass } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import TodoMenu from '../[[id=digital]]/components/TodoMenu.svelte';
	import MovingTodoPanel from '../[[id=digital]]/components/MovingTodoPanel.svelte';

	// state
	export let todo: DetailedTodoDto | LightTodoDto;
	let isMenuOpen = false;
	let isMoveMenuOpen = false;
	export let externalClass = '';
	export let isNavigable: boolean = true;

	$: statusClass = chooseStatusClass(todo.status);
	$: secondaryStatusClass = `${statusClass}-secondary`;

	// events
	type EventType = {
		select: DetailedTodoDto | LightTodoDto;
		visit: DetailedTodoDto;
		rightClick: { todo: DetailedTodoDto; x: number; y: number };
	};
	const dispatch = createEventDispatcher<EventType>();
	const cardClickHandler = () => dispatch('select', todo);

	// handlers

	const backgroundClickHandler = () => {
		isMenuOpen = false;
	};
	const editClickHandler = (e: MouseEvent) => {
		isMenuOpen = true;
	};
	const moveHandler = () => {
		isMoveMenuOpen = true;
	};
	const moveMenuCloseHandler = () => {
		isMoveMenuOpen = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={`todo-card ${externalClass}`}>
	<div class={`todo-status-indicator ${statusClass}`} />
	<div class={`todo-status-indicator-secondary ${secondaryStatusClass}`} />
	<div class="todo-interaction-panel">
		{#if isNavigable}
			<div
				class="go-to-todo"
				on:click={cardClickHandler}
			>
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
		<div class="edit-menu">
			<img
				src={EDIT_ICON_URL}
				alt="composition"
				on:click={editClickHandler}
			/>
		</div>
	</div>
	<div class="todo-info">
		<div class="todo-name">
			{todo.name}
		</div>
		<div class="todo-priority">
			{todo.priority}
		</div>
	</div>
	{#if isMenuOpen}
		<TodoMenu
			todoDto={todo}
			on:move={moveHandler}
			on:close={backgroundClickHandler}
		/>
	{/if}
	{#if isMoveMenuOpen}
		<MovingTodoPanel
			movingTodoDto={todo}
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
		padding: $normal-size $normal-size;
		position: relative;
		overflow: hidden;

		@include row-start;
		border-radius: $normal-size;

		.todo-interaction-panel {
			z-index: 3;
			background-color: lighten($base-light-color, 10%);
			border-radius: 1.5 * $normal-size;
			padding: 0.8 * $normal-size;
			@include column-centered($normal-size);

			.go-to-todo,
			.edit-menu {
				@include like-normal-button;
			}
		}

		.todo-status-indicator {
			width: 3 * $normal-size;
			height: 3 * $normal-size;
			border-radius: 2 * $normal-size;
			top: 0 * $normal-size;
			left: -1 * $normal-size;

			position: absolute;
			z-index: 2;
		}

		.todo-status-indicator-secondary {
			width: 10 * $normal-size;
			height: 10 * $normal-size;
			border-radius: 6 * $normal-size;
			top: -5 * $normal-size;
			left: -5 * $normal-size;
			position: absolute;
			z-index: 1;
		}

		.todo-info {
			padding-left: $wide-size;
			z-index: 3;

			@apply flex-1;
			@include column-justifyied;

			.todo-priority {
				font-size: smaller;
				color: $base-weak-contrast-color;
			}
		}
	}

	$secondary-status-adjust-percent: -0.7;

	.done-status {
		background-color: $done-status-color;
	}
	.done-status-secondary {
		background-color: adjust-color($done-status-color, $alpha: $secondary-status-adjust-percent);
	}

	.backlog-status {
		background-color: $backlog-status-color;
	}
	.backlog-status-secondary {
		background-color: adjust-color($backlog-status-color, $alpha: $secondary-status-adjust-percent);
	}

	.will-be-back-status {
		background-color: $will-be-back-status-color;
	}
	.will-be-back-status-secondary {
		background-color: adjust-color($will-be-back-status-color, $alpha: $secondary-status-adjust-percent);
	}

	.ping-me-status {
		background-color: $ping-me-status-color;
	}
	.ping-me-status-secondary {
		background-color: adjust-color($ping-me-status-color, $alpha: $secondary-status-adjust-percent);
	}

	.next-to-take-status {
		background-color: $next-to-take-status-color;
	}
	.next-to-take-status-secondary {
		background-color: adjust-color($next-to-take-status-color, $alpha: $secondary-status-adjust-percent);
	}

	.in-progress-status {
		background-color: $in-progress-status-color;
	}
	.in-progress-status-secondary {
		background-color: adjust-color($in-progress-status-color, $alpha: $secondary-status-adjust-percent);
	}
</style>
