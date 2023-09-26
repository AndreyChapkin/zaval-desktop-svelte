<script lang="ts">
	import { All_TODO_STATUSES, type TodoStatus } from '$lib/types/todo';
	import { chooseStatusImgUrl, todoStatusToUrlForm } from '$lib/utils/todo-helpers';

	// state
	export let chosenStatus: TodoStatus;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="status-switcher">
	{#each All_TODO_STATUSES as status}
		<a href={`/todo/${todoStatusToUrlForm(status)}`}>
			<div class={`todo-status-button ${chosenStatus === status ? 'chosen' : ''}`}>
				<img
					src={chooseStatusImgUrl(status)}
					alt="status"
				/>
			</div>
		</a>
	{/each}
</div>

<style lang="scss">
	@import '/static/style/todo-variables.scss';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/common/size/';
	@import '/static/style/common/color/';

	.status-switcher {
		@include row($normal-size);
		margin-bottom: $wide-size;

		.todo-status-button {
			@include standard-container;
			padding: $small-size;

		}

		img {
			@include icon-larger-sized;
		}

		.chosen {
			@include bordered(bottom, $second-more-lighter-color, $border-normal-size);
			background-color: $second-light-color;
			// border-width: $border-normal-size;
			// border-color: lighten($second-light-color, 30%);
		}
	}
</style>
