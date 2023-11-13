<script lang="ts">
	import {
		RICH_EXPANDABLE_BLOCK_TITLE_CLASS,
		type DescriptionFragment,
		RICH_EXPANDABLE_BLOCK_CONTENT_CLASS
	} from '$lib/types/rich-text';
	import { getRichTagClass } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	let isOpen = false;
	export let fragment: DescriptionFragment;
	export let isEdition = false;
	let [title, ...bodyContent] = fragment.children;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={getRichTagClass('expandable-block')}>
	<div
		class={RICH_EXPANDABLE_BLOCK_TITLE_CLASS}
		on:click={() => (isOpen = !isOpen)}
	>
		{title}
	</div>
	{#if isOpen || isEdition}
		<div class={RICH_EXPANDABLE_BLOCK_CONTENT_CLASS}>
			{#each bodyContent as child}
				{#if typeof child === 'string'}
					{child}
				{:else}
					<RenderedFragment fragment={child} />
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
</style>
