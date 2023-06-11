<script lang="ts">
	import { IN_PROGRESS_MENU_ICON_URL, ROOT_MENU_ICON_URL } from '$lib/utils/assets-references';

	// state

	// events

	// handlers
    const inProgressClickHandler = () => {

    };

    const rootClickHandler = () => {
        // TODO imitate link click?
        window.location.href = '/todo';
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-side-menu">
	<div class="todo-side-menu-item">
		<img
			src={IN_PROGRESS_MENU_ICON_URL}
			alt="in-progress"
		/>
	</div>
	<div class="todo-side-menu-item root" on:click={rootClickHandler}>
		<img
			src={ROOT_MENU_ICON_URL}
			alt="root"
		/>
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';
	@import '/static/style/todo-variables.scss';

	.todo-side-menu {
		@include dark-component;
		@include column-centered(10px);
		padding: $narrow-size;

		.todo-side-menu-item {
            cursor: pointer;
			img {
				@include icon-large-sized;
			}
		}

		.root {
			img {
				@include icon-normal-sized;
			}
		}
	}
</style>
