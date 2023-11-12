<script lang="ts">
	import { All_TODO_STATUSES, type TodoStatus } from '$lib/types/todo';
	import { chooseStatusImgUrl, todoStatusToLabel } from '$lib/utils/todo-helpers';
	import { createEventDispatcher } from 'svelte';

	// data
	export let currentStatus: TodoStatus;
	$: otherStatuses = All_TODO_STATUSES.filter((i) => i !== currentStatus);
	let isOpen = false;
	let optionsY = 0;

	// events
	type EventType = {
		select: TodoStatus;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const selectHandler = (status: TodoStatus) => () => {
		isOpen = false;
		dispatch('select', status);
	};
	const openHandler = (e: MouseEvent) => {
		const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
		optionsY = rect.bottom + window.scrollY;
		isOpen = !isOpen;
	};

	function chooseStatusColor(status: TodoStatus): string {
		switch (status) {
			case 'DONE':
				return 'done-status-color';
			case 'BACKLOG':
				return 'backlog-status-color';
			case 'WILL_BE_BACK':
				return 'will-be-back-status-color';
			case 'PING_ME':
				return 'ping-me-status-color';
			case 'NEXT_TO_TAKE':
				return 'next-to-take-status-color';
			case 'IN_PROGRESS':
				return 'in-progress-status-color';
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-status-menu">
	<div
		on:click={openHandler}
		class={`current-status ${chooseStatusColor(currentStatus)}`}
	>
		<img
			src={chooseStatusImgUrl(currentStatus)}
			alt="img"
		/>
		<span>{todoStatusToLabel(currentStatus)}</span>
	</div>
	{#if isOpen}
		<div
			class="options-pane"
			style={`top: ${optionsY}px;`}
		>
			{#each otherStatuses as status (status)}
				<div
					class={`option-status ${chooseStatusColor(status)}`}
					on:click={selectHandler(status)}
				>
					<img
						src={chooseStatusImgUrl(status)}
						alt="img"
					/>
					{todoStatusToLabel(status)}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/todo-variables.scss';

	.todo-status-menu {
		@include row-stretched;

		img {
			@include icon-normal-sized;
		}

		.option-status,
		.current-status {
			cursor: pointer;
			background-color: $second-light-color;
			padding: $normal-size $wide-size $normal-size $wide-size;
			@include row-centered($small-size);
		}

		.current-status {
			border-radius: $normal-size;
			/* min-width: 140px; */
		}

		.options-pane {
			position: absolute;
			border-radius: $normal-size;
			overflow: hidden;
			@include normal-shadow;
		}

		.option-status:hover {
			background-color: $base-color;
		}

		.option-status:hover {
			background-color: $base-dark-color;
		}
	}

	.done-status-color {
		color: $done-status-color;
	}

	.backlog-status-color {
		color: $backlog-status-color;
	}

	.will-be-back-status-color {
		color: $will-be-back-status-color;
	}

	.ping-me-status-color {
		color: $ping-me-status-color;
	}

	.next-to-take-status-color {
		color: $next-to-take-status-color;
	}

	.in-progress-status-color {
		color: $in-progress-status-color;
	}
</style>
