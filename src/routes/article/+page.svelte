<script lang="ts">
	import {
		createLabelsCombination,
		findAllArticlesWithAllLabels,
		getTheMostPopularLabelsCombinations,
		updateLabelsCombinationPopularity
	} from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { MultipleArticlesPageData } from '$lib/types/pages-data';
	import { CANCEL_ICON_URL } from '$lib/utils/assets-references';
	import SplitPane from '../components/SplitPane.svelte';
	import ArticleLabel from './components/ArticleLabel.svelte';
	import ArticleLabelCombination from './components/ArticleLabelCombination.svelte';
	import ArticleLabelSearch from './components/ArticleLabelSearch.svelte';
	import ArticleLight from './components/ArticleLight.svelte';

	// state
	export let data: MultipleArticlesPageData;
	let articleLights: ArticleLightDto[] = data.articleLights;
	let topLabelsCombinations = data.topLabelsCombinations;
	let isLoading = false;
	let chosenArticleLabel: ArticleLabelDto | null = null;
	let currentArticleLabels: ArticleLabelDto[] = [];
	let chosenLabelsCombination: FilledLabelsCombinationDto | null = null;

	// reactivity
	$: if (chosenArticleLabel) {
		// Add new label to the current labels collection
		const isPresented =
			currentArticleLabels.findIndex((i) => i.id === chosenArticleLabel!!.id) > -1;
		if (!isPresented) {
			currentArticleLabels = [...currentArticleLabels, chosenArticleLabel];
		}
		chosenArticleLabel = null;
		// Current label collection is changed - chosen label collection is not relevant
		chosenLabelsCombination = null;
	}

	// handlers
	const onLabelUpdateHandler = async (event: CustomSvelteEvent<ArticleLabelDto>) => {
		const updatedDto = event.detail;
		currentArticleLabels = currentArticleLabels.map((label) => {
			return label.id === updatedDto.id ? updatedDto : label;
		});
		await refreshCombinations();
	};

	const onLabelRemoveHandler = async (event: CustomSvelteEvent<ArticleLabelDto>) => {
		const removedDto = event.detail;
		currentArticleLabels = currentArticleLabels.filter((label) => {
			return label.id !== removedDto.id;
		});
		await refreshCombinations();
	};

	const createRemoveLabelFromCollectionHandler = (articleLabel: ArticleLabelDto) => () => {
		const filteredLabels = currentArticleLabels.filter((label) => label.id !== articleLabel.id);
		currentArticleLabels = [...filteredLabels];
		// Current label collection is changed - chosen label collection is not relevant
		chosenLabelsCombination = null;
	};

	const searchArticlesWithLabelsHandler = async () => {
		await searchArticlesWithLabels();
	};

	const removeCombinationHandler = () => {
		refreshCombinations();
	};

	const pickCombinationHandler = async (pickEvent: CustomSvelteEvent<FilledLabelsCombinationDto>) => {
		const combination = pickEvent.detail;
		chosenLabelsCombination = combination;
		currentArticleLabels = chosenLabelsCombination.labels;
		await searchArticlesWithLabels();
		await refreshCombinations();
	};

	// functions
	async function refreshCombinations() {
		const refreshedCombinations = await getTheMostPopularLabelsCombinations();
		topLabelsCombinations = refreshedCombinations;
	}

	async function searchArticlesWithLabels() {
		const effectiveLabelIds = chosenLabelsCombination
			? chosenLabelsCombination.labels.map((i) => i.id)
			: currentArticleLabels.map((i) => i.id);
		if (effectiveLabelIds.length > 0) {
			isLoading = true;
			articleLights = await findAllArticlesWithAllLabels(effectiveLabelIds);
			if (articleLights.length > 0) {
				if (chosenLabelsCombination === null) {
					// If it was new labels combination and some articles are fetched then remember that combination
					await createLabelsCombination(effectiveLabelIds);
				} else {
					// It was existed combination then increase its popularity
					await updateLabelsCombinationPopularity(
						chosenLabelsCombination.id,
						chosenLabelsCombination.popularity + 1
					);
				}
				refreshCombinations();
			}
			isLoading = false;
		}
	}
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="multiple-articles-page">
	<SplitPane contextName="MultipleArticlesPage-0">
		<SplitPane
			slot="first"
			type="vertical"
			contextName="MultipleArticlesPage"
		>
			<div
				slot="first"
				class="article-labels-panel"
			>
				<ArticleLabelSearch bind:chosenArticleLabel />
				{#if currentArticleLabels.length > 0}
					<button on:click={searchArticlesWithLabelsHandler}>Search</button>
				{/if}
				<div class="current-labels-combination">
					{#each currentArticleLabels as articleLabel}
						<div class="current-collection-article-label">
							<ArticleLabel
								{articleLabel}
								on:edit={onLabelUpdateHandler}
								on:remove={onLabelRemoveHandler}
							/>
							<button on:click={createRemoveLabelFromCollectionHandler(articleLabel)}>
								<img
									src={CANCEL_ICON_URL}
									alt="status"
								/>
							</button>
						</div>
					{/each}
				</div>
			</div>
			<div
				slot="second"
				class="top-labels-combinations"
			>
				{#each topLabelsCombinations as articleLabelCombination}
					<ArticleLabelCombination
						{articleLabelCombination}
						on:pick={pickCombinationHandler}
						on:remove={removeCombinationHandler}
					/>
				{/each}
			</div>
		</SplitPane>
		<div
			slot="second"
			class="article-panel"
		>
			<div class="article-interactive-panel">
				<input
					class="title-search"
					type="text"
				/>
			</div>
			<div class="article-lights">
				{#each articleLights as article}
					<ArticleLight articleLight={article} />
				{/each}
			</div>
		</div>
	</SplitPane>
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
		@include column;

		button {
			@include standard-button;
		}

		.article-labels-panel {
			@include column($normal-size);
			padding-right: $normal-size;
		}

		.current-collection-article-label {
			@include row($small-size);

			button {
				background-color: transparent;

				&:hover {
					background-color: $base-color;
				}
			}

			img {
				@include icon-small-sized;
			}
		}

		.article-interactive-panel {
			@include row-start($normal-size);
			margin-bottom: $large-size;

			input {
				flex: 1;
				@include standard-input;
			}
		}

		.current-labels-combination {
			@include row($normal-size);
		}

		.article-lights {
			@include responsive-grid($x-gap: $wide-size, $y-gap: $wide-size);
		}

		.article-label {
			@include standard-container;
			background-color: $second-light-color;
			color: $base-contrast-color;
		}
	}
</style>
