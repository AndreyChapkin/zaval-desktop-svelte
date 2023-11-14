<script lang="ts">
	import type { DescriptionFragment } from '$lib/types/rich-text';
	import { getRichTagClass } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let fragment: DescriptionFragment;
	export let isEdition = false;
</script>

<div class={getRichTagClass('united-block')}>
	{#each fragment.children as child}
		{#if typeof child === 'string'}
			{child}
		{:else}
			<RenderedFragment fragment={child} {isEdition} />
		{/if}
	{/each}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
</style>
