<script lang="ts">
	import ModalWindow from './ModalWindow.svelte';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close>
	<div class="rich-editor-shortkeys">
		<div class="column">
			<div class="control-prompt"><b>Add title 1</b><span>Alt+1</span></div>
			<div class="control-prompt"><b>Add paragraph</b><span>Alt+2</span></div>
			<div class="control-prompt"><b>Add link</b><span>Alt+3</span></div>
			<div class="control-prompt"><b>Add list item</b><span>Alt+4</span></div>
			<div class="control-prompt"><b>Extend list</b><span>Alt+5</span></div>
			<div class="control-prompt"><b>Create united block</b><span>Alt+6</span></div>
		</div>
		<div class="column">
			<div class="control-prompt"><b>Upgrade title</b><span>Alt+Shift+Left</span></div>
			<div class="control-prompt"><b>Downgrade title</b><span>Alt+Shift+Right</span></div>
			<div class="control-prompt"><b>Move element up</b><span>Alt+Up</span></div>
			<div class="control-prompt"><b>Move element down</b><span>Alt+Down</span></div>
		</div>
	</div>
</ModalWindow>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.rich-editor-shortkeys {
		@include row($large-size);
		@include standard-container;
		flex-wrap: wrap;
		border-radius: 0 0 $normal-size $normal-size;
		padding: $wide-size;
		background-color: $second-color;

		.column {
			@include column($small-size);
		}

		.control-prompt {
			@include row-justifyied($wide-size);
			min-width: 300px;
			max-width: 450px;
			margin: 0 10px;
			color: $base-weak-contrast-color;

			b {
				color: $base-contrast-color;
			}
		}
	}
</style>
