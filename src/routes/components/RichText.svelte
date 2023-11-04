<script lang="ts">
	import { parseDescription } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let richText: string;
	export let contentContainer: HTMLDivElement | null = null;

	$: descriptionFragments = parseDescription(richText);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="rich-text"
	bind:this={contentContainer}
>
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
			color: rgb(236, 178, 70);
			font-size: larger;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}

		$title-color: rgb(169, 217, 73);
		$title-font-size: 28px;

		:global(.rich-title-1) {
			color: $title-color;
			font-size: $title-font-size;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}
		:global(.rich-title-2) {
			color: adjust-hue($title-color, -15%);
			font-size: $title-font-size - 4px;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}
		:global(.rich-title-3) {
			color: adjust-hue($title-color, -25%);
			font-size: $title-font-size - 8px;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}
		:global(.rich-title-4) {
			color: adjust-hue($title-color, -30%);
			font-size: $title-font-size - 12px;
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
			color: rgb(218, 129, 64);
		}
		:global(.rich-link) {
			color: rgb(125, 180, 212);
			text-decoration: underline dotted;
		}
		:global(ul.rich-list) {
			list-style-type: none;
		}
		:global(.rich-list-item) {
			@include row;
			margin-bottom: $normal-size;
		}
		:global(.rich-list-item-sign) {
			// background-color: $base-contrast-color;
			width: 8px;
			height: 8px;
			border-color: $strong-second-color;
			border-width: 2px;
			border-radius: 5px;
			margin: 6px 8px 0 0;
		}
		:global(.rich-united-block) {
			border-width: $border-small-size;
			border-color: $second-lighter-color;
			border-radius: 5px;
			padding: $normal-size;
		}
	}
</style>
