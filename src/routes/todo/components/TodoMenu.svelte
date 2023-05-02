<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';

	// data
	export let x = 0;
	export let y = 0;
    export let todo: Todo;

	// events
	type EventType = {
		"backgroundClick": null;
        "create": Todo;
        "delete": Todo;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const issueBackgroundClick = () => dispatch('backgroundClick');
    const issueAddEvent = () => dispatch("create", todo);
    const issueDeleteEvent = () => dispatch("delete", todo);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={issueBackgroundClick} class="todo-menu-background backdrop-blur-sm bg-purple-300 bg-opacity-20" />
<div style={`transform: translate(${x}px, ${y}px)`} class="todo-menu bg-slate-600 text-white">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div on:click={issueAddEvent}>Add</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div on:click={issueDeleteEvent}>Delete</div>
</div>

<style>
	.todo-menu-background {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}
	.todo-menu {
		position: absolute;
        top: 0;
        left: 0;
	}
</style>
