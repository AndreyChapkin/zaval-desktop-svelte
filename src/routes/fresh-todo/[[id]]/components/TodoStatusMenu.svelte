<script lang="ts">
	import { TodoStatus } from '$lib/types/todo';
	import {
		TODO_STATUS_IN_PROGRESS_ICON_URL,
		TODO_STATUS_NEED_ATTENTION_ICON_URL,
		TODO_STATUS_ON_HOLD_ICON_URL
	} from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';

	// data
	export let currentStatus: TodoStatus;
	$: otherStatuses = [TodoStatus.IN_PROGRESS, TodoStatus.ON_HOLD, TodoStatus.NEED_ATTENTION].filter(
		(i) => i !== currentStatus
	);
	let isOpen = false;
	let optionsY = 0;

	// elements
	let currentStatusElem: HTMLDivElement;

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
	const openHandler = (e: MouseEvent) => {
		const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
		optionsY = rect.bottom + window.pageYOffset;
		(isOpen = !isOpen);
	}

	// utils

	function statusImageUrl(status: TodoStatus): string {
		switch (status) {
			case TodoStatus.IN_PROGRESS:
				return TODO_STATUS_IN_PROGRESS_ICON_URL;
			case TodoStatus.NEED_ATTENTION:
				return TODO_STATUS_NEED_ATTENTION_ICON_URL;
			default:
				return TODO_STATUS_ON_HOLD_ICON_URL;
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-status-menu">
	<div
		on:click={openHandler}
		class="current-status"
		bind:this={currentStatusElem}
	>
		<img
			src={statusImageUrl(currentStatus)}
			alt="status"
		/>
	</div>
	{#if isOpen}
		<div class="options-pane" style={`top: ${optionsY}px;`}>
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

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todo-status-menu {
		@include row-stretched;

		img {
			@include icon-normal-sized;
		}

		.current-status {
			background-color: $base-dark-color;
			@apply p-1;
			@include row-centered;
		}

		.options-pane {
			position: absolute;
			@include normal-shadow;
		}

		.option-status {
			background-color: $base-color;
			@apply p-1;
		}

		.option-status:hover {
			background-color: $base-dark-color;
		}
	}
</style>
