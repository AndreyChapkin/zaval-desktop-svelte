<script lang="ts">
	import type { MultipleArticlesPageData } from '$lib/types/pages-data';
	import ArticleLight from './components/ArticleLight.svelte';

	// state
	export let data: MultipleArticlesPageData;

	// handlers
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="multiple-articles-page">
	<div class="article-lights">
		{#each data.articleLights as article}
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

		.article-lights {
			@include responsive-grid($x-gap: $wide-size, $y-gap: $wide-size);
		}
	}
</style>
