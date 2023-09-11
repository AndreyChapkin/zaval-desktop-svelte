<script>
	import SideMenu from './components/SideMenu.svelte';
</script>

<div class="todos-page">
	<SideMenu />
	<slot />
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/size/';

	.todos-page {
		background-color: $base-dark-color;
		@include row;
        @include full-screen-width;
		@include full-screen-height;
	}
</style>
