<script lang="ts">
	// const

	// data
	export let contentLine: string;
	export let lineNumber = 1;
	let lineContainer: HTMLElement;	
	let tokens: string[] = splitToTokens(contentLine);

	// reactivity

	// function
	function splitToTokens(line: string): string[] {
		let resultTokens: string[] = [];
		let curTokenCharacters: string[] = [];
		for (let c of line) {
			if (c === ' ') {
				if (curTokenCharacters.length > 0) {
					resultTokens.push(curTokenCharacters.join(''));
					curTokenCharacters.length = 0;
				}
				resultTokens.push(c);
			} else {
				curTokenCharacters.push(c);
			}
		}
		if (curTokenCharacters.length > 0) {
			resultTokens.push(curTokenCharacters.join(''));
			curTokenCharacters.length = 0;
		}
		return resultTokens;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="rich-editor-line"
	data-line-number={lineNumber}
	bind:this={lineContainer}
>
	{#if tokens.length > 0}
		{#each tokens as token}
			{#if token === 'h1'}
				<span class="h1-token">{token}</span>
			{:else}
				{token}
			{/if}
		{/each}
	{:else}
		{'_'}
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	@font-face {
		font-family: Nunito;
		font-weight: normal;
		src: url('$lib/assets/fonts/Nunito-Regular.ttf');
	}

	@font-face {
		font-family: Nunito;
		font-weight: bold;
		src: url('$lib/assets/fonts/Nunito-Black.ttf');
	}

	.rich-editor-line {
		.h1-token {
			color: pink;
		}
	}
</style>
