<script lang="ts">
	import { ROOT_MENU_ICON_URL, SEARCH_ICON_URL } from '$lib/utils/assets-references';
	import SearchPanel from './SearchPanel.svelte';
	import SideStatusMenu from './SideStatusMenu.svelte';

	// state
	let isSearchOpen = false;

	// events

	// handlers
	const showSearchHandler = () => {
		isSearchOpen = true;
	};
	
	const closeSearchHandler = () => {
		isSearchOpen = false;
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
	{#if isSearchOpen}
		<SearchPanel on:close={closeSearchHandler} />
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/index.scss';
	@import '/static/style/common/size/index.scss';
	@import '/static/style/common/composition/index.scss';
	@import '/static/style/todo-variables.scss';

	.todo-side-menu {
		background-color: $second-color;
		@include column-centered($normal-size);
		padding: $normal-size $small-size;

		.todo-side-menu-item {
			cursor: pointer;
			border-radius: $normal-size;
			padding: 1px;

			img {
				@include icon-large-sized;
			}
		}

		.todo-side-menu-item:hover {
			background-color: $second-light-color;
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
