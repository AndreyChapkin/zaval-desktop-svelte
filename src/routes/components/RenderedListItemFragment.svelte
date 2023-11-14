<script lang="ts">
	import {
		RICH_LIST_ITEM_CONTENT_CLASS,
		RICH_LIST_ITEM_SIGN_CLASS,
		type DescriptionFragment
	} from '$lib/types/rich-text';
	import { getRichTagClass } from '$lib/utils/rich-editor/rich-editor-helpers';
	import RenderedFragment from './RenderedFragment.svelte';

	// data
	export let fragment: DescriptionFragment;
	export let isEdition = false;
</script>

<div class={getRichTagClass('list-item')}>
	<div class={RICH_LIST_ITEM_SIGN_CLASS} />
	<div class={RICH_LIST_ITEM_CONTENT_CLASS}>
		{#each fragment.children as child}
			{#if typeof child === 'string'}
				{child}
			{:else}
				<RenderedFragment fragment={child} {isEdition} />
			{/if}
		{/each}
	</div>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
</style>
