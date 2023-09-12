<script lang="ts">
	import { setAttributes } from "$lib/actions/set-attributes";
	import type { DescriptionFragment } from "$lib/types/rich-text";
	import { getRichTag, getRichTagClass } from "$lib/utils/rich-editor-helpers";

	// data
	export let fragment: DescriptionFragment;
</script>

<svelte:element
	this={getRichTag(fragment.richType)}
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

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	
</style>
