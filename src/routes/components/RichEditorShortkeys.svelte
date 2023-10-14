<script lang="ts">
	
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="rich-editor-shortkeys">
	<div class="control-prompt"><b>Add title 1</b><span>Alt+1</span></div>
	<div class="control-prompt"><b>Add paragraph</b><span>Alt+2</span></div>
	<div class="control-prompt"><b>Add link</b><span>Alt+3</span></div>
	<div class="control-prompt"><b>Move root element up</b><span>Alt+Up</span></div>
	<div class="control-prompt"><b>Move root element down</b><span>Alt+Down</span></div>
	<div class="control-prompt"><b>Upgrade title</b><span>Alt+Shift+Left</span></div>
	<div class="control-prompt"><b>Downgrade title</b><span>Alt+Shift+Right</span></div>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.rich-editor-shortkeys {
		@include column-wrapping;
		@include standard-container;
		padding: $wide-size;
		background-color: $second-color;

		.control-prompt {
			@include row($wide-size);

			b {
				width: 250px;
				flex: 1;
			}
		}
	}
</style>
