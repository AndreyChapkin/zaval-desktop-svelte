<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import TodoStatusMenu from './TodoStatusMenu.svelte';
	import type { CreateTodoDto, TodoHierachyDto, TodoStatus, UpdateTodoData } from '$lib/types/todo';

	// data
	export let todoHierarchyDto: TodoHierachyDto | null;
	let editName: string = todoHierarchyDto?.name ?? '';
	let editStatus: TodoStatus = todoHierarchyDto?.status ?? 'BACKLOG';
	let editPriority: number = todoHierarchyDto?.priority ?? 0;
	let isCreateMode = todoHierarchyDto === null;

	// components
	let splitContainer: HTMLDivElement;

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
				priority: editPriority,
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
						priority: editPriority,
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
	const moveHandler = () => {
		dispatch('backgroundClick');
		dispatch('move', todoHierarchyDto!!);
	};
	const deleteEventIssuer = () => {
		dispatch('backgroundClick');
		dispatch('delete', todoHierarchyDto?.id);
	};
	const selectStatusHandler = (selectEvent: any) => {
		const selectedStatus = selectEvent.detail as TodoStatus;
		editStatus = selectedStatus;
	};
	
	const escapeHandler = (e: KeyboardEvent) => {
		if (e.code === 'Escape') {
			dispatch('backgroundClick');
		}
	};

	// lifecycle
	onMount(() => {
		window.document.body.append(splitContainer);
		window.document.addEventListener("keyup", escapeHandler);
		return () => {
			window.document.removeEventListener("keyup", escapeHandler);
		};
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="todo-menu"
	on:mousedown={backgroundClickHandler}
	bind:this={splitContainer}
>
	<div class="todo-menu-content">
		<div class="edit-pane" on:keyup={enterKeyHandler}>
			<TodoStatusMenu
				currentStatus={editStatus}
				on:select={selectStatusHandler}
			/>
			<input
				class="w-full"
				type="text"
				bind:value={editName}
			/>
			<input
				on:keyup={enterKeyHandler}
				class="w-full"
				type="text"
				bind:value={editPriority}
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
					on:click={moveHandler}
				>
					Move
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
			rgba($color: #000000, $alpha: 1) 0%,
			rgba($color: #000000, $alpha: 0.6) 100%
		);

		.todo-menu-content {
			width: 600px;
			@include bordered($color: $base-dark-color, $size: $border-normal-size);
			@apply p-4 rounded-md;
			background-color: $base-pale-color;

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
					@include normal-component;
					@apply p-1;
				}
			}
		}
	}
</style>
