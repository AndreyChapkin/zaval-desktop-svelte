<script lang="ts">
	import {
		createArticle
	} from '$lib/api/article-calls';
	import ModalWindow from '../../components/ModalWindow.svelte';

	// state
	let title = '';
	let isOpen = false;
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

	const openHandler = () => {
		isOpen = true;
	};

	const closeHandler = () => {
		isOpen = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="create-article">
	<button on:click={openHandler}>Add article</button>
	{#if isOpen}
		<ModalWindow on:close={closeHandler}>
			<div class="create-article-form">
				<input type="text" bind:value={title} />
				<button on:click={clickCreateHandler}>Create article</button>
			</div>
		</ModalWindow>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.create-article {
		button {
			@include standard-button;
		}
	}

	.create-article-form {
		@include column($normal-size);
		@include standard-container;
		background-color: $second-color;
		width: 50vw;

		button {
			@include standard-button;
		}
		input {
			@include standard-input;
		}
	}
</style>
