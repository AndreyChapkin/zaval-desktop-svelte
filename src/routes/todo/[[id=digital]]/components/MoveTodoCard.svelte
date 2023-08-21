<script lang="ts">
	import type { TodoHierachyDto } from '$lib/types/todo';
	import { CHOOSE_ICON_URL, TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';

	// state
	export let todo: TodoHierachyDto;

	// events
	type EventType = {
		select: TodoHierachyDto;
		visit: TodoHierachyDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const selectHandler = () => dispatch('select', todo);
	const visitHandler = () => dispatch('visit', todo);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="move-todo-card">
	<div class="todo-name">
		{todo.name}
	</div>
	<button on:click={selectHandler} class="select-todo">
		<img
			src={CHOOSE_ICON_URL}
			alt="composition"
		/>
	</button>
	<button on:click={visitHandler} class="visit-todo">
		<img
			src={TODO_COMPLEX_ICON_URL}
			alt="composition"
		/>
	</button>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/todo-variables.scss';

	.move-todo-card {
		background-color: $base-color;
		color: $base-contrast-color;

		@include row($wide-size);
		@include standard-container;

		img {
			@include icon-normal-sized;
		}

		.todo-name {
			@apply flex-1;
		}
	}
</style>
