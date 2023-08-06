<script lang="ts">
	import { ROOT_MENU_ICON_URL, SEARCH_ICON_URL } from '$lib/utils/assets-references';
	import SearchPanel from './SearchPanel.svelte';
	import SideStatusMenu from './SideStatusMenu.svelte';

	// state
	let isSearchVisible = false;

	// events

	// handlers
	const showSearchHandler = () => {
		isSearchVisible = !isSearchVisible;
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
	<div class="todo-side-menu-item">
		<img
			src={SEARCH_ICON_URL}
			alt="search"
			on:click={showSearchHandler}
		/>
	</div>
	{#if isSearchVisible}
		<SearchPanel on:close={() => (isSearchVisible = false)} />
	{/if}
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
