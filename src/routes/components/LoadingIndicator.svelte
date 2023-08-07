<script lang="ts">
	// const

	// data

	// events and issuers

	// handlers
</script>

<div class="loading-indicator-container">
	<div class="loading-indicator" />
</div>

<style lang="scss">
	/* @import '/static/style/variables-mixins.scss'; */
	@import '/static/style/common/size/';
	@import '/static/style/common/color/';
	@import '/static/style/common/composition/';

	.loading-indicator-container {
		@include column-centered;
	}

	.loading-indicator {
		background-color: $strong-second-color;
		border-radius: $wide-size;
		@include icon-small-sized;

		/* animation-name: swing;
		animation-duration: 3s;
		animation-timing-function: linear;
		animation-iteration-count: infinite; */
        animation: swing 1s linear infinite alternate;
	}

    @keyframes swing {
	from {
		transform: translateX(-10vw);
	}
	to {
		transform: translateX(10vw);
	}
}
</style>
