<script lang="ts">
	import { createTodo, deleteTodo, updateTodo } from '$lib/api/todo-calls';
	import type { DetailedTodoDto, LightTodoDto, TodoStatus } from '$lib/types/todo';
	import { returnParentId } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';
	import ModalWindow from '../../../components/ModalWindow.svelte';
	import TodoStatusMenu from './TodoStatusMenu.svelte';

	// data
	export let todoDto: DetailedTodoDto | LightTodoDto | null;
	let editName: string = todoDto?.name ?? '';
	let editStatus: TodoStatus = todoDto?.status ?? 'BACKLOG';
	let editPriority: number = todoDto?.priority ?? 0;
	let isCreateMode = todoDto === null;

	// components
	let splitContainer: HTMLDivElement;

	// events and issuers
	type EventType = {
		move: DetailedTodoDto | LightTodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const requestTodoUpdate = async () => {
		if (todoDto) {
			await updateTodo(todoDto.id, {
				general: {
					name: editName,
					priority: editPriority,
					status: editStatus
				}
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

	const createHandler = () => {
		requestTodoCreate();
	};
	const updateHandler = () => {
		requestTodoUpdate();
	};
	const deleteEventIssuer = () => {
		requestTodoDelete();
	};
	const enterKeyHandler = (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
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
		dispatch('move', todoDto!!);
	};

	const selectStatusHandler = (selectEvent: any) => {
		const selectedStatus = selectEvent.detail as TodoStatus;
		editStatus = selectedStatus;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close>
	<div
		class="todo-menu"
		bind:this={splitContainer}
	>
		<div
			class="edit-pane"
			on:keyup={enterKeyHandler}
		>
			<TodoStatusMenu
				currentStatus={editStatus}
				on:select={selectStatusHandler}
			/>
			<input
				class="edit-name"
				type="text"
				bind:value={editName}
			/>
			<input
				class="edit-priority"
				on:keyup={enterKeyHandler}
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
</ModalWindow>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	$top-padding: 50px;

	.todo-menu {
		background-color: $base-dark-color;
		padding: $large-size;

		@include bordered($color: $base-color, $size: $border-small-size);
		@include screen-sized(80, 80);
		@include column-stretched($wide-size);

		.edit-pane {
			@include column-stretched($normal-size);

			input {
				@include standard-input;
			}

			.edit-priority {
				width: 3 * $large-size;
			}
		}
		.action-pane {
			@include row-centered($normal-size);

			.todo-menu-action {
				@include standard-button;
			}
		}
	}
</style>
