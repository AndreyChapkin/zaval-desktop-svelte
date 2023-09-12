<script lang="ts">
	import type { DetailedTodoDto } from '$lib/types/todo';
	import { CANCEL_ICON_URL, EDIT_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import { parseDescription } from '$lib/utils/rich-editor-helpers';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let richText: string;
	$: descriptionFragments = parseDescription(richText);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="rich-text">
	{#each descriptionFragments as fragment}
		<RenderedFragment {fragment} />
	{/each}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	@font-face {
		font-family: Nunito;
		font-weight: normal;
		src: url('$lib/assets/fonts/Nunito-Regular.ttf');
	}

	@font-face {
		font-family: Nunito;
		font-weight: bold;
		src: url('$lib/assets/fonts/Nunito-Black.ttf');
	}

	.rich-text {
		position: relative;
		overflow: auto;
		padding: $normal-size;
		outline: none;
		white-space: pre-wrap;
		@include styled-scrollbar;

		:global(.rich-title) {
			color: rgb(182, 93, 126);
			font-size: large;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}
		:global(.rich-paragraph) {
			color: $base-contrast-color;
			margin-bottom: $normal-size;
			font-family: Nunito;
		}
		:global(.rich-strong) {
			color: rgb(224, 181, 102);
		}
		:global(.rich-link) {
			color: rgb(125, 180, 212);
			text-decoration: underline dotted;
		}
		:global(.rich-placeholder) {
			border-width: $border-small-size;
			border-color: $strong-second-color;
		}
	}
</style>
