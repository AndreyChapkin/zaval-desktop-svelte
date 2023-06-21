<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TodoStatusMenu from './TodoStatusMenu.svelte';
	import type {
		CreateTodoDto,
		TodoHierachyDto,
		TodoStatus,
		UpdateTodoData,
	} from '$lib/types/todo';

	// data
	export let todoHierarchyDto: TodoHierachyDto | null;
	let editName: string = todoHierarchyDto?.name ?? '';
	let editStatus: TodoStatus = todoHierarchyDto?.status ?? 'BACKLOG';
	let isCreateMode = todoHierarchyDto === null;

	// events and issuers
	type EventType = {
		backgroundClick: null;
		update: UpdateTodoData;
		create: CreateTodoDto;
		move: TodoHierachyDto;
		delete: number;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const backgroundClickHandler = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			dispatch('backgroundClick');
		}
	};
	const updateHandler = () => {
		dispatch('backgroundClick');
		dispatch('update', {
			id: todoHierarchyDto!!.id,
			updatedTodoDto: {
				name: editName,
				status: editStatus
			}
		});
	};
	const enterKeyHandler = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			if (isCreateMode) {
				dispatch('backgroundClick');
				dispatch('create', {
					name: editName,
					status: editStatus,
					parentId: todoHierarchyDto?.id ?? null
				});
			} else {
				dispatch('update', {
					id: todoHierarchyDto!!.id,
					updatedTodoDto: {
						name: editName,
						status: editStatus
					}
				});
			}
		}
	};
	const addHandler = () => {
		isCreateMode = true;
		editName = '';
		editStatus = 'BACKLOG';
	};
	const createHandler = () => {
		dispatch('backgroundClick');
		dispatch('create', {
			name: editName,
			status: editStatus,
			parentId: todoHierarchyDto?.id ?? null
		});
	};
	const deleteEventIssuer = () => {
		dispatch('backgroundClick');
		dispatch('delete', todoHierarchyDto?.id);
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
				on:keyup={enterKeyHandler}
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
					on:click={updateHandler}
				>
					Update
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="todo-menu-action"
					on:click={addHandler}
				>
					Add subtask
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
					on:click={createHandler}
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
			adjust-color($base-dark-color, $alpha: -0.15) 0%,
			adjust-color($base-pale-color, $alpha: -0.15) 100%
		);

		/* .todo-menu-background {
			@include full-screen;
			background-color: adjust-color($attractive-color, $alpha: -0.5);
			@apply backdrop-blur-sm;
		} */

		.todo-menu-content {
			width: 600px;
			/* @include normal-shadow; */
			@include bordered($color: $base-dark-color, $size: $border-normal-size);
			@apply p-4 rounded-md;
			background-color: $base-pale-color;
			/* background: linear-gradient(
				0deg,
				adjust-color($attractive-color, $alpha: -0) 0%,
				adjust-color($attractive-light-color, $alpha: -0) 100%
			); */

			.edit-pane {
				@apply mb-1;
				@include row-stretched;

				input {
					@apply p-1 text-black;
				}
			}
			.action-pane {
				@apply space-x-1;
				@include row-centered;

				.todo-menu-action {
					@include component;
					@apply p-1;
				}
			}
		}
	}
</style>
