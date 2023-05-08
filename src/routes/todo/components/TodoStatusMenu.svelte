<script lang="ts">
	import { TodoStatus } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';

	// data
	export let currentStatus: TodoStatus;

	$: otherStatuses = [TodoStatus.IN_PROGRESS, TodoStatus.ON_HOLD, TodoStatus.NEED_ATTENTION].filter(
		(i) => i !== currentStatus
	);

	let isOpen = false;

	// events
	type EventType = {
		select: TodoStatus;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const issueSelectEventCreator = (status: TodoStatus) => () => {
		isOpen = false;
		dispatch('select', status);
	};
	const openHandler = () => (isOpen = !isOpen);

	// utils

	function statusImageUrl(status: TodoStatus): string {
		switch (status) {
			case TodoStatus.IN_PROGRESS:
				return '/todo-status/in_progress.svg';
			case TodoStatus.NEED_ATTENTION:
				return '/todo-status/need_attention.svg';
			default:
				return '/todo-status/on_hold.svg';
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-status-menu">
	<div
		on:click={openHandler}
		class="current-status"
	>
		<img
			src={statusImageUrl(currentStatus)}
			alt="status"
		/>
	</div>
	{#if isOpen}
		<div class="options-pane">
			{#each otherStatuses as status (status)}
				<div
					class="option-status"
					on:click={issueSelectEventCreator(status)}
				>
					<img
						src={statusImageUrl(status)}
						alt="status"
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.todo-status-menu img {
		height: 25px;
	}
	.options-pane {
		position: absolute;
	}
	.option-status {
		@apply bg-slate-200 p-1;
	}
	.current-status {
		@apply bg-slate-600 p-1;
	}
</style>
