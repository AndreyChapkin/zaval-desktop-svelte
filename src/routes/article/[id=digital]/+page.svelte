<script lang="ts">
	import { updateArticle } from '$lib/api/article-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { ArticlePageData } from '$lib/types/pages-data';
	import RichEditor from '../../components/RichEditor.svelte';
	import RichText from '../../components/RichText.svelte';
	import SplitPane from '../../components/SplitPane.svelte';

	// state
	export let data: ArticlePageData;
	let isContentEditable: boolean = false;
	let content: string = data.articleContent.content;
	let title: string = data.articleLight.title;

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
	const saveContentHandler = (updateEvent: CustomSvelteEvent<string>) => {
		content = updateEvent.detail;
		updateArticle(data.articleLight.id, {
			content
		}).then(() => window.location.reload());
	};
	const saveAllHandler = () => {
		const editedContent = flushRichEditor();
		updateArticle(data.articleLight.id, {
			title,
			content: editedContent
		}).then(() => window.location.reload());
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
			class="interaction-panel"
		>
			{#if isContentEditable}
				<button
					class="save-action"
					on:click={saveAllHandler}
				>
					Save changes
				</button>
			{:else}
				<button
					class="edit-action"
					on:click={editHandler}
				>
					Edit article
				</button>
				<div class="content-titles">
					{#each data.articleLight.contentTitles as contentTitle}
						<a class={`content-title ${chooseContentTitleClass(contentTitle)}`} href={`#${contentTitle.id}`}>
							{contentTitle.title}
						</a>
					{/each}
				</div>
			{/if}
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
					on:save={saveContentHandler}
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

		.interaction-panel {
			@include column-stretched($wide-size);
			padding: $wide-size;

			.edit-action,
			.save-action {
				@include standard-button;
			}

			.content-titles {
				@include scrollable-in-column;
				
				.content-title {
					// padding: $small-size;
					// border-radius: $normal-size;
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
