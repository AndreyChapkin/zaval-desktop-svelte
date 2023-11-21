<script lang="ts">
	import { createArticle, createArticleSeries } from '$lib/api/article-calls';
	import ModalWindow from '../../components/ModalWindow.svelte';

	// state
	let name = '';
	let isOpen = false;
	let isLoading = false;

	// reactivity

	// handlers
	const clickCreateHandler = async () => {
		if (name) {
			isLoading = true;
			const createdSeries = await createArticleSeries({
				id: -100,
				name,
				articleIds: [],
				interactedOn: ''
			});
			window.open(`/article/series/${createdSeries.id}`, '_blank');
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
<div class="create-article-series">
	<button on:click={openHandler}>Add series</button>
	{#if isOpen}
		<ModalWindow on:close={closeHandler}>
			<div class="create-article-series-form">
				<input
					type="text"
					bind:value={name}
				/>
				<button on:click={clickCreateHandler}>Create article series</button>
			</div>
		</ModalWindow>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.create-article-series {
		button {
			@include standard-button;
		}
	}

	.create-article-series-form {
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
