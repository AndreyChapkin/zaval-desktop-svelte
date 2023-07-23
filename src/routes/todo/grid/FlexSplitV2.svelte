<script lang="ts">
	import { onMount } from 'svelte';

	// const
	const MIN_SIZE = 150;
	const ADJUST_SIZE = 3;

	// data
	let clazz: string = '';
	export { clazz as class };
	export let type: 'horizontal' | 'vertical' = 'horizontal';
	export let contextName: string;

	const FIRST_AREA_SIZE_KEY = `${contextName}_firstAreaSize`;
	const SECOND_AREA_SIZE_KEY = `${contextName}_secondAreaSize`;

	let areNotSelectable = false;
	let mouseDownPosition = 0;

	export let initialFirstSize = Number(localStorage.getItem(FIRST_AREA_SIZE_KEY) ?? MIN_SIZE);
	let resultFirstSize = initialFirstSize;

	export let initialSecondSize = Number(localStorage.getItem(SECOND_AREA_SIZE_KEY) ?? MIN_SIZE);
	let resultSecondSize = initialSecondSize;

	let resultThirdSize: number;

	let splitContainerSize = 0;
	let splitContainer: HTMLDivElement;

	onMount(() => {
		splitContainerSize =
			(type === 'horizontal' ? splitContainer.offsetWidth : splitContainer.offsetHeight) -
			ADJUST_SIZE;
		if ($$slots.third) {
			resultThirdSize = splitContainerSize - resultFirstSize - resultSecondSize;
		} else {
			resultSecondSize = splitContainerSize - resultFirstSize;
		}
	});

	// handlers
	function createSeparatorMouseDownHandler(number: 'first' | 'second'): (e: MouseEvent) => void {
		const documentMouseMoveHandler = (e: MouseEvent) => {
			const mouseCoordinate = type === 'horizontal' ? e.clientX : e.clientY;
			const delta = mouseCoordinate - mouseDownPosition;
			if (number === 'first') {
				let newSize = initialFirstSize + delta;
				if (newSize >= MIN_SIZE) {
					resultFirstSize = newSize;
				}
				if ($$slots.third) {
					let newSize = initialSecondSize - delta;
					if (newSize >= MIN_SIZE) {
						resultSecondSize = newSize;
					}
				} else {
					let newSize = splitContainerSize - resultFirstSize;
					if (newSize >= MIN_SIZE) {
						resultSecondSize = newSize;
					}
				}
			} else {
				let newSize = initialSecondSize + delta;
				if (newSize >= MIN_SIZE) {
					resultSecondSize = newSize;
				}
				if ($$slots.third) {
					let newSize = splitContainerSize - resultFirstSize - resultSecondSize;
					if (newSize >= MIN_SIZE) {
						resultThirdSize = newSize;
					}
				}
			}
		};
		const documentMouseUpHandler = (e: MouseEvent) => {
			areNotSelectable = false;
			if (number === 'first') {
				initialFirstSize = resultFirstSize;
				localStorage.setItem(FIRST_AREA_SIZE_KEY, String(initialFirstSize));
				if ($$slots.third) {
					initialSecondSize = resultSecondSize;
					localStorage.setItem(SECOND_AREA_SIZE_KEY, String(initialSecondSize));
				}
			} else {
				initialSecondSize = resultSecondSize;
				localStorage.setItem(SECOND_AREA_SIZE_KEY, String(initialSecondSize));
			}
			document.removeEventListener('mousemove', documentMouseMoveHandler);
			document.removeEventListener('mouseup', documentMouseUpHandler);
			document.body.style['cursor'] = '';
			// otherwise there is unintentional text selection
			window.getSelection()?.removeAllRanges();
		};
		return (e: MouseEvent) => {
			// bad behaviour if there is any selected text
			window.getSelection()?.removeAllRanges();
			areNotSelectable = true;
			mouseDownPosition = type === 'horizontal' ? e.clientX : e.clientY;
			document.addEventListener('mousemove', documentMouseMoveHandler);
			document.addEventListener('mouseup', documentMouseUpHandler);
			document.body.style['cursor'] = 'row-resize';
		};
	}
</script>

<div
	bind:this={splitContainer}
	class={`flex-split ${type === 'horizontal' ? 'horizontal' : 'vertical'} ${clazz}`}
>
	<div
		class="split-area"
		class:not-selectable={areNotSelectable}
		style={`${type === 'horizontal' ? 'width' : 'height'}: ${resultFirstSize}px`}
	>
		<slot name="first" />
	</div>
	<div
		class="split-separator"
		on:mousedown={createSeparatorMouseDownHandler('first')}
	/>
	<div
		class="split-area"
		class:not-selectable={areNotSelectable}
		style={`${type === 'horizontal' ? 'width' : 'height'}: ${resultSecondSize}px`}
	>
		<slot name="second" />
	</div>
	{#if $$slots.third}
		<div
			class="split-separator"
			on:mousedown={createSeparatorMouseDownHandler('second')}
		/>
		<div
			class="split-area"
			class:not-selectable={areNotSelectable}
			style={`${type === 'horizontal' ? 'width' : 'height'}: ${resultThirdSize}px`}
		>
			<slot name="third" />
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.flex-split {
		display: flex;
		height: 100%;
		flex: 1;
		width: 100%;
		background-color: red;

		.split-area {
			overflow: auto;
			/* @include styled-scrollbar; */
			box-sizing: border-box;
		}

		:global(.split-area > *) {
			/* min-height: 100%;
			min-width: 100%; */
			/* height: 200px; */
			/* height: 10%; */
		}

		.split-separator {
			background-color: $base-dark-color;
			flex-grow: 0;
			flex-shrink: 0;
		}

		.not-selectable {
			user-select: none;
			pointer-events: none;
		}
	}

	.horizontal {
		/* align-items: stretch; */

		.split-separator {
			cursor: col-resize;
			width: 3px;
			min-height: 100%;
		}
	}

	.vertical {
		flex-direction: column;
		align-items: stretch;

		.split-separator {
			cursor: row-resize;
			height: 3px;
		}
	}
</style>
