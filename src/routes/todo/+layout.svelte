<script>
	import SideMenu from './[[id=digital]]/components/SideMenu.svelte';
</script>

<div class="todos-page">
	<SideMenu />
	<div class="todos-content">
		<slot />
	</div>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.todos-page {
		background-color: $base-color;
		@include row;
        @include full-screen-height;

		.todos-content {
            @apply flex-1;
        }
	}
</style>
