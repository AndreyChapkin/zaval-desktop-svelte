<script lang="ts">
	
	// const
	const LEFT_WIDTH_KEY = 'leftWidth';
	const BOTTOM_HEIGHT_KEY = 'bottomHeight';

	// data
	let clazz: string = '';
	export { clazz as class };

	let areNotSelectable = false;

	let separatorMouseDownX = 0;
	export let initialLeftWidth = Number(localStorage.getItem(LEFT_WIDTH_KEY) ?? 600);
	let resultLeftWidth = initialLeftWidth;

	let separatorMouseDownY = 0;
	export let initialBottomHeight = Number(localStorage.getItem(BOTTOM_HEIGHT_KEY) ?? 600);
	let resultBottomHeight = initialBottomHeight;

	let data: number[] = [];
	for (let i = 0; i < 100; i++) {
		data.push(i);
	}

	// handlers
	const verticalSeparatorMouseDownHandler = (e: MouseEvent) => {
		areNotSelectable = true;
		separatorMouseDownX = e.clientX;
		document.addEventListener('mousemove', documentMouseMoveXHandler);
		document.addEventListener('mouseup', verticalSeparatorMouseUpHandler);
	};
	const documentMouseMoveXHandler = (e: MouseEvent) => {
		const mouseMoveX = e.clientX;
		const dX = mouseMoveX - separatorMouseDownX;
		resultLeftWidth = initialLeftWidth + dX;
	};
	const verticalSeparatorMouseUpHandler = (e: MouseEvent) => {
		areNotSelectable = false;
		initialLeftWidth = resultLeftWidth;
		localStorage.setItem(LEFT_WIDTH_KEY, String(initialLeftWidth));
		document.removeEventListener('mousemove', documentMouseMoveXHandler);
		document.removeEventListener('mouseup', verticalSeparatorMouseUpHandler);
	};

	const horizontalSeparatorMouseDownHandler = (e: MouseEvent) => {
		areNotSelectable = true;
		separatorMouseDownY = e.clientY;
		document.addEventListener('mousemove', documentMouseMoveYHandler);
		document.addEventListener('mouseup', horizontalSeparatorMouseUpHandler);
	};
	const documentMouseMoveYHandler = (e: MouseEvent) => {
		const mouseMoveY = e.clientY;
		const dY = mouseMoveY - separatorMouseDownY;
		resultBottomHeight = initialBottomHeight - dY;
	};
	const horizontalSeparatorMouseUpHandler = (e: MouseEvent) => {
		areNotSelectable = false;
		initialBottomHeight = resultBottomHeight;
		localStorage.setItem(BOTTOM_HEIGHT_KEY, String(initialBottomHeight));
		document.removeEventListener('mousemove', documentMouseMoveYHandler);
		document.removeEventListener('mouseup', horizontalSeparatorMouseUpHandler);
	};
</script>

<div
	class={`grid-pane ${clazz}`}
	style="
		grid-template-columns: {resultLeftWidth}px 4px 1fr;
		grid-template-rows: 1fr 4px {resultBottomHeight}px;
	"
>
	<div
		class="first-area"
		class:not-selectable={areNotSelectable}
	>
		<slot name="first" />
	</div>
	<div
		class="first-split-separator"
		on:mousedown={verticalSeparatorMouseDownHandler}
	/>
	<div
		class="second-area"
		class:not-selectable={areNotSelectable}
	>
		<slot name="second" />
	</div>
	<div
		class="second-split-separator"
		on:mousedown={horizontalSeparatorMouseDownHandler}
	/>
	<div
		class="bottom-area"
		class:not-selectable={areNotSelectable}
	>
		<slot name="bottom" />
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.grid-pane {
		@include full-screen-height;
		display: grid;
		justify-items: stretch;
		align-items: stretch;

		background-color: red;

		.first-area {
			grid-column: 1 / span 1;
			grid-row: 1 / span 1;
			/* overflow: auto; */
		}

		.first-area > :global(*) {
			min-height: 100%;
			min-width: 100%;
		}

		.first-split-separator {
			background-color: $base-dark-color;
			cursor: col-resize;
			grid-column: 2 / span 1;
			grid-row: 1 / span 2;
		}

		.second-area {
			grid-column: 3 / span 1;
			grid-row: 1 / span 1;
			overflow: auto;
		}

		.second-area :global(*) {
			min-height: 100%;
			min-width: 100%;
		}

		.second-split-separator {
			background-color: $base-dark-color;
			cursor: row-resize;
			grid-column: 1 / span 3;
			grid-row: 2 / span 1;
		}

		.bottom-area {
			grid-column: 1 / span 3;
			grid-row: 3 / span 1;
			overflow: auto;
		}

		.bottom-area :global(*) {
			min-height: 100%;
			min-width: 100%;
		}

		.not-selectable {
			user-select: none;
			pointer-events: none;
		}
	}
</style>
