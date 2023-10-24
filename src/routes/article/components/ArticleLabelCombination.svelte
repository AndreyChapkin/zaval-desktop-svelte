<script lang="ts">
	import { CHOOSE_ICON_URL, REMOVE_ICON_URL } from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';
	import ArticleLabel from './ArticleLabel.svelte';
	import { deleteLabelsCombination } from '$lib/api/article-calls';

	// state
	export let articleLabelCombination: FilledLabelsCombinationDto;

	// reactivity

	// events and issuers
	type EventType = {
		pick: FilledLabelsCombinationDto;
		remove: FilledLabelsCombinationDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const removeHandler = async () => {
		await deleteLabelsCombination(articleLabelCombination.id);
		dispatch('remove', articleLabelCombination);
	};
	const pickHandler = async () => {
		dispatch('pick', articleLabelCombination);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="article-label-combination">
	<button on:click={pickHandler}>
		<img
			src={CHOOSE_ICON_URL}
			alt="status"
		/>
	</button>
	<div class="article-labels">
		{#each articleLabelCombination.labels as label}
			<ArticleLabel
				isReadOnlyMode={true}
				articleLabel={label}
			/>
		{/each}
	</div>
	<button on:click={removeHandler}>
		<img
			src={REMOVE_ICON_URL}
			alt="status"
		/>
	</button>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-label-combination {
		@include row($normal-size);
		color: $base-contrast-color;

		img {
			@include icon-normal-sized;
		}

		.article-labels {
			@include row-align-start($normal-size);
			flex-wrap: wrap;
		}
	}
</style>
