<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';
	import _ from 'lodash';

	// data
	let clazz: string | null = null;
	export { clazz as class };
	export let todo: Todo;
	let editedName: string = todo.name;
	let editedInfo: string = todo.info;
	let editMode = false;
	let saveTimeout = 0;

	$: if (editedName !== undefined || editedInfo !== undefined) {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			saveHandler();
		}, 1000);
	}

	// events
	type SaveEventType = {
		save: Todo;
	};
	const dispatch = createEventDispatcher<SaveEventType>();

	// handlers
	const switchModeHandler = () => {
		editMode = !editMode;
	};
	const saveHandler = () => {
		dispatch('save', {
			..._.cloneDeep(todo),
			name: editedName,
			info: editedInfo
		});
	};
</script>

<div
	on:dblclick={switchModeHandler}
	class={'selected-todo flex flex-col' + ` ${clazz}`}
>
	<textarea
		class="todo-info-text"
		bind:value={editedInfo}
	/>
</div>

<style lang="postcss">
	.todo-info-text {
		min-height: 300px;
		@apply p-1 rounded-md resize-none outline-none;
	}
</style>
