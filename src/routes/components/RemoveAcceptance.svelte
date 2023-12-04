<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import ModalWindow from './ModalWindow.svelte';

	// state
	let buttonElement: HTMLButtonElement;

	// lifecycle
	onMount(() => {
		buttonElement.focus();
	});

	// events and issuers
	type EventType = {
		accept: void;
		cancel: void;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const acceptHandler = () => {
		dispatch('accept');
	};

	const cancelHandler = () => {
		dispatch('cancel');
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close={cancelHandler}>
	<div class="remove-acceptance">
		<div class="message">Really want to remove?</div>
		<button tabindex="0" bind:this={buttonElement} on:click={acceptHandler}>Yes</button>
	</div>
</ModalWindow>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.remove-acceptance {
		color: $base-contrast-color;
		@include column-justify-and-align-center($wide-size);
		@include screen-sized(20, 20);
		padding: $large-size;
		background-color: $base-dark-color;
		@include bordered(all, $base-color, 1px);

		button {
			@include standard-button;
		}
	}
</style>
