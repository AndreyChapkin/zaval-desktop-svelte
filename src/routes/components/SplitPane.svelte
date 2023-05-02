<script lang="ts">
	// data
    let clazz: string = "";
    export { clazz as class };

	let areNotSelectable = false;
	let separatorMouseDownX = 0;
	let initialLeftWidth = 200;
	let resultLeftWidth = 200;

	// handlers
	const separatorMouseDownHandler = (e: MouseEvent) => {
		areNotSelectable = true;
		separatorMouseDownX = e.clientX;
		document.addEventListener('mousemove', documentMouseMoveHandler);
		document.addEventListener('mouseup', separatorMouseUpHandler);
	};
	const documentMouseMoveHandler = (e: MouseEvent) => {
		const mouseMoveX = e.clientX;
		const dX = mouseMoveX - separatorMouseDownX;
		resultLeftWidth = initialLeftWidth + dX;
	};
	const separatorMouseUpHandler = (e: MouseEvent) => {
		areNotSelectable = false;
		initialLeftWidth = resultLeftWidth;
		document.removeEventListener('mousemove', documentMouseMoveHandler);
		document.removeEventListener('mouseup', separatorMouseUpHandler);
	};
</script>

<div class={`split-pane ${clazz}`}>
	<div
		class="split-left {areNotSelectable ? 'not-selectable' : ''}"
		style="width: {resultLeftWidth}px"
	>
		<slot name="left" />
	</div>
	<div
		class="split-separator"
		on:mousedown={separatorMouseDownHandler}
	/>
	<div class="split-right {areNotSelectable ? 'not-selectable' : ''}">
		<slot name="right" />
	</div>
</div>

<style lang="postcss">
    .split-pane {
        @apply flex justify-start;
    }
	.split-left {
        @apply border-green-800 border-2;
	}
	.split-separator {
		width: 5px;
		cursor: col-resize;
		@apply border-pink-100 border-2;
	}
    .split-separator:hover {
		width: 15px;
	}
	.split-right {
		@apply flex-1 border-red-800 border-2;
	}
	.not-selectable {
		user-select: none;
		pointer-events: none;
	}
</style>
