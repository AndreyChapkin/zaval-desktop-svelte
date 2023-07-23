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

<div class={`flex-grid-pane ${clazz}`}>
	<div
		class="first-area"
		class:not-selectable={areNotSelectable}
		style="width: {resultLeftWidth}px;"
	>
		<slot name="first" />
	</div>
	<div
		class="first-split-separator"
		on:mousedown={verticalSeparatorMouseDownHandler}
	/>
	<div class="second-area">
		<div
			class="second-first-area"
			class:not-selectable={areNotSelectable}
		>
			<slot name="second" />
		</div>
		<div
			class="second-split-separator"
			on:mousedown={horizontalSeparatorMouseDownHandler}
		/>
		<div
			class="second-second-area"
			class:not-selectable={areNotSelectable}
			style="height: {resultBottomHeight}px;"
		>
			<slot name="bottom" />
		</div>
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.flex-grid-pane {
		@include full-screen-height;
		display: flex;
		flex-direction: row;

		background-color: red;

		.first-area {
		}

		.first-area > :global(*) {
			min-height: 100%;
			min-width: 100%;
		}

		.first-split-separator {
			background-color: $base-dark-color;
			cursor: col-resize;
			width: 6px;
		}

		.second-area {
			display: flex;
			flex-direction: column;
			flex: 1;

			.second-first-area {
				flex: 1;
				overflow: auto;
			}

			.second-split-separator {
				background-color: $base-dark-color;
				cursor: row-resize;
				height: 6px;
			}

			.second-second-area {
				overflow: auto;
				height: 200px;
			}
		}

		/* .second-area :global(*) {
			min-height: 100%;
			min-width: 100%;
		} */

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
