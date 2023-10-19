<script lang="ts">
	import type { MultipleArticlesPageData } from '$lib/types/pages-data';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import ArticleLight from './components/ArticleLight.svelte';

	// state
	export let data: MultipleArticlesPageData;
	let articleLights: ArticleLightDto[] = data.articleLights;
	let labelNames: string[];
	let isLoading = false;

	// handlers

	// functions
	const searchLabels = decreaseNumberOfCalls((value: string) => {
		isLoading = true;
		find
	}, 500);
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="multiple-articles-page">
	<div class="interactive-panel">
		<button>Add</button>
		<input
			class="title-search"
			type="text"
		/>
		<input
			class="label-search"
			type="text"
		/>
	</div>
	{#if labelNames && labelNames.length > 0}
		<div class="labels-panel">
			{#each labelNames as labelName}
				<div class="label-item">{labelName}</div>
			{/each}
		</div>
	{/if}
	<div class="article-lights">
		{#each articleLights as article}
			<ArticleLight articleLight={article} />
		{/each}
	</div>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.multiple-articles-page {
		flex: 1;
		height: 100vh;
		padding: $wide-size;

		.interactive-panel {
			@include row-start($normal-size);
			margin-bottom: $large-size;

			button {
				@include standard-button;
			}

			input {
				flex: 1;
				@include standard-input;
			}
		}

		.article-lights {
			@include responsive-grid($x-gap: $wide-size, $y-gap: $wide-size);
		}
	}
</style>
