<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type TodoDto, type TodoHierachyDto } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { chooseStatusClass } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';

	// state
	export let todo: TodoHierachyDto | TodoDto;
	export let size: 'small' | 'normal' | 'large' = 'normal';

	$: statusClass = chooseStatusClass(todo.status);
	$: sizeClass = `${size}-todo`;

	// events
	type EventType = {
		select: TodoHierachyDto | TodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const selectHandler = () => {
		dispatch('select', todo);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={`simple-todo-card ${sizeClass}`}>
	<div class="todo-info">
		<div class={`todo-status-indicator ${statusClass}`} />
		<div class="todo-name">
			{todo.name}
		</div>
		<div class="todo-priority">
			{todo.priority}
		</div>
	</div>
	<div class="go-to-todo">
		<a
			href={`/todo/${todo.id === ROOT_TODO_HIERARCHY.id ? '' : todo.id}`}
			on:click={selectHandler}
		>
			<div class="link-area">
				<img
					src={TODO_COMPLEX_ICON_URL}
					alt="composition"
				/>
			</div>
		</a>
	</div>
</div>

<style lang="scss">
	@import '/static/style/todo-variables.scss';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/common/size/';
	@import '/static/style/common/color/';

	.simple-todo-card {
		background-color: $base-light-color;
		color: $base-contrast-color;

		@include row;
		@apply p-2 space-x-2;
		border-radius: $normal-size;

		.go-to-todo {
			@include bordered(left, $base-light-color, $border-small-size);
			@apply pl-2;

			.link-area {
				height: 100%;
			}
		}

		.todo-status-indicator {
			width: 2 * $normal-size;
			height: $normal-size;
			border-radius: $small-size;
			margin-bottom: $small-size;
		}

		.todo-info {
			@apply flex-1;
			@include column;

			.todo-priority {
				font-size: smaller;
				color: $base-weak-contrast-color;
			}
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
