<script lang="ts">
	// const
	const LEFT_WIDTH_KEY = "leftWidth";

	// data
	let clazz: string = '';
	export { clazz as class };

	let areNotSelectable = false;
	let separatorMouseDownX = 0;
	export let initialLeftWidth = Number(localStorage.getItem(LEFT_WIDTH_KEY) ?? 600);
	let resultLeftWidth = initialLeftWidth;

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
		localStorage.setItem(LEFT_WIDTH_KEY, String(initialLeftWidth));
		document.removeEventListener('mousemove', documentMouseMoveHandler);
		document.removeEventListener('mouseup', separatorMouseUpHandler);
	};
</script>

<div class={`split-pane ${clazz}`}>
	<div
		class="split-left"
		class:not-selectable={areNotSelectable}
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

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.split-pane {
		@apply flex-1 overflow-hidden;
		@include row;
		
		.split-separator {
			background-color: $base-dark-color;
			width: $border-wide-size;
			cursor: col-resize;
		}

		.split-right {
			@apply flex-1;
		}

		.not-selectable {
			user-select: none;
			pointer-events: none;
		}
	}
</style>
