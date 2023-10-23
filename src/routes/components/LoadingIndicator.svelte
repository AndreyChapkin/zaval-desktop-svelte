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
        animation: swing 0.5s linear infinite alternate;
	}

    @keyframes swing {
	from {
		transform: translateX(-25px);
	}
	to {
		transform: translateX(25px);
	}
}
</style>
