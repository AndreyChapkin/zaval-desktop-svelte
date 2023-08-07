<script lang="ts">
	import { All_TODO_STATUSES, type TodoStatus } from '$lib/types/todo';
	import {
		BACKLOG_MENU_ICON_URL,
		DONE_MENU_ICON_URL,
		IN_PROGRESS_MENU_ICON_URL,
		NEXT_TO_TAKE_MENU_ICON_URL,
		PING_ME_MENU_ICON_URL,
		SELECT_WITH_STATUS_ICON_URL,
		WILL_BE_BACK_MENU_ICON_URL
	} from '$lib/utils/assets-references';
	import {
		chooseStatusClass,
		todoStatusToLabel,
		todoStatusToUrlForm
	} from '$lib/utils/todo-helpers';

	// data
	let isOpen = false;
	let optionsX = 0;
	let optionsY = 0;

	// events

	// handlers
	const backgroundClickHandler = (e: MouseEvent) => {
		isOpen = false;
	};
	const openHandler = (e: MouseEvent) => {
		const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
		optionsX = rect.right + window.pageXOffset;
		optionsY = rect.top + window.pageYOffset;
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

	function chooseStatusImgUrl(status: TodoStatus): string {
		switch (status) {
			case 'DONE':
				return DONE_MENU_ICON_URL;
			case 'BACKLOG':
				return BACKLOG_MENU_ICON_URL;
			case 'WILL_BE_BACK':
				return WILL_BE_BACK_MENU_ICON_URL;
			case 'PING_ME':
				return PING_ME_MENU_ICON_URL;
			case 'NEXT_TO_TAKE':
				return NEXT_TO_TAKE_MENU_ICON_URL;
			case 'IN_PROGRESS':
				return IN_PROGRESS_MENU_ICON_URL;
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-status-side-menu">
	<div class="todo-status-side-menu-face" on:click={openHandler}>
		<img
			src={SELECT_WITH_STATUS_ICON_URL}
			alt="done"
			on:click={backgroundClickHandler}
		/>
	</div>
	{#if isOpen}
		<div
			class="background"
			on:click={backgroundClickHandler}
		/>
		<div
			class="options-pane"
			style={`left: ${optionsX}px; top: ${optionsY}px;`}
		>
			{#each All_TODO_STATUSES as status}
				<div class="todo-status-side-menu-item">
					<a
						on:click={backgroundClickHandler}
						href={`/todo/${todoStatusToUrlForm(status)}`}
					>
						<img
							src={chooseStatusImgUrl(status)}
							alt="status"
						/>
						<span class={chooseStatusClass(status)}>{todoStatusToLabel(status)}</span>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	/* @import '/static/style/variables-mixins.scss'; */
	@import '/static/style/todo-variables.scss';
	@import '/static/style/common/color/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/size/';
	@import '/static/style/common/facade/';

	.todo-status-side-menu {
		@include row-stretched;

		.background {
			@include modal-window-background;
			background-color: transparent;
			z-index: 10;
		}

		.todo-status-side-menu-face {
			@include icon-large-sized;
		}

		.todo-status-side-menu-face:hover {
			background-color: $base-light-color;
			@apply rounded-sm;
		}

		.options-pane {
			background-color: $second-color;
			position: absolute;
			z-index: 100;
			border-radius: $normal-size;
			overflow: hidden;
			@include normal-shadow;

			img {
				@include icon-normal-sized;
			}

			.todo-status-side-menu-item {
				padding: $normal-size $normal-size $normal-size $normal-size;

				img {
					@include icon-normal-sized;
				}

				a {
					@include row-centered($small-size);
				}
			}

			.todo-status-side-menu-item:hover {
				background-color: $second-light-color;
			}
		}

		.option-status:hover {
			background-color: $base-dark-color;
		}
	}

	.done-status {
		color: $done-status-color;
	}

	.backlog-status {
		color: $backlog-status-color;
	}

	.will-be-back-status {
		color: $will-be-back-status-color;
	}

	.ping-me-status {
		color: $ping-me-status-color;
	}

	.next-to-take-status {
		color: $next-to-take-status-color;
	}

	.in-progress-status {
		color: $in-progress-status-color;
	}
</style>
