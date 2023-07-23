<script lang="ts">
	// const

	// data
	let clazz: string = '';
	export { clazz as class };
	export let type: 'horizontal' | 'vertical' = 'horizontal';
	export let contextName: string;

	const FIRST_SEPARATOR_POSITION_KEY = `${contextName}_firstSeparatorPosition`;
	const SECOND_SEPARATOR_POSITION_KEY = `${contextName}_secondSeparatorPosition`;

	let areNotSelectable = false;
	let mouseDownPosition = 0;

	export let initialFirstSize = Number(localStorage.getItem(FIRST_SEPARATOR_POSITION_KEY) ?? 100);
	let resultFirstSize = initialFirstSize;

	export let initialSecondSize = Number(localStorage.getItem(SECOND_SEPARATOR_POSITION_KEY) ?? 100);
	let resultSecondSize = initialSecondSize;

	// handlers
	function createSeparatorMouseDownHandler(number: 'first' | 'second'): (e: MouseEvent) => void {
		const documentMouseMoveHandler = (e: MouseEvent) => {
			const mouseCoordinate = type === 'horizontal' ? e.clientX : e.clientY;
			const delta = mouseCoordinate - mouseDownPosition;
			if (number === 'first') {
				resultFirstSize = initialFirstSize + delta;
				if ($$slots.third) {
					resultSecondSize = initialSecondSize - delta;
				}
			} else {
				resultSecondSize = initialSecondSize + delta;
			}
		};
		const documentMouseUpHandler = (e: MouseEvent) => {
			areNotSelectable = false;
			if (number === 'first') {
				initialFirstSize = resultFirstSize;
				localStorage.setItem(FIRST_SEPARATOR_POSITION_KEY, String(initialFirstSize));
				if ($$slots.third) {
					initialSecondSize = resultSecondSize;
					localStorage.setItem(SECOND_SEPARATOR_POSITION_KEY, String(initialSecondSize));
				}
			} else {
				initialSecondSize = resultSecondSize;
				localStorage.setItem(SECOND_SEPARATOR_POSITION_KEY, String(initialSecondSize));
			}
			document.removeEventListener('mousemove', documentMouseMoveHandler);
			document.removeEventListener('mouseup', documentMouseUpHandler);
		};
		return (e: MouseEvent) => {
			areNotSelectable = true;
			mouseDownPosition = type === 'horizontal' ? e.clientX : e.clientY;
			document.addEventListener('mousemove', documentMouseMoveHandler);
			document.addEventListener('mouseup', documentMouseUpHandler);
		};
	}
</script>

<div class={`flex-split ${type === 'horizontal' ? 'horizontal' : 'vertical'} ${clazz}`}>
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
		style={$$slots.third
			? `${type === 'horizontal' ? 'width' : 'height'}: ${resultSecondSize}px`
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
		@include full-screen-height;
		display: flex;

		.split-area {
			overflow: auto;
		}

		.split-area > :global(*) {
			min-height: 100%;
			min-width: 100%;
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
		flex-direction: row;

		.split-separator {
			cursor: col-resize;
			width: 6px;
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
