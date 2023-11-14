<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type DetailedTodoDto, type LightTodoDto } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { chooseStatusClass } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';

	// state
	export let todo: DetailedTodoDto | LightTodoDto;
	export let externalClass: string = '';
	$: statusClass = chooseStatusClass(todo.status);

	// events
	type EventType = {
		select: DetailedTodoDto | LightTodoDto;
		view: DetailedTodoDto | LightTodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const viewHandler = (event: MouseEvent) => {
		dispatch('select', todo);
	};
	const selectHandler = (event: MouseEvent) => {
		const LEFT_BUTTON = 0;
		if (event.ctrlKey && event.button === LEFT_BUTTON) {
			dispatch('select', todo);
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class={`primitive-card ${externalClass}`}
	on:click={selectHandler}
>
	<div class="go-to-todo">
		<a
			href={`/todo/${todo.id === ROOT_TODO_HIERARCHY.id ? '' : todo.id}`}
			on:click={viewHandler}
		>
			<div class="link-area">
				<img
					src={TODO_COMPLEX_ICON_URL}
					alt="composition"
				/>
			</div>
		</a>
	</div>
	<div class={`todo-status-indicator ${statusClass}`} />
	<div class="todo-info">
		<div class="todo-name">
			{todo.name}
		</div>
	</div>
</div>

<style lang="scss">
	@import '/static/style/todo-variables.scss';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/common/size/';
	@import '/static/style/common/color/';

	.primitive-card {
		padding: $normal-size;
		background-color: $second-color;
		color: $base-contrast-color;
		font-size: small;
		border-radius: $normal-size;

		@include row-centered($normal-size);

		img {
			@include icon-normal-sized;
		}

		.go-to-todo {
			.link-area {
				height: 100%;
			}
		}

		.todo-info {
			overflow: hidden;
		}

		.todo-name {
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}

		.todo-status-indicator {
			min-width: $wide-size;
			min-height: $wide-size;
			border-radius: 2 * $normal-size;
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
	}
</style>
