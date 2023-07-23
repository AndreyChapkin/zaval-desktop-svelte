<script lang="ts">
	import { onMount } from 'svelte';

	// const
	const MIN_PERCENT_SIZE = 15;
	const ADJUST_SIZE = 3;

	// data
	let clazz: string = '';
	export { clazz as class };
	export let type: 'horizontal' | 'vertical' = 'horizontal';
	export let contextName: string;

	const FIRST_AREA_SIZE_KEY = `${contextName}_firstAreaSize`;
	const SECOND_AREA_SIZE_KEY = `${contextName}_secondAreaSize`;

	let areNotSelectable = false;
	let mouseDownCoordinate = 0;

	export let initialFirstPercentSize = Number(
		localStorage.getItem(FIRST_AREA_SIZE_KEY) ?? MIN_PERCENT_SIZE
	);
	let resultFirstPercentSize = initialFirstPercentSize;

	export let initialSecondPercentSize = Number(
		localStorage.getItem(SECOND_AREA_SIZE_KEY) ?? MIN_PERCENT_SIZE
	);
	let resultSecondPercentSize = initialSecondPercentSize;

	let splitContainerSize = 0;
	let splitContainer: HTMLDivElement;

	onMount(() => {
		splitContainerSize =
			(type === 'horizontal' ? splitContainer.offsetWidth : splitContainer.offsetHeight) -
			ADJUST_SIZE;
		let windowResizeListener = () => {
			splitContainerSize =
				(type === 'horizontal' ? splitContainer.offsetWidth : splitContainer.offsetHeight) -
				ADJUST_SIZE;
		};
		window.addEventListener('resize', windowResizeListener);
		return () => window.removeEventListener('resize', windowResizeListener);
	});

	// handlers
	function createSeparatorMouseDownHandler(number: 'first' | 'second'): (e: MouseEvent) => void {
		const documentMouseMoveHandler = (e: MouseEvent) => {
			const mouseCoordinate = type === 'horizontal' ? e.clientX : e.clientY;
			const delta = mouseCoordinate - mouseDownCoordinate;
			const deltaPercent = (delta / splitContainerSize) * 100;
			if (number === 'first') {
				let doResizing = true;
				let newFirstPercentSize = initialFirstPercentSize + deltaPercent;
				if (newFirstPercentSize < MIN_PERCENT_SIZE) {
					newFirstPercentSize = MIN_PERCENT_SIZE;
					doResizing = false;
				}
				let residualPercentSize = 0;
				// two ways to calculate residualPercentSize - if there is third column and not.
				let newSecondPercentSize: number | null = null;
				if ($$slots.third) {
					newSecondPercentSize = Math.max(
						initialSecondPercentSize - deltaPercent,
						MIN_PERCENT_SIZE
					);
					residualPercentSize = 100 - newFirstPercentSize - newSecondPercentSize;
				} else {
					residualPercentSize = 100 - newFirstPercentSize;
				}
				if (residualPercentSize >= MIN_PERCENT_SIZE && doResizing) {
					resultFirstPercentSize = newFirstPercentSize;
					if ($$slots.third && newSecondPercentSize !== null) {
						resultSecondPercentSize = newSecondPercentSize;
					}
				}
			} else {
				let newSecondPercentSize = Math.max(
					initialSecondPercentSize + deltaPercent,
					MIN_PERCENT_SIZE
				);
				let residualPercentSize = 100 - resultFirstPercentSize - newSecondPercentSize;
				if (residualPercentSize >= MIN_PERCENT_SIZE) {
					resultSecondPercentSize = newSecondPercentSize;
				}
			}
		};
		const documentMouseUpHandler = (e: MouseEvent) => {
			areNotSelectable = false;
			if (number === 'first') {
				initialFirstPercentSize = resultFirstPercentSize;
				localStorage.setItem(FIRST_AREA_SIZE_KEY, String(initialFirstPercentSize));
				if ($$slots.third) {
					initialSecondPercentSize = resultSecondPercentSize;
					localStorage.setItem(SECOND_AREA_SIZE_KEY, String(initialSecondPercentSize));
				}
			} else {
				initialSecondPercentSize = resultSecondPercentSize;
				localStorage.setItem(SECOND_AREA_SIZE_KEY, String(initialSecondPercentSize));
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
			mouseDownCoordinate = type === 'horizontal' ? e.clientX : e.clientY;
			document.addEventListener('mousemove', documentMouseMoveHandler);
			document.addEventListener('mouseup', documentMouseUpHandler);
			document.body.style['cursor'] = type === 'horizontal' ? 'col-resize' : 'row-resize';
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
		style={`${type === 'horizontal' ? 'width' : 'height'}: ${resultFirstPercentSize}%`}
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
		style={$$slots.third
			? `${type === 'horizontal' ? 'width' : 'height'}: ${resultSecondPercentSize}%`
			: 'flex: 1'}
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
			style="flex: 1"
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
			@include styled-scrollbar;
			box-sizing: border-box;
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
		& > .split-separator {
			cursor: col-resize;
			width: 3px;
			min-height: 100%;
		}
	}

	.vertical {
		flex-direction: column;
		align-items: stretch;

		& > .split-separator {
			cursor: row-resize;
			height: 3px;
		}
	}
</style>
