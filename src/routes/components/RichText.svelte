<script lang="ts">
	import { parseDescription } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let richText: string;
	export let isEdition = false;
	export let contentContainer: HTMLDivElement | null = null;

	$: descriptionFragments = parseDescription(richText);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="rich-text"
	bind:this={contentContainer}
>
	{#each descriptionFragments as fragment}
		<RenderedFragment
			{fragment}
			{isEdition}
		/>
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
		color: $base-contrast-color;

		:global(.rich-title) {
			color: rgb(236, 178, 70);
			font-size: larger;
			font-weight: bold;
			font-family: Nunito;
			margin-bottom: $normal-size;
		}

		$title-color: rgb(208, 170, 87);
		$title-font-size: 28px;

		:global(.rich-title-1) {
			color: $title-color;
			font-size: $title-font-size;
			font-weight: bold;
			font-family: Nunito;
			margin: $large-size 0;
			@include bordered(left, $title-color, $normal-size);
			padding-left: $wide-size;
		}
		:global(.rich-title-2) {
			color: $title-color;
			font-size: $title-font-size - 4px;
			font-weight: bold;
			font-family: Nunito;
			margin: $wide-size 0;
		}
		:global(.rich-title-3) {
			color: darken($title-color, 12%);
			font-size: $title-font-size - 8px;
			font-weight: bold;
			font-family: Nunito;
			margin: $wide-size 0;
		}
		:global(.rich-title-4) {
			color: darken($title-color, 12%);
			font-size: $title-font-size - 12px;
			font-weight: bold;
			font-family: Nunito;
			margin: $wide-size 0;
		}
		:global(.rich-paragraph) {
			color: $base-contrast-color;
			margin-bottom: $normal-size;
			font-family: Nunito;
		}
		:global(.rich-unknown) {
			@include standard-container;
			background-color: rgb(173, 30, 30);
		}
		:global(.rich-strong) {
			color: rgb(226, 136, 196);
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
			width: 6px;
			height: 6px;
			border-color: $strong-second-color;
			background-color: $strong-second-color;
			border-width: 2px;
			// border-radius: 5px;
			margin: 10px 10px 0 0;
		}
		:global(.rich-united-block) {
			border-width: $border-small-size;
			border-color: $second-lighter-color;
			border-radius: 5px;
			padding: $normal-size;
			margin: $wide-size 0;
		}
		:global(.rich-expandable-block) {
			@include column-start;
			border-width: $border-small-size;
			border-color: $second-lighter-color;
			border-radius: 5px;
			margin: $wide-size 0;
			overflow: hidden;
		}
		:global(.rich-expandable-block-title) {
			background-color: $second-light-color;
			padding: $normal-size;
			cursor: pointer;
		}
		:global(.rich-expandable-block-content) {
			padding: $normal-size;
		}
		:global(.rich-code-block) {
			@include row-start;
			border-radius: 5px;
			margin: $large-size 0;
			background-color: $base-darker-color;
			position: relative;
		}
		:global(.rich-code-block-icon) {
			@include row;
			background-color: $second-light-color;
			padding: $normal-size;
			cursor: pointer;
			position: absolute;
			top: -10px;
			left: 10px;
			width: 25px;
			height: 20px;
		}
		:global(.rich-code-block-icon img) {
			@include icon-normal-sized;
			position: absolute;
			left: 2px;
			top: 0px;
		}
		:global(.rich-code-block-content) {
			font-family: 'Courier New', Courier, monospace;
			padding: 1.5 * $wide-size $wide-size;
			overflow-x: auto;
			@include styled-scrollbar;
		}
	}
</style>
