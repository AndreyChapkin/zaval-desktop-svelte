<script lang="ts">
	import { updateArticleSeries } from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { ArticleSeriesPageData } from '$lib/types/pages-data';
	import ArticleLight from '../../components/ArticleLight.svelte';
	import ArticleSearch from './components/ArticleSearch.svelte';

	// const
	const REMOVE_TIMEOUT_MS = 3000;

	// state
	export let data: ArticleSeriesPageData;
	let articleSeries = data.articleSeries;
	let articleLights = data.articleLights;
	let name: string = articleSeries.name;
	let editableName: string = name;
	let editableArticleLights = articleLights;
	let isEditable = false;
	let isGoingRemove = false;
	let removeCounter = 0;
	let counterIncreaserId: number | null = null;

	// handlers
	const editHandler = () => {
		isEditable = true;
	};

	const saveEditionHandler = async () => {
		await updateArticleSeries(articleSeries.id, {
			name: editableName,
			articleIds: editableArticleLights.map((i) => i.id)
		});
		isEditable = !isEditable;
		window.location.reload();
	};

	const cancelEditionHandler = () => {
		editableName = name;
		editableArticleLights = articleLights;
		isEditable = false;
	};

	const addArticleToSeriesHandler = (event: CustomSvelteEvent<ArticleLightDto>) => {
		const articleLight = event.detail;
		let isArticlePresented = editableArticleLights.findIndex((i) => i.id === articleLight.id) > -1;
		if (!isArticlePresented) {
			editableArticleLights = [...editableArticleLights, articleLight];
		}
	};

	const removeMouseDownHandler = () => {
		isGoingRemove = true;
		removeCounter = 0;
		setTimeout(async () => {
			if (isGoingRemove) {
				// await deleteArticleSeries(articleSeries.id);
				isGoingRemove = false;
				clearCounterIncrease();
				window.location.href = '/article';
			}
		}, REMOVE_TIMEOUT_MS);
		// counter
		const COUNTER_TIMEOUT_MS = 1000;
		const increaseCounter = () => {
			if (isGoingRemove) {
				removeCounter = removeCounter + 1;
				counterIncreaserId = setTimeout(increaseCounter, COUNTER_TIMEOUT_MS);
			} else {
				clearCounterIncrease();
			}
		};
		setTimeout(increaseCounter, COUNTER_TIMEOUT_MS);
	};

	const removeMouseUpHandler = async () => {
		isGoingRemove = false;
		clearCounterIncrease();
	};

	const createPositionUpHandler = (i: number) => () => {
		if (0 < i && i <= editableArticleLights.length - 1) {
			const temp = editableArticleLights[i];
			editableArticleLights[i] = editableArticleLights[i - 1];
			editableArticleLights[i - 1] = temp;
			editableArticleLights = [...editableArticleLights];
		}
	};

	const createPositionDownHandler = (i: number) => () => {
		if (0 <= i && i < editableArticleLights.length - 1) {
			const temp = editableArticleLights[i];
			editableArticleLights[i] = editableArticleLights[i + 1];
			editableArticleLights[i + 1] = temp;
			editableArticleLights = [...editableArticleLights];
		}
	};

	const createPositionRemoveHandler = (i: number) => () => {
		if (0 <= i && i < editableArticleLights.length) {
			editableArticleLights = editableArticleLights.filter((article, index) => index !== i);
		}
	};

	// function
	function clearCounterIncrease() {
		removeCounter = 0;
		if (counterIncreaserId != null) {
			clearTimeout(counterIncreaserId);
			counterIncreaserId = null;
		}
	}
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="article-series-page">
	{#if isEditable}
		<div class="interaction-panel">
			<button on:click={saveEditionHandler}>Save</button>
			<button on:click={cancelEditionHandler}>Cancel</button>
		</div>
		<input
			type="text"
			bind:value={editableName}
		/>
		<ArticleSearch on:accept={addArticleToSeriesHandler} />
		<div class="article-collection">
			{#each editableArticleLights as article, i (article.id)}
				<div class="editable-article-position">
					<button on:click={createPositionUpHandler(i)}>Up</button>
					<button on:click={createPositionDownHandler(i)}>Down</button>
					<button on:click={createPositionRemoveHandler(i)}>Remove</button>
					<ArticleLight articleLight={article} />
				</div>
				<div class="delimiter" />
			{/each}
		</div>
	{:else}
		<div class="interaction-panel">
			<button on:click={editHandler}>Edit</button>
			<button
				on:mousedown={removeMouseDownHandler}
				on:mouseup={removeMouseUpHandler}
			>
				Remove
			</button>
			{#if isGoingRemove}
				<div class="remove-counter">{removeCounter}</div>
			{/if}
		</div>
		<div class="article-series-name">
			{articleSeries.name}
		</div>
		<div class="article-collection">
			{#each articleLights as article}
				<ArticleLight articleLight={article} />
				<div class="delimiter" />
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-series-page {
		flex: 1;
		height: 100vh;
		color: $base-contrast-color;
		padding: $wide-size;
		@include column($wide-size);

		input {
			@include standard-input;
			color: black;
		}

		button {
			@include standard-button;
		}

		.interaction-panel {
			@include row($normal-size);
		}

		.article-series-name {
			font-size: x-large;
			margin: $normal-size 0px;
		}

		.article-collection {
			@include scrollable-in-column;

			.delimiter {
				height: $wide-size;
			}
		}

		.editable-article-position {
			@include row-centered($normal-size);
		}

		.observe-panel {
			@include column-stretched($wide-size);
			padding: $wide-size;

			.article-labels {
				@include row-align-start($normal-size);
				max-height: 200px;
				@include scrollable-in-column;
				flex-wrap: wrap;
				padding: $wide-size 0;

				:global(.article-label) {
					min-width: 50px;
				}
			}
		}

		.article-pane {
			// background: $second-gradient;
			padding: $wide-size;
			@include column($wide-size);

			.article-title {
				@include bordered(bottom, $base-contrast-color, 2px);
			}

			input {
				@include standard-input;
				background-color: $base-color;
			}

			h1 {
				font-size: x-large;
				font-weight: bold;
				font-family: Nunito;
				padding-left: $normal-size;
			}
		}

		.article-interaction-panel {
			@include row-justifyied;
		}

		.remove-counter {
			@include standard-container;
			background-color: $strong-color;
		}

		:global(.rich-editor) {
			@include scrollable-in-column;
		}

		:global(.rich-editor .rich-editor-menu) {
			background: $strong-gradient;
		}

		:global(.rich-editor) {
			border-radius: $normal-size;
			flex: 1;
		}

		:global(.rich-text) {
			@include scrollable-in-column;
		}
	}
</style>
