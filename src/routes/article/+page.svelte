<script lang="ts">
	import {
		createLabelsCombination,
		findAllArticlesWithAllLabels,
		findAllArticlesWithTitleFragment,
		getTheMostPopularLabelsCombinations,
		getTheMostRecentArticleLights,
		updateLabelsCombinationPopularity
	} from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { MultipleArticlesPageData } from '$lib/types/pages-data';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import LoadingIndicator from '../components/LoadingIndicator.svelte';
	import SplitPane from '../components/SplitPane.svelte';
	import ArticleLabel from './components/ArticleLabel.svelte';
	import ArticleLabelCombination from './components/ArticleLabelCombination.svelte';
	import ArticleLabelSearch from './components/ArticleLabelSearch.svelte';
	import ArticleLight from './components/ArticleLight.svelte';
	import CreateArticle from './components/CreateArticle.svelte';

	// state
	export let data: MultipleArticlesPageData;
	let articleSearchFragment = '';
	const dropSearchFragment = () => (articleSearchFragment = '');
	let articleLights: ArticleLightDto[] = data.articleLights;
	let topLabelsCombinations = data.topLabelsCombinations;
	let isLoading = false;
	let isChoosingLabels = false;
	let chosenArticleLabels: ArticleLabelDto[] = [];
	let chosenLabelsCombination: FilledLabelsCombinationDto | null = null;
	const dropLabels = () => {
		if (chosenArticleLabels.length > 0) {
			chosenArticleLabels = [];
		}
		if (chosenLabelsCombination) {
			chosenLabelsCombination = null;
		}
	};

	// reactivity
	$: if (!articleSearchFragment && chosenArticleLabels.length < 1 && !chosenLabelsCombination) {
		getTheMostRecentArticleLights().then((articles) => {
			articleLights = articles;
		});
	}

	$: if (articleSearchFragment) {
		searchArticlesWithSearchFragmentInhibitly(articleSearchFragment);
		dropLabels();
	}

	$: if (chosenArticleLabels.length > 0 || chosenLabelsCombination) {
		dropSearchFragment();
	}

	// handlers
	const onLabelUpdateHandler = async (event: CustomSvelteEvent<ArticleLabelDto>) => {
		const updatedDto = event.detail;
		chosenArticleLabels = chosenArticleLabels.map((label) => {
			return label.id === updatedDto.id ? updatedDto : label;
		});
		await refreshCombinations();
	};

	const onLabelRemoveHandler = async (event: CustomSvelteEvent<ArticleLabelDto>) => {
		const removedDto = event.detail;
		chosenArticleLabels = chosenArticleLabels.filter((label) => {
			return label.id !== removedDto.id;
		});
		await refreshCombinations();
	};

	const searchArticlesWithLabelsHandler = async () => {
		await searchArticlesWithLabels();
	};

	const removeCombinationHandler = () => {
		refreshCombinations();
	};

	const acceptChosenArticleLabelsHandler = async (event: CustomSvelteEvent<ArticleLabelDto[]>) => {
		chosenArticleLabels = event.detail;
		isChoosingLabels = false;
		await searchArticlesWithLabels();
	};

	const startChoosingLabelsHandler = () => {
		isChoosingLabels = true;
	};

	const clearLabelsHandler = () => {
		chosenArticleLabels = [];
	};

	const cancelChoosingLabelsHandler = () => {
		isChoosingLabels = false;
	};

	const pickCombinationHandler = async (
		pickEvent: CustomSvelteEvent<FilledLabelsCombinationDto>
	) => {
		const combination = pickEvent.detail;
		chosenLabelsCombination = combination;
		chosenArticleLabels = chosenLabelsCombination.labels;
		await searchArticlesWithLabels();
	};

	// functions
	async function refreshCombinations() {
		const refreshedCombinations = await getTheMostPopularLabelsCombinations();
		topLabelsCombinations = refreshedCombinations;
	}

	async function searchArticlesWithLabels() {
		const effectiveLabelIds = chosenLabelsCombination
			? chosenLabelsCombination.labels.map((i) => i.id)
			: chosenArticleLabels.map((i) => i.id);
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

	const searchArticlesWithSearchFragmentInhibitly = decreaseNumberOfCalls(async (value: string) => {
		if (value) {
			isLoading = true;
			articleLights = await findAllArticlesWithTitleFragment(value);
			isLoading = false;
		}
	}, 800);
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
				<div class="article-labels-interaction-panel">
					{#if isChoosingLabels}
						<ArticleLabelSearch
							isOpen={true}
							autofocus={true}
							{chosenArticleLabels}
							on:cancel={cancelChoosingLabelsHandler}
							on:accept={acceptChosenArticleLabelsHandler}
						/>
					{:else}
						<button on:click={startChoosingLabelsHandler}>Choose labels</button>
						<button on:click={clearLabelsHandler}>Clear labels</button>
					{/if}
				</div>
				<div class="article-label-search-collection">
					{#each chosenArticleLabels as articleLabel}
						<ArticleLabel
							{articleLabel}
							on:edit={onLabelUpdateHandler}
							on:remove={onLabelRemoveHandler}
						/>
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
					<div class="delimiter" />
				{/each}
			</div>
		</SplitPane>
		<div
			slot="second"
			class="article-panel"
		>
			<div class="article-interactive-panel">
				<CreateArticle />
				<input
					class="title-search"
					type="text"
					bind:value={articleSearchFragment}
				/>
			</div>
			<div class="article-lights">
				{#if isLoading}
					<LoadingIndicator />
				{:else}
					{#each articleLights as article}
						<ArticleLight articleLight={article} />
					{/each}
				{/if}
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
		@include column;

		button {
			@include standard-button;
		}

		.article-labels-panel {
			@include column($normal-size);
			padding: $normal-size;

			.article-labels-interaction-panel {
				@include row-start($normal-size);
				margin-bottom: $large-size;
			}
		}

		:global(.article-label-search) {
			flex: 1;
		}

		.article-panel {
			padding: $normal-size;
			@include column($normal-size);
		}

		.top-labels-combinations {
			padding: $normal-size;

			.delimiter {
				height: 2px;
				background-color: $second-light-color;
				margin: $wide-size 0;
			}
		}

		.article-interactive-panel {
			@include row-centered($normal-size);
			margin-bottom: $large-size;

			input {
				flex: 1;
				@include standard-input;
			}
		}

		.article-label-search-collection {
			@include row($normal-size);
			flex-wrap: wrap;
		}

		.article-lights {
			@include row($wide-size);
			flex-wrap: wrap;

			:global(.article-light) {
				flex: 1;
				min-width: 300px;
			}
		}

		.article-label {
			@include standard-container;
			background-color: $second-light-color;
			color: $base-contrast-color;
		}
	}
</style>
