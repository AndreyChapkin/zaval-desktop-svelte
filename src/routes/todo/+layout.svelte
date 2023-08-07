<script>
	import SideMenu from './components/SideMenu.svelte';
</script>

<div class="todos-page">
	<SideMenu />
	<div class="todos-content">
		<slot />
	</div>
</div>

<style lang="scss">
	/* @import '/static/style/variables-mixins.scss'; */
	@import '/static/style/common/color/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/size/';

	.todos-page {
		background-color: $base-dark-color;
		@include row;
        @include full-screen-height;

		.todos-content {
            @apply flex-1;
        }
	}
</style>
