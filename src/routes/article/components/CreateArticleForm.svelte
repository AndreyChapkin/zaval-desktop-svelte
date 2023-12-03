<script lang="ts">
	import { createArticle } from '$lib/api/article-calls';

	// state
	let title = '';
	let isLoading = false;

	// reactivity

	// handlers
	const clickCreateHandler = async () => {
		if (title) {
			isLoading = true;
			const createdArticle = await createArticle(title);
			window.open(`/article/${createdArticle.id}`, '_blank');
			window.location.reload();
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="create-article-form">
	<input
		type="text"
		bind:value={title}
	/>
	<button on:click={clickCreateHandler}>Create article</button>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.create-article-form {
		@include column($large-size);
		@include standard-container;
		background-color: $second-color;
		padding: $large-size;
		width: 50vw;

		button {
			@include standard-button;
		}
		input {
			@include standard-input;
		}
	}
</style>
