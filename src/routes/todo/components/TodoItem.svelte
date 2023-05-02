<script lang="ts">
	import { TodoStatus, type Todo, type TodoHierachy } from '$lib/types/todo';
	import { slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	// data
	export let todo: TodoHierachy;
	let isOpen: boolean = false;

	// events
	type EventType = {
		select: number;
		rightClick: { todo: TodoHierachy; x: number; y: number };
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const issueSelectEvent = () => dispatch('select', todo.id);
	const issueRightCLickEvent = (e: any) => {
		const detail = {
			todo: todo,
			x: e.clientX,
			y: e.clientY
		};
		dispatch('rightClick', detail);
	};
	const handleClick = () => {
		isOpen = !isOpen;
	};

	// helpers
	function statusImageUrl(): string {
		switch (todo.status) {
			case TodoStatus.IN_PROGRESS:
				return '/todo-status/in_progress.svg';
			case TodoStatus.NEED_ATTENTION:
				return '/todo-status/need_attention.svg';
			default:
				return '/todo-status/on_hold.svg';
		}
	}
</script>

<div class="todo-item mb-2">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="todo-self flex flex-row space-x-2 align-middle bg-slate-500 text-slate-100 pl-2 p-1 mb-1 cursor-pointer"
		on:click={issueSelectEvent}
		on:contextmenu|preventDefault={issueRightCLickEvent}
	>
		{#if todo.childs?.length > 0}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="pl-1 pr-1 rounded-md bg-slate-600"
				on:click|stopPropagation={handleClick}
			>
				{isOpen ? '--' : '+'}
			</div>
		{/if}

		<div class="todo-status-image">
			<img
				src={statusImageUrl()}
				alt="status"
			/>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div>
			{todo.name}
		</div>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	{#if isOpen}
		<div
			transition:slide={{ duration: 200 }}
			class="todo-children pl-4"
		>
			{#each todo.childs as child (child.id)}
				<svelte:self
					on:rightClick
					on:select
					todo={child}
				/>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.todo-status-image img {
		height: 25px;
	}
</style>
