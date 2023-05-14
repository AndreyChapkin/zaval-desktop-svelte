<script lang="ts">
	import { TodoStatus, type Todo, type TodoHierachy, STAB_TODO } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';
	import TodoStatusMenu from './TodoStatusMenu.svelte';

	// data
	export let x = 0;
	export let y = 0;
	export let todo: TodoHierachy | null;
	let editName: string = todo?.name ?? '';
	let editStatus: TodoStatus = todo?.status ?? TodoStatus.NEED_ATTENTION;
	let isCreateMode = todo === null;

	// events
	type EventType = {
		backgroundClick: null;
		save: TodoHierachy;
		create: Todo;
		delete: TodoHierachy;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const backgroundClickEventIssuer = () => dispatch('backgroundClick');
	const saveEventIssuer = () => {
		backgroundClickEventIssuer();
		dispatch('save', {
			...(todo as TodoHierachy),
			name: editName,
			status: editStatus as TodoStatus,
			childs: []
		});
	};
	const enterHandler = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			if (isCreateMode) {
				createEventIssuer();
			} else {
				saveEventIssuer();
			}
		}
	};
	const addHandler = () => {
		isCreateMode = true;
		editName = '';
		editStatus = TodoStatus.NEED_ATTENTION;
	};
	const createEventIssuer = () => {
		backgroundClickEventIssuer();
		dispatch('create', {
			...STAB_TODO,
			name: editName,
			status: editStatus as TodoStatus,
			parent: todo?.id ?? null
		});
	};
	const deleteEventIssuer = () => {
		backgroundClickEventIssuer();
		dispatch('delete', todo!);
	};
	const selectStatusHandler = (selectEvent: any) => {
		const selectedStatus = selectEvent.detail as TodoStatus;
		editStatus = selectedStatus;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click={backgroundClickEventIssuer}
	class="todo-menu-background"
/>
<div
	style={`transform: translate(${x}px, ${y}px)`}
	class="todo-menu"
>
	<div class="edit-pane">
		<TodoStatusMenu
			currentStatus={editStatus}
			on:select={selectStatusHandler}
		/>
		<input
			on:keyup={enterHandler}
			class="w-full"
			type="text"
			bind:value={editName}
		/>
	</div>
	<div class="action-pane">
		{#if !isCreateMode}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="todo-menu-action"
				on:click={saveEventIssuer}
			>
				Save
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="todo-menu-action"
				on:click={addHandler}
			>
				Add
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="todo-menu-action"
				on:click={deleteEventIssuer}
			>
				Delete
			</div>
		{:else}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="todo-menu-action"
				on:click={createEventIssuer}
			>
				Create
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import "/static/style/variables-mixins.scss";

	.todo-menu-background {
		@include full-screen;
		background-color: adjust-color($attractive-color, $alpha: -0.5);
		@apply backdrop-blur-sm;
	}
	.todo-menu {
		position: absolute;
		top: 0;
		left: 0;
		min-width: 500px;
	}
	.edit-pane {
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		@apply flex mb-1;
	}
	.edit-pane input {
		@apply p-1;
	}
	.action-pane {
		@apply flex space-x-1 content-center;
	}
	.todo-menu-action {
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		@include dark-component;
		@apply p-1;
	}
</style>
