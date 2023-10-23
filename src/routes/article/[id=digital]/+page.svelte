<script lang="ts">
	import {
		bindLabelToArticle,
		getArticleLabels,
		unbindLabelFromArticle,
		updateArticle
	} from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { ArticlePageData } from '$lib/types/pages-data';
	import { CANCEL_ICON_URL } from '$lib/utils/assets-references';
	import RichEditor from '../../components/RichEditor.svelte';
	import RichText from '../../components/RichText.svelte';
	import SplitPane from '../../components/SplitPane.svelte';
	import ArticleLabel from '../components/ArticleLabel.svelte';
	import ArticleLabelSearch from '../components/ArticleLabelSearch.svelte';

	// state
	export let data: ArticlePageData;
	let isContentEditable: boolean = false;
	let isChangingLabels: boolean = false;
	let articleLight = data.articleLight;
	let title: string = articleLight.title;
	let content: string = data.articleContent.content;
	let labels: ArticleLabelDto[] = data.articleLabels;

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

	const chooseLabelHandler = async (chooseEvent: CustomSvelteEvent<ArticleLabelDto>) => {
		let chosenArticleLabel = chooseEvent.detail;
		await bindLabelToArticle(chosenArticleLabel.id, articleLight.id);
		isChangingLabels = false;
		await refreshLabels();
	};

	const createRemoveLabelFromCollectionHandler = (articleLabel: ArticleLabelDto) => async () => {
		await unbindLabelFromArticle(articleLabel.id, articleLight.id);
		await refreshLabels();
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
		labels = freshLabels;
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
			<div class="interaction-panel">
				{#if isContentEditable}
					<button on:click={saveComplexArticleHandler}>Save changes</button>
				{:else if isChangingLabels}
					<ArticleLabelSearch
						on:choose={chooseLabelHandler}
					/>
					<button on:click={cancelLabelAddingHandler}>Stop labels change</button>
				{:else}
					<button on:click={switchToLabelAddingHandler}>Change labels</button>
					<button on:click={editHandler}>Edit article</button>
				{/if}
			</div>
			<div class="article-labels">
				{#each labels as articleLabel}
					{#if isChangingLabels}
						<div class="current-article-label">
							<ArticleLabel {articleLabel} />
							<button on:click={createRemoveLabelFromCollectionHandler(articleLabel)}>
								<img
									src={CANCEL_ICON_URL}
									alt="status"
								/>
							</button>
						</div>
					{:else}
						<ArticleLabel {articleLabel} />
					{/if}
				{/each}
			</div>
			<div class="content-titles">
				{#each data.articleLight.contentTitles as contentTitle}
					<a
						class={`content-title ${chooseContentTitleClass(contentTitle)}`}
						href={`#${contentTitle.id}`}
					>
						{contentTitle.title}
					</a>
				{/each}
			</div>
		</div>

		<div
			slot="second"
			class="article"
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
				<h1>{data.articleLight.title}</h1>
				<RichText richText={data.articleContent.content} />
			{/if}
		</div>
	</SplitPane>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-page {
		flex: 1;
		height: 100vh;
		color: $base-contrast-color;

		button {
			@include standard-button;
		}

		.observe-panel {
			@include column-stretched($wide-size);
			padding: $wide-size;

			.interaction-panel {
				@include row($normal-size);
			}

			.article-labels {
				@include row($normal-size);
				@include bordered(top, $second-light-color, 2px);
				@include bordered(bottom, $second-light-color, 2px);
				padding: $wide-size 0;
			}

			.current-article-label {
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

			.content-titles {
				@include scrollable-in-column;

				.content-title {
					@include standard-container;
					padding-top: $small-size;
					padding-bottom: $small-size;
					display: block;
					cursor: pointer;

					&:hover {
						background-color: $second-light-color;
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

		.article {
			background: $second-gradient;
			padding: $wide-size;
			@include column($wide-size);

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

			:global(.rich-editor) {
				@include scrollable-in-column;
			}

			:global(.rich-editor .rich-editor-menu) {
				background: $strong-gradient;
			}
		}

		:global(.rich-editor) {
			border-radius: $normal-size;
			flex: 1;
		}
	}
</style>
