<script lang="ts">
	import {
		bindLabelsToArticle,
		deleteArticle,
		getArticleLabels,
		unbindLabelsFromArticle,
		updateArticle
	} from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { ArticlePageData } from '$lib/types/pages-data';
	import { EDIT_ICON_URL, REMOVE_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import RichEditor from '../../components/RichEditor.svelte';
	import RichText from '../../components/RichText.svelte';
	import SplitPane from '../../components/SplitPane.svelte';
	import ArticleLabel from '../components/ArticleLabel.svelte';
	import ArticleLabelSearchModal from '../components/ArticleLabelSearchModal.svelte';

	// const
	const REMOVE_TIMEOUT_MS = 3000;

	// state
	export let data: ArticlePageData;
	let isContentEditable: boolean = false;
	let isChangingLabels: boolean = false;
	let articleLight = data.articleLight;
	let title: string = articleLight.title;
	let content: string = data.articleContent.content;
	let articleLabels: ArticleLabelDto[] = data.articleLabels;
	let isGoingRemove = false;
	let removeCounter = 0;
	let counterIncreaserId: number | null = null;

	// handlers
	const editHandler = () => {
		isContentEditable = true;
	};

	const saveTitleHandler = (event: KeyboardEvent) => {
		if (event.code === 'Enter') {
			updateArticle(data.articleLight.id, {
				title
			}).then(() => window.location.reload());
		}
	};

	const saveContentEditionHandler = (updateEvent: CustomSvelteEvent<string>) => {
		content = updateEvent.detail;
		updateArticle(data.articleLight.id, {
			content
		}).then(() => window.location.reload());
	};

	const saveComplexArticleHandler = () => {
		const editedContent = flushRichEditor();
		updateArticle(data.articleLight.id, {
			title,
			content: editedContent
		}).then(() => window.location.reload());
	};

	const cancelArticleEditionHandler = (cancelEvent: CustomSvelteEvent<void>) => {
		isContentEditable = false;
	};

	const switchToLabelAddingHandler = () => {
		isChangingLabels = true;
	};

	const cancelLabelAddingHandler = () => {
		isChangingLabels = false;
	};

	const acceptChosenArticleLabelsHandler = async (event: CustomSvelteEvent<ArticleLabelDto[]>) => {
		const excessiveLabelIds = [];
		const neededLabelIds = [];
		let chosenArticleLabelIds = event.detail.map((i) => i.id);
		let currentArticleLabelIds = articleLabels.map((i) => i.id);
		for (let currentId of currentArticleLabelIds) {
			// if doesn't contain
			if (chosenArticleLabelIds.indexOf(currentId) < 0) {
				excessiveLabelIds.push(currentId);
			}
		}
		for (let chosenId of chosenArticleLabelIds) {
			// if doesn't contain
			if (currentArticleLabelIds.indexOf(chosenId) < 0) {
				neededLabelIds.push(chosenId);
			}
		}
		if (excessiveLabelIds.length > 0) {
			await unbindLabelsFromArticle(excessiveLabelIds, articleLight.id);
		}
		if (neededLabelIds.length > 0) {
			await bindLabelsToArticle(neededLabelIds, articleLight.id);
		}
		isChangingLabels = false;
		await refreshLabels();
	};

	const removeMouseDownHandler = () => {
		isGoingRemove = true;
		removeCounter = 0;
		setTimeout(async () => {
			if (isGoingRemove) {
				await deleteArticle(articleLight.id);
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

	// function
	let flushRichEditor: () => string;

	function chooseContentTitleClass(contentTitle: ContentTitleDto): string {
		let result = '';
		switch (contentTitle.level) {
			case 2:
				result = 'second-level';
				break;
			case 3:
				result = 'third-level';
				break;
			case 4:
				result = 'fourth-level';
				break;
		}
		return result;
	}

	async function refreshLabels() {
		const freshLabels = await getArticleLabels(articleLight.id);
		articleLabels = freshLabels;
	}

	function clearCounterIncrease() {
		removeCounter = 0;
		if (counterIncreaserId != null) {
			clearTimeout(counterIncreaserId);
			counterIncreaserId = null;
		}
	}
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="article-page">
	<SplitPane
		type="horizontal"
		contextName="ArticleWithIdPage-0"
		class="container-split"
	>
		<div
			slot="first"
			class="observe-panel"
		>
			<div class="article-interaction-panel">
				{#if !isContentEditable}
					<button on:click={editHandler}>
						<img
							src={EDIT_ICON_URL}
							alt="status"
						/>
					</button>
					<button
						class="remove-button"
						on:mousedown={removeMouseDownHandler}
						on:mouseup={removeMouseUpHandler}
					>
						<img
							src={REMOVE_ICON_URL}
							alt="status"
						/>
					</button>
					{#if isGoingRemove}
						<div class="remove-counter">{removeCounter}</div>
					{/if}
				{/if}
			</div>
			<div class="content-titles">
				{#each data.articleLight.contentTitles as contentTitle}
					<a href={`#${contentTitle.id}`}>
						<div class={`content-title ${chooseContentTitleClass(contentTitle)}`}>
							<div class="content-title-sign">o</div>
							<div class="content-title-name">
								{contentTitle.title}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
		<div
			slot="second"
			class="article-pane"
		>
			{#if isContentEditable}
				<input
					type="text"
					bind:value={title}
					on:keyup={saveTitleHandler}
				/>
				<RichEditor
					richContent={data.articleContent.content}
					bind:flushContent={flushRichEditor}
					on:save={saveContentEditionHandler}
					on:cancel={cancelArticleEditionHandler}
				/>
			{:else}
				<div class="article-title">
					<h1>{data.articleLight.title}</h1>
				</div>
				<RichText richText={data.articleContent.content} />
			{/if}
		</div>
	</SplitPane>
	<div class="article-labels">
		{#if isChangingLabels}
			<ArticleLabelSearchModal
				chosenArticleLabels={articleLabels}
				on:accept={acceptChosenArticleLabelsHandler}
				on:cancel={cancelLabelAddingHandler}
			/>
		{:else}
			<button on:click={switchToLabelAddingHandler}>
				<img
					src={EDIT_ICON_URL}
					alt="status"
				/>
			</button>
		{/if}
		{#each articleLabels as articleLabel}
			<ArticleLabel {articleLabel} />
		{/each}
	</div>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-page {
		@include column;
		flex: 1;
		height: 100vh;
		color: $base-contrast-color;
		min-width: 0px;

		img {
			@include icon-normal-sized;
		}

		button {
			padding: $small-size $normal-size;
			@include menu-button;
		}

		.observe-panel {
			@include column-stretched($wide-size);
			padding: $wide-size;

			.interaction-panel {
				@include column($normal-size);
			}

			.content-titles {
				@include scrollable-in-column;

				.content-title {
					@include standard-container;
					@include row-start($wide-size);
					padding-top: $small-size;
					padding-bottom: $small-size;
					cursor: pointer;

					&:hover {
						background-color: $base-color;
					}
				}

				.second-level {
					margin-left: $large-size;
				}

				.third-level {
					margin-left: 2 * $large-size;
				}

				.fourth-level {
					margin-left: 3 * $large-size;
				}
			}
		}

		.article-pane {
			padding: $wide-size;
			@include column($wide-size);
			overflow: auto;

			input {
				@include standard-input;
				background-color: $base-color;
			}

			.article-title {
				font-family: Nunito;
				padding-left: $normal-size;

				h1 {
					color: $second-more-lighter-color;
					font-weight: bolder;
					font-size: large;
				}
			}
		}

		:global(.split-pane) {
			flex: 1;
		}

		.article-labels {
			@include row($normal-size);
			padding: $small-size 0;

			@include scrollable-in-column-horizontally;

			:global(.article-label) {
				font-size: small;
				padding: $small-size $normal-size;
			}
		}

		.article-interaction-panel {
			@include row;
		}

		.remove-counter {
			@include standard-container;
			padding: $small-size $normal-size;
			background-color: $strong-color;
		}

		.remove-button {
			margin-left: $wide-size;
			&:hover {
				background-color: $strong-color;
			}
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
	}
</style>
