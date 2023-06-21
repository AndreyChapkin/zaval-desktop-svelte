<script lang="ts">
	import {
		BACKLOG_MENU_ICON_URL,
		DONE_MENU_ICON_URL,
		IN_PROGRESS_MENU_ICON_URL,
		NEXT_TO_TAKE_MENU_ICON_URL,
		PING_ME_MENU_ICON_URL,
		ROOT_MENU_ICON_URL,
		WILL_BE_BACK_MENU_ICON_URL
	} from '$lib/utils/assets-references';
	import SideStatusMenu from './SideStatusMenu.svelte';

	// state
	let isStatusesVisible = false;

	// events

	// handlers
	const onMouseEnter = (e: MouseEvent) => {
		isStatusesVisible = true;
	};
	const onMouseLeave = (e: MouseEvent) => {
		isStatusesVisible = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-side-menu">
	<div class="todo-side-menu-item">
		<a href="/todo">
			<img
				src={ROOT_MENU_ICON_URL}
				alt="root"
			/>
		</a>
	</div>
	<SideStatusMenu />
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';
	@import '/static/style/todo-variables.scss';

	.todo-side-menu {
		@include dark-component;
		@include column-centered($normal-size);
		padding: $normal-size;

		.todo-side-menu-item {
			cursor: pointer;
			padding: 1px;
			@apply rounded-sm;
			
			img {
				@include icon-large-sized;
			}
		}

		.todo-side-menu-item:hover {
			background-color: $base-pale-color;
		}

		:global(.todo-side-menu-item img) {
			@include icon-large-sized;
		}

		.normal-sized {
			img {
				@include icon-normal-sized;
			}
		}
	}
</style>
