<script lang="ts">
	import ModalWindow from './ModalWindow.svelte';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close>
	<div class="rich-editor-shortkeys">
		<div class="column">
			<div class="control-prompt"><b>Create title 1</b><span>Alt+1</span></div>
			<div class="control-prompt"><b>Create paragraph</b><span>Alt+2</span></div>
			<div class="control-prompt"><b>Create link</b><span>Alt+3</span></div>
			<div class="control-prompt"><b>Create list item</b><span>Alt+4</span></div>
			<div class="control-prompt"><b>Create united block</b><span>Alt+5</span></div>
			<div class="control-prompt"><b>Create expandable block</b><span>Alt+6</span></div>
			<div class="control-prompt"><b>Create code block</b><span>Alt+7</span></div>
			<div class="control-prompt"><b>Extend list</b><span>Alt+Shift+E</span></div>
			<div class="control-prompt"><b>Upgrade title</b><span>Alt+Equal</span></div>
			<div class="control-prompt"><b>Downgrade title</b><span>Alt+Minus</span></div>
		</div>
		<div class="column">
			<div class="control-prompt"><b>Move selected up</b><span>Alt+Up</span></div>
			<div class="control-prompt"><b>Move selected down</b><span>Alt+Down</span></div>
			<div class="control-prompt"><b>Select parent</b><span>Alt+Shift+Left</span></div>
			<div class="control-prompt"><b>Copy selected</b><span>Alt+C</span></div>
			<div class="control-prompt"><b>Replace selected</b><span>Alt+Shift+C</span></div>
			<div class="control-prompt"><b>Delete selected</b><span>Alt+Delete</span></div>
			<div class="control-prompt"><b>Restore deleted</b><span>Alt+Shift+Delete</span></div>
		</div>
		<div class="column">
			<div class="control-prompt"><b>Save</b><span>Alt+S</span></div>
			<div class="control-prompt"><b>Prompts</b><span>Alt+H</span></div>
			<div class="control-prompt"><b>Exit</b><span>Esc</span></div>
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
			@include row-justify($wide-size);
			min-width: 300px;
			max-width: 450px;
			margin: 0 10px;
			color: $base-weak-contrast-color;

			b {
				color: $strong-light-color;
			}
		}
	}
</style>
