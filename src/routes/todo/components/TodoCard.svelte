<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type TodoDto, type TodoHierachyDto } from '$lib/types/todo';
	import { EDIT_ICON_URL, TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { chooseStatusClass } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import TodoMenu from '../[[id=digital]]/components/TodoMenu.svelte';
	import MovingTodoPanel from '../[[id=digital]]/components/MovingTodoPanel.svelte';

	// state
	export let todo: TodoHierachyDto | TodoDto;
	export let parentTodo: TodoHierachyDto | null = null;
	let isMenuOpen = false;
	let isMoveMenuOpen = false;
	export let externalClass = '';
	export let isNavigable: boolean = true;

	$: statusClass = chooseStatusClass(todo.status);

	// events
	type EventType = {
		select: TodoHierachyDto | TodoDto;
		visit: TodoHierachyDto;
		rightClick: { todo: TodoHierachyDto; x: number; y: number };
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
		min-height: 10 * $normal-size;
		background-color: $base-light-color;
		color: $base-contrast-color;
		padding: $normal-size;
		position: relative;
		overflow: hidden;

		@include row;
		border-radius: $normal-size;

		.todo-interaction-panel {
			padding: $normal-size $normal-size $small-size 0px;
			@include bordered(right, $base-contrast-color, $border-small-size);
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
			margin-bottom: $small-size;
			top: -$normal-size;
			left: -$normal-size;

			position: absolute;
		}

		.todo-info {
			padding-left: $wide-size;

			@apply flex-1;
			@include column-justifyied;

			.todo-priority {
				font-size: smaller;
				color: $base-weak-contrast-color;
			}
		}
	}

	.done-status {
		background-color: $done-status-color;
	}
	.backlog-status {
		background-color: $backlog-status-color;
	}
	.will-be-back-status {
		background-color: $will-be-back-status-color;
	}
	.ping-me-status {
		background-color: $ping-me-status-color;
	}

	.next-to-take-status {
		background-color: $next-to-take-status-color;
	}

	.in-progress-status {
		background-color: $in-progress-status-color;
	}
</style>
