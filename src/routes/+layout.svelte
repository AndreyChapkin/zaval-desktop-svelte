<script>
	import '../app.scss';
</script>

<slot />

<style lang="scss">
	@font-face {
		font-family: Montserrat;
		font-weight: normal;
		src: url('$lib/assets/fonts/Montserrat-Regular.ttf');
	}

	:global(*) {
		font-family: Montserrat;
	}
</style>
