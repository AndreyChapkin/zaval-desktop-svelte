<script lang="ts">
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { presentDate } from '$lib/utils/presentation-helpers';
	import { createEventDispatcher } from 'svelte';

	// state
	export let articleSeries: ArticleSeriesDto;

	// events
	type EventType = {
		select: ArticleSeriesDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const selectCardHandler = (e: MouseEvent) => {
		const LEFT_BUTTON = 0;
		if (e.ctrlKey && e.button === LEFT_BUTTON) {
			dispatch('select', articleSeries);
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="article-series">
	<div class="interaction-panel">
		<div
			class="go-to-series"
			on:click={selectCardHandler}
		>
			<a href={`/article/series/${articleSeries.id}`}>
				<div class="link-area">
					<img
						src={TODO_COMPLEX_ICON_URL}
						alt="composition"
					/>
				</div>
			</a>
		</div>
	</div>
	<div class="article-series-info">
		<div class="series-name">{articleSeries.name}</div>
		<div class="series-date">{presentDate(articleSeries.interactedOn)}</div>
	</div>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-series {
		@include standard-container;
		@include min-max-width(250px, 600px);
		@include row-start($large-size);
		background-color: adjust-color($strong-second-color, $alpha: -0.7);
		color: $base-contrast-color;
		border-width: 2px;
		border-color: $strong-second-color;

		.interaction-panel {
			background-color: $strong-second-dark-color;
			border-radius: 1.5 * $normal-size;
			padding: 0.8 * $normal-size;
			@include column-centered($normal-size);

			.go-to-series {
				@include like-normal-button;
			}
		}

		.article-date {
			font-size: smaller;
			color: $base-weaker-contrast-color;
		}
	}
</style>
