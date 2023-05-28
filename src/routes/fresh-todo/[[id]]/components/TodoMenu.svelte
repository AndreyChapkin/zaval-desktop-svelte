<script lang="ts">
	import { TodoStatus, type DeprTodo, type TodoHierachy, STAB_TODO } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';
	import TodoStatusMenu from './TodoStatusMenu.svelte';

	// data
	export let todo: TodoHierachy | null;
	let editName: string = todo?.name ?? '';
	let editStatus: TodoStatus = todo?.status ?? TodoStatus.NEED_ATTENTION;
	let isCreateMode = todo === null;

	// events
	type EventType = {
		backgroundClick: null;
		save: TodoHierachy;
		create: DeprTodo;
		delete: TodoHierachy;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const backgroundClickHandler = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			dispatch('backgroundClick');
		}
	};
	const backgroundClickEventIssuer = () => dispatch('backgroundClick');
	const saveEventIssuer = () => {
		backgroundClickEventIssuer();
		dispatch('save', {
			...(todo as TodoHierachy),
			name: editName,
			status: editStatus as TodoStatus,
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
	class="todo-menu"
	on:click={backgroundClickHandler}
>
	<div class="todo-menu-content">
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
					on:click={null && saveEventIssuer}
				>
					Save
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="todo-menu-action"
					on:click={null && addHandler}
				>
					Add
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="todo-menu-action"
					on:click={null && deleteEventIssuer}
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
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	$top-padding: 50px;
	.todo-menu {
		@include modal-window-background;
		background: linear-gradient(
			0deg,
			adjust-color($attractive-color, $alpha: -0) 0%,
			adjust-color($base-pale-color, $alpha: -0.1) 100%
		);

		/* .todo-menu-background {
			@include full-screen;
			background-color: adjust-color($attractive-color, $alpha: -0.5);
			@apply backdrop-blur-sm;
		} */

		.todo-menu-content {
			width: 600px;

			.edit-pane {
				@apply mb-1;
				@include row-stretched;
				@include normal-shadow;

				input {
					@apply p-1 text-black;
				}
			}
			.action-pane {
				@apply space-x-1;
				@include row-centered;

				.todo-menu-action {
					@include normal-shadow;
					@include dark-component;
					@apply p-1;
				}
			}
		}
	}
</style>
