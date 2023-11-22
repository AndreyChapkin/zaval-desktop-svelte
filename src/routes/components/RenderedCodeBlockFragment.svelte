<script lang="ts">
	import {
		RICH_CODE_BLOCK_CONTENT_CLASS,
		RICH_CODE_BLOCK_ICON_CLASS,
		type DescriptionFragment
	} from '$lib/types/rich-text';
	import { CODE_ICON_URL } from '$lib/utils/assets-references';
	import { getRichTagClass } from '$lib/utils/rich-editor/rich-editor-helpers';

	// data
	export let fragment: DescriptionFragment;
</script>

<div class={getRichTagClass('code-block')}>
	<div class={RICH_CODE_BLOCK_ICON_CLASS}>
		<img
			src={CODE_ICON_URL}
			alt="status"
		/>
	</div>
	<div class={RICH_CODE_BLOCK_CONTENT_CLASS}>
		{#each fragment.children as child}
			{#if typeof child === 'string'}
				{child}
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
