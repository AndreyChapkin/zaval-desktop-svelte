<script lang="ts">
	import { createTodo, deleteTodo, updateTodo } from '$lib/api/todo-calls';
	import type {
		CreateTodoDto,
		TodoDto,
		TodoHierachyDto,
		TodoStatus,
		UpdateTodoData
	} from '$lib/types/todo';
	import { returnParentId } from '$lib/utils/todo-helpers';
	import { createEventDispatcher, onMount } from 'svelte';
	import TodoStatusMenu from './TodoStatusMenu.svelte';

	// data
	export let todoDto: TodoHierachyDto | TodoDto | null;
	let editName: string = todoDto?.name ?? '';
	let editStatus: TodoStatus = todoDto?.status ?? 'BACKLOG';
	let editPriority: number = todoDto?.priority ?? 0;
	let isCreateMode = todoDto === null;

	// components
	let splitContainer: HTMLDivElement;

	// events and issuers
	type EventType = {
		backgroundClick: null;
		update: UpdateTodoData;
		create: CreateTodoDto;
		move: TodoHierachyDto | TodoDto;
		delete: number;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const requestTodoUpdate = async () => {
		if (todoDto) {
			await updateTodo(todoDto.id, {
				name: editName,
				priority: editPriority,
				status: editStatus
			});
		}
		// TODO: make slighter
		window.location.reload();
	};

	const requestTodoCreate = async () => {
		await createTodo({
			name: editName,
			status: editStatus,
			parentId: todoDto?.id ?? null
		});
		// TODO: make slighter
		window.location.reload();
	};

	const requestTodoDelete = async () => {
		if (todoDto) {
			const parentTodoId = returnParentId(todoDto);
			await deleteTodo(todoDto.id);
			// TODO: make slighter
			window.location.href = `/todo/${parentTodoId ?? ''}`;
		}
	};

	const backgroundClickHandler = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			dispatch('backgroundClick');
		}
	};
	const createHandler = () => {
		dispatch('backgroundClick');
		requestTodoCreate();
	};
	const updateHandler = () => {
		dispatch('backgroundClick');
		requestTodoUpdate();
	};
	const deleteEventIssuer = () => {
		dispatch('backgroundClick');
		requestTodoDelete();
	};
	const enterKeyHandler = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			dispatch('backgroundClick');
			if (isCreateMode) {
				requestTodoCreate();
			} else {
				requestTodoUpdate();
			}
		}
	};
	const addSubtaskHandler = () => {
		isCreateMode = true;
		editName = '';
		editStatus = 'BACKLOG';
	};
	const moveHandler = () => {
		dispatch('backgroundClick');
		dispatch('move', todoDto!!);
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
		window.document.addEventListener('keyup', escapeHandler);
		return () => {
			window.document.removeEventListener('keyup', escapeHandler);
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
		<div
			class="edit-pane"
			on:keyup={enterKeyHandler}
		>
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
					on:click={addSubtaskHandler}
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
