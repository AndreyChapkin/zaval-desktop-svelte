<script lang="ts">
	import type { TodoHierachyDto } from '$lib/types/todo';
	import { CHOOSE_ICON_URL, TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';

	// state
	export let todo: TodoHierachyDto;
	export let size: 'small' | 'normal' | 'large' = 'normal';

	$: sizeClass = `${size}-todo`;

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
<div class={`move-todo-card ${sizeClass}`}>
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
	@import '/static/style/variables-mixins.scss';
	@import '/static/style/todo-variables.scss';

	.move-todo-card {
		@include row($wide-size);
		@include dark-component;
		@apply p-2;

		.todo-name {
			@apply flex-1;
		}
	}

	.small-todo {
		font-size: small;
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
</style>
