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

	const AREA_SIZE_KEY = `${contextName}_AreaSize`;

	let areNotSelectable = false;
	let mouseDownCoordinate = 0;

	export let initialPercentAreaSize = Number(
		localStorage.getItem(AREA_SIZE_KEY) ?? MIN_PERCENT_SIZE
	);
	let resultPercentAreaSize = initialPercentAreaSize;

	let splitContainerSize = 0;
	let resizablePaneElement: HTMLDivElement;

	onMount(() => {
		splitContainerSize =
			(type === 'horizontal'
				? resizablePaneElement.offsetWidth
				: resizablePaneElement.offsetHeight) - ADJUST_SIZE;
		let windowResizeListener = () => {
			splitContainerSize =
				(type === 'horizontal'
					? resizablePaneElement.offsetWidth
					: resizablePaneElement.offsetHeight) - ADJUST_SIZE;
		};
		window.addEventListener('resize', windowResizeListener);
		return () => window.removeEventListener('resize', windowResizeListener);
	});

	// handlers
	function createSeparatorMouseDownHandler(): (e: MouseEvent) => void {
		const documentMouseMoveHandler = (e: MouseEvent) => {
			const mouseCoordinate = type === 'horizontal' ? e.clientX : e.clientY;
			const delta = mouseCoordinate - mouseDownCoordinate;
			const deltaPercent = (delta / splitContainerSize) * 100;
			let doResizing = true;
			let newPercentAreaSize = initialPercentAreaSize + deltaPercent;
			if (newPercentAreaSize < MIN_PERCENT_SIZE) {
				newPercentAreaSize = MIN_PERCENT_SIZE;
				doResizing = false;
			}
			let residualPercentSize = 0;
			residualPercentSize = 100 - newPercentAreaSize;
			if (residualPercentSize >= MIN_PERCENT_SIZE && doResizing) {
				resultPercentAreaSize = newPercentAreaSize;
			}
		};

		const documentMouseUpHandler = (e: MouseEvent) => {
			areNotSelectable = false;
			initialPercentAreaSize = resultPercentAreaSize;
			localStorage.setItem(AREA_SIZE_KEY, String(initialPercentAreaSize));
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
	bind:this={resizablePaneElement}
	class={`resizable-pane ${type === 'horizontal' ? 'horizontal' : 'vertical'} ${
		clazz ? clazz : 'colored'
	}`}
	style={`${type === 'horizontal' ? 'width' : 'height'}: ${resultPercentAreaSize}%`}
>
	<slot name="first" />
</div>
<div
	class="split-separator"
	on:mousedown={createSeparatorMouseDownHandler()}
/>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.resizable-pane {
		overflow: auto;
		box-sizing: border-box;

		:global(.resizable-pane > div) {
			min-height: 100%;
			min-width: 100%;
		}

		.split-separator {
			flex-grow: 0;
			flex-shrink: 0;
		}

		.not-selectable {
			user-select: none;
			pointer-events: none;
		}
	}

	.horizontal {
		min-height: 0px;

		& > .split-separator {
			cursor: col-resize;
			width: 3px;
			min-height: 100%;
		}
	}

	.vertical {
		min-width: 0px;		

		& > .split-separator {
			cursor: row-resize;
			height: 3px;
		}
	}

	.colored {
		/* background-color: $base-color; */

		& > .split-separator {
			background-color: $base-dark-color;
		}
	}
</style>
