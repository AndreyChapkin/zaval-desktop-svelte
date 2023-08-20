<script lang="ts">
	import { ROOT_TODO_HIERARCHY, type TodoDto, type TodoHierachyDto } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';

	// state
	export let todo: TodoHierachyDto | TodoDto;
	export let externalClass: string = '';

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
<div class={`primitive-card ${externalClass}`}>
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
		min-width: 150px;
		max-width: 350px;
		padding: $normal-size;
		background-color: $base-color;
		color: $base-contrast-color;
		font-size: small;

		@include row($normal-size);
		border-radius: $normal-size;

		img {
			@include icon-normal-sized;
		}

		.go-to-todo {
			padding-right: $normal-size;
			@include bordered(right, $base-contrast-color, $border-small-size);

			.link-area {
				height: 100%;
			}
		}
	}
</style>
