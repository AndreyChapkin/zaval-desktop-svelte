<script lang="ts">
	import FlexGrid from './FlexGrid.svelte';
	import FlexSplit from './FlexSplit.svelte';
	import FlexSplitV2 from './FlexSplitV2.svelte';
	import Grid from './Grid.svelte';

	// const

	// data
	let clazz: string = '';
	export { clazz as class };

	let data: number[] = [];
	for (let i = 0; i < 100; i++) {
		data.push(i);
	}

	// handlers
</script>

<!-- GOOD ONE -->
<!-- <div class="flex-col">
	<div class="medium">
		<div class="flex-row">
			<div class="first">
				{#each data as i}
					<div>First {i}</div>
				{/each}
			</div>
			<div class="second" />
		</div>
	</div>
	<div class="flex-row">
		<div class="first" />
		<div class="second" />
	</div>
</div> -->
<!-- END OF GOOD ONE -->

<FlexSplitV2
	type="vertical"
	contextName="gridPage"
>
	<FlexSplitV2
		type="horizontal"
		contextName="gridPageFirstRow"
		slot="first"
	>
		<div
			class="second-first"
			slot="first"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
		<div
			class="second-second"
			slot="second"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
	</FlexSplitV2>
	<!-- BEST ONE -->
	<!-- <div class="flex-row" slot="second">
		<div
			class="second-first"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
		<div class="dumb-separator"></div>
		<div
			class="second-second"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
	</div> -->
	<FlexSplitV2
		type="horizontal"
		contextName="gridPageSecondRow"
		slot="second"
	>
		<div
			class="second-first"
			slot="first"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
		<div
			class="second-second"
			slot="second"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
	</FlexSplitV2>
	<FlexSplitV2
		type="horizontal"
		contextName="gridPageThirdRow"
		slot="third"
	>
		<div
			class="second-first"
			slot="first"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
		<div
			class="second-second"
			slot="second"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
		<div
			class="second-third"
			slot="third"
		>
			{#each data as i}
				<div>Second {i}</div>
			{/each}
		</div>
	</FlexSplitV2>
</FlexSplitV2>

<!-- <FlexGrid>
	<div
		class="first"
		slot="first"
	>
		<div class="short-header">Header</div>
		<div class="long-content">
			{#each data as i}
				<div>First {i}</div>
			{/each}
		</div>
	</div>
	<div
		class="second"
		slot="second"
	>
		{#each data as i}
			<div>Second {i}</div>
		{/each}
	</div>
	<div
		class="bottom"
		slot="bottom"
	>
		{#each data as i}
			<div>Bottom {i}</div>
		{/each}
	</div>
</FlexGrid> -->

<style lang="scss">
	@import '/static/style/variables-mixins.scss';
	/* BEST ONE */
	.flex-row {
		display: flex;
		flex: 1;
		height: 100%;

		& > div {
			background-color: orange;
			/* height: 100%; */
			overflow: auto;
			/* flex: 1; */
		}

		.dumb-separator {
			width: 3px;
			background-color: red;
		}
	}

	/* GOOD ONE */

	/* .flex-col {
		display: flex;
		flex-direction: column;
		height: 95vh;
		align-items: stretch;
		width: 95vw;
	}

	.medium {
		height: 200px;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		margin-bottom: 10px;
		height: 100%;
		border-width: 2px;
		border-color: cyan;
	}

	.first {
		background-color: pink;
		width: 100px;
		flex: 1;
		overflow: auto;
		height: 100%;
	}

	.second {
		background-color: orange;
		width: 100px;
	} */

	/* END OF GOOD ONE */

	/* .first {
		background-color: pink;
		height: 50px;
		overflow: auto;

		.short-header {
			background-color: darkgoldenrod;
		}
	}

	.second {
		background-color: darkkhaki;
	}

	.third {
		background-color: cyan;
	}

	.second-first {
		background-color: darkgreen;
	}

	.second-second {
		background-color: darkgoldenrod;
	}

	.bottom {
		background-color: darkorchid;
	} */
</style>
