<script lang="ts">
	import {
		createLabelsCombination,
		findAllArticleSeriesWithAllLabels,
		findAllArticleSeriesWithFragment,
		findAllArticlesWithAllLabels,
		findAllArticlesWithTitleFragment,
		getTheMostPopularLabelsCombinations,
		getTheMostRecentArticleLights,
		getTheMostRecentArticleSeries,
		updateLabelsCombinationPopularity
	} from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { MultipleArticlesPageData } from '$lib/types/pages-data';
	import { compareWithDates, describeArticleSeriesContent } from '$lib/utils/article-helpers';
	import {
		ADD_ARTICLE_ICON_URL,
		ADD_SERIES_ICON_URL,
		CANCEL_ICON_URL,
		EDIT_ICON_URL
	} from '$lib/utils/assets-references';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import LoadingIndicator from '../components/LoadingIndicator.svelte';
	import ModalWindow from '../components/ModalWindow.svelte';
	import SplitPane from '../components/SplitPane.svelte';
	import ArticleLabel from './components/ArticleLabel.svelte';
	import ArticleLabelCombination from './components/ArticleLabelCombination.svelte';
	import ArticleLabelSearchModal from './components/ArticleLabelSearchModal.svelte';
	import ArticleLight from './components/ArticleLight.svelte';
	import ArticleSeries from './components/ArticleSeries.svelte';
	import CreateArticleForm from './components/CreateArticleForm.svelte';
	import CreateArticleSeriesForm from './components/CreateArticleSeriesForm.svelte';

	// state
	export let data: MultipleArticlesPageData;
	let articleSearchFragment = '';
	const dropSearchFragment = () => (articleSearchFragment = '');
	$: articleContents = [...data.articleLights, ...data.articleSeries].toSorted(compareWithDates);
	let topLabelsCombinations = data.topLabelsCombinations;
	let isLoading = false;
	let isChoosingLabels = false;
	let chosenArticleLabels: ArticleLabelDto[] = [];
	let chosenLabelsCombination: FilledLabelsCombinationDto | null = null;
	let isCreatingArticle = false;
	let isCreatingSeries = false;
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
		Promise.all([getTheMostRecentArticleLights(), getTheMostRecentArticleSeries()]).then(
			([articles, series]) => {
				articleContents = [...articles, ...series].toSorted(compareWithDates);
			}
		);
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
			const articleLights = await findAllArticlesWithAllLabels(effectiveLabelIds);
			const articleSeries = await findAllArticleSeriesWithAllLabels(effectiveLabelIds);
			if (articleLights.length > 0 || articleSeries.length > 0) {
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
			articleContents = [...articleLights, ...articleSeries];
			isLoading = false;
		}
	}

	const searchArticlesWithSearchFragmentInhibitly = decreaseNumberOfCalls(async (value: string) => {
		if (value) {
			isLoading = true;
			const articleLights = await findAllArticlesWithTitleFragment(value);
			const articleSeries = await findAllArticleSeriesWithFragment(value);
			articleContents = [...articleLights, ...articleSeries];
			isLoading = false;
		}
	}, 800);
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="multiple-articles-page">
	<SplitPane contextName="MultipleArticlesPage-0">
		<div
			slot="first"
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
		<div
			slot="second"
			class="article-panel"
		>
			<div class="article-interactive-panel">
				<button on:click={() => (isCreatingArticle = true)}>
					<img
						src={ADD_ARTICLE_ICON_URL}
						alt="status"
					/>
				</button>
				<button on:click={() => (isCreatingSeries = true)}>
					<img
						src={ADD_SERIES_ICON_URL}
						alt="status"
					/>
				</button>
				<input
					class="title-search"
					type="text"
					bind:value={articleSearchFragment}
				/>
			</div>
			<div class="article-labels-panel">
				<div class="article-labels-interaction-panel">
					<button on:click={startChoosingLabelsHandler}>
						<img
							src={EDIT_ICON_URL}
							alt="status"
						/>
					</button>
					{#if chosenArticleLabels.length > 0}
						<button on:click={clearLabelsHandler}>
							<img
								src={CANCEL_ICON_URL}
								alt="status"
							/>
						</button>
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
			<div class="article-contents">
				{#if isLoading}
					<LoadingIndicator />
				{:else}
					{#each describeArticleSeriesContent(articleContents) as desc (desc.content.id + desc.type)}
						{#if desc.type === 'series'}
							<ArticleSeries articleSeries={desc.content} />
						{:else}
							<ArticleLight articleLight={desc.content} />
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</SplitPane>
	{#if isCreatingArticle}
		<ModalWindow on:close={() => (isCreatingArticle = false)}>
			<CreateArticleForm />
		</ModalWindow>
	{/if}
	{#if isCreatingSeries}
		<ModalWindow on:close={() => (isCreatingSeries = false)}>
			<CreateArticleSeriesForm />
		</ModalWindow>
	{/if}
	{#if isChoosingLabels}
		<ArticleLabelSearchModal
			{chosenArticleLabels}
			on:cancel={cancelChoosingLabelsHandler}
			on:accept={acceptChosenArticleLabelsHandler}
		/>
	{/if}
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
			@include menu-button;
		}

		img {
			@include icon-normal-sized;
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

			:global(.article-label-combination) {
				margin-bottom: $large-size;
			}
		}

		.article-interactive-panel {
			@include row-center-and-align-center($normal-size);

			input {
				flex: 1;
				@include standard-input;
			}
		}

		.article-labels-panel {
			@include row-start-and-align-center($normal-size);
			// padding: $normal-size;
			margin: $wide-size 0;

			.article-labels-interaction-panel {
				@include row-start($normal-size);
			}

			.article-label-search-collection {
				@include row($normal-size);
				flex-wrap: wrap;
			}
		}

		$article-light-min-width: 300px;

		.article-contents {
			flex: 1;
			@include responsive-grid($article-light-min-width, $large-size, $wide-size);
			@include scrollable-in-column;

			:global(.article-light) {
				flex: 1;
				min-width: $article-light-min-width;
			}
		}

		.article-label {
			@include standard-container;
			background-color: $second-light-color;
			color: $base-contrast-color;
		}
	}
</style>
