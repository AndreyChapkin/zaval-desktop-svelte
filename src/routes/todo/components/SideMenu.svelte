<script lang="ts">
	import {
		ARTICLE_ICON_URL,
		ROOT_MENU_ICON_URL,
		SEARCH_ICON_URL
	} from '$lib/utils/assets-references';
	import { chooseStatusImgUrl, todoStatusToUrlForm } from '$lib/utils/todo-helpers';
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
		<a href={`/todo/${todoStatusToUrlForm('IN_PROGRESS')}`}>
			<img
				src={chooseStatusImgUrl('IN_PROGRESS')}
				alt="status"
			/>
		</a>
	</div>
	<!-- <SideStatusMenu /> -->
	<div class="todo-side-menu-item">
		<a href={`/todo/root`}>
			<img
				src={ROOT_MENU_ICON_URL}
				alt="status"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item">
		<img
			src={SEARCH_ICON_URL}
			alt="search"
			on:click={showSearchHandler}
		/>
	</div>
	<div class="separator" />
	<div class="todo-side-menu-item">
		<a href="/article">
			<img
				src={ARTICLE_ICON_URL}
				alt="search"
			/>
		</a>
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
		background-color: $base-darker-color;
		@include column-center($normal-size);
		padding: $normal-size $small-size;

		img {
				@include icon-large-sized;
			}

		.todo-side-menu-item {
			cursor: pointer;
			border-radius: $normal-size;
			padding: 1px;
		}

		.todo-side-menu-item:hover {
			background-color: $base-light-color;
		}

		.separator {
			height: 2px;
			width: 20px;
			background-color: $second-lighter-color;
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
