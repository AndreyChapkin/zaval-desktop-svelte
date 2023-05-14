<script lang="ts">
	import { STAB_TODO_HIERARCHY, type TodoHierachy } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { statusImageUrl } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';

	// data
	export let todo: TodoHierachy = STAB_TODO_HIERARCHY;
	export let isSelected: boolean = false;

	// events
	type EventType = {
		select: TodoHierachy;
		open: TodoHierachy;
		rightClick: { todo: TodoHierachy; x: number; y: number };
	};
	const dispatch = createEventDispatcher<EventType>();
	const issueSelectEvent = () => dispatch('select', todo);
	const issueOpenEvent = () => dispatch('open', todo);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="todo-card"
	class:todo-card-selected={isSelected}
	on:click={issueSelectEvent}
>
	{#if todo.childs.length > 0}
		<div
			class="todo-complex-image"
			on:click={issueOpenEvent}
		>
			<img
				src={TODO_COMPLEX_ICON_URL}
				alt="composition"
			/>
		</div>
	{/if}
	<img
		src={statusImageUrl(todo.status)}
		alt="status"
	/>
	<div class="todo-name">
		{todo.name}
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-card {
		@include row;
		@include dark-component;
		@apply p-2 space-x-2;

		.todo-complex-image {
			@include bordered(right, $base-light-color, $narrow-border-size);
			@apply pr-2;

			img {
				@include icon-large-sized;
			}
		}

		img {
			@include icon-large-sized;
		}
	}

	.todo-card-selected {
		@include attractive-component;
	}
</style>
