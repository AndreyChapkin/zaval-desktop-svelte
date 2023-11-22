<script lang="ts">
	import { setAttributes } from '$lib/actions/set-attributes';
	import {
		isComplexRichType,
		type DescriptionFragment,
		type RichSimpleTypes
	} from '$lib/types/rich-text';
	import { getRichTagClass, getSimpleRichTag } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedCodeBlockFragment from './RenderedCodeBlockFragment.svelte';
	import RenderedExpandableBlockFragment from './RenderedExpandableBlockFragment.svelte';
	import RenderedListFragment from './RenderedListFragment.svelte';
	import RenderedListItemFragment from './RenderedListItemFragment.svelte';
	import RenderedUnitedBlockFragment from './RenderedUnitedBlockFragment.svelte';

	// data
	export let fragment: DescriptionFragment;
	export let isEdition = false;
	const isComplex = isComplexRichType(fragment.richType);
	const simpleRichType = isComplex ? null : (fragment.richType as RichSimpleTypes);
</script>

{#if isComplex}
	{#if fragment.richType === 'list'}
		<RenderedListFragment {fragment} {isEdition} />
	{:else if fragment.richType === 'list-item'}
		<RenderedListItemFragment {fragment} {isEdition} />
	{:else if fragment.richType === 'code-block'}
		<RenderedCodeBlockFragment {fragment} />
	{:else if fragment.richType === 'united-block'}
		<RenderedUnitedBlockFragment {fragment} {isEdition} />
	{:else if fragment.richType === 'expandable-block'}
		<RenderedExpandableBlockFragment {fragment} {isEdition} />
	{/if}
{:else if simpleRichType}
	<svelte:element
		this={getSimpleRichTag(simpleRichType)}
		class={getRichTagClass(simpleRichType) ?? ''}
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
{/if}

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
</style>
