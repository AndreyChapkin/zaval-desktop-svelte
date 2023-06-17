<script lang="ts">
	import { BACKLOG_MENU_ICON_URL, DONE_MENU_ICON_URL, IN_PROGRESS_MENU_ICON_URL, NEXT_TO_TAKE_MENU_ICON_URL, PING_ME_MENU_ICON_URL, ROOT_MENU_ICON_URL, WILL_BE_BACK_MENU_ICON_URL } from '$lib/utils/assets-references';

	// state

	// events

	// handlers
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-side-menu">
	<div class="todo-side-menu-item normal-sized">
		<a href="/todo">
			<img
				src={ROOT_MENU_ICON_URL}
				alt="root"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item">
		<a href="/todo/done"
			><img
				src={DONE_MENU_ICON_URL}
				alt="done"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item">
		<a href="/todo/backlog"
			><img
				src={BACKLOG_MENU_ICON_URL}
				alt="backlog"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item">
		<a href="/todo/will-be-back"
			><img
				src={WILL_BE_BACK_MENU_ICON_URL}
				alt="will-be-back"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item normal-sized">
		<a href="/todo/ping-me"
			><img
				src={PING_ME_MENU_ICON_URL}
				alt="ping-me"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item">
		<a href="/todo/next-to-take"
			><img
				src={NEXT_TO_TAKE_MENU_ICON_URL}
				alt="next-to-take"
			/>
		</a>
	</div>
	<div class="todo-side-menu-item">
		<a href="/todo/in-progress"
			><img
				src={IN_PROGRESS_MENU_ICON_URL}
				alt="in-progress"
			/>
		</a>
	</div>
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
			img {
				@include icon-large-sized;
			}
		}

		.normal-sized {
			img {
				@include icon-normal-sized;
			}
		}
	}
</style>
