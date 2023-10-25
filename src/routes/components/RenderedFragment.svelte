<script lang="ts">
	import { setAttributes } from '$lib/actions/set-attributes';
	import { defineRichTypeComplexity, type DescriptionFragment } from '$lib/types/rich-text';
	import { getRichTagClass, getSimpleRichTag } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedListItemFragment from './RenderedListItemFragment.svelte';

	// data
	export let fragment: DescriptionFragment;
	const richComplexity = defineRichTypeComplexity(fragment.richType);
</script>

{#if richComplexity === 'simple'}
	<svelte:element
		this={getSimpleRichTag(fragment.richType)}
		class={getRichTagClass(fragment.richType) ?? ''}
		use:setAttributes={fragment.attributes}
	>
		{#each fragment.children as child}
			{#if typeof child === 'string'}
				{child}
			{:else}
				<svelte:self fragment={child} />
			{/if}
		{/each}
	</svelte:element>
{:else if richComplexity === 'complex'}
	{#if fragment.richType === 'list-item'}
		<RenderedListItemFragment {fragment} />
	{/if}
{/if}

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
</style>
