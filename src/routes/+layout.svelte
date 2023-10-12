<script>
	import '../app.scss';
	import SideMenu from './todo/components/SideMenu.svelte';
</script>

<div class="general-page">
	<SideMenu />
	<slot />
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/size/';

	.general-page {
		background-color: $base-dark-color;
		@include row;
		@include full-screen-width;
		@include full-screen-height;
	}

	@font-face {
		font-family: Montserrat;
		font-weight: normal;
		src: url('$lib/assets/fonts/Montserrat-Regular.ttf');
	}

	:global(*) {
		font-family: Montserrat;
	}
</style>
