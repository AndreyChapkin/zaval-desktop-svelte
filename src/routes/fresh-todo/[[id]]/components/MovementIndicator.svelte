<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// data
	export let direction: 'forward' | 'backward' = 'forward';

	// events
	type EventType = {
		movementEnd: null;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const movementEnd = () => dispatch('movementEnd');
</script>

<div
	on:animationend={movementEnd}
	class="motion-indicator"
	class:forward-move={direction === "forward"}
	class:backward-move={direction === "backward"}
/>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	$move-distance: 600px;
	$indicatodWidth: 25px;
	$indicatorHeight: 20px;

	.motion-indicator {
		position: absolute;
		top: 2 * $indicatodWidth;
		@include screen-centered-x($indicatodWidth);

		width: $indicatodWidth;
		height: $indicatorHeight;
		background-color: $base-light-color;
		@apply rounded-lg;
	}

	.forward-move {
		@include move-animation(forward, $distance: $move-distance);
	}

	.backward-move {
		@include move-animation(back, $distance: calc(-1 * $move-distance));
	}
</style>
