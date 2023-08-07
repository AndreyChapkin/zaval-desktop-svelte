<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';

	// const

	// data

	// events and issuers
	type EventType = {
		close: null;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const closeHandler = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			dispatch('close');
		}
	};
</script>

<div
	class="modal-window background"
	on:mousedown={closeHandler}
>
	<div class="modal-window-body">
		<slot />
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.background {
		position: absolute;
		z-index: 10;
		width: 100vw;
		height: 100vh;
		left: 0;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(
			0deg,
			rgba($color: #000000, $alpha: 1) 0%,
			rgba($color: #000000, $alpha: 0.6) 100%
		);

		.modal-window-body {
			border-radius: 5px;
			overflow: hidden;
		}
	}
</style>
