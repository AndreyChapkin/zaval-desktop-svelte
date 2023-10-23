<script lang="ts">
	import {
		createArticleLabel,
		findAllArticleLabelsWithNameFragment,
		getAllArticleLabels
	} from '$lib/api/article-calls';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import { createEventDispatcher } from 'svelte';
	import LoadingIndicator from '../../components/LoadingIndicator.svelte';

	// state
	let isLoading = false;
	let suggestedArticleLabels: ArticleLabelDto[] = [];
	let searchValue = '';
	export let chosenArticleLabel: ArticleLabelDto | null = null;
	let selectedItemIndex: number | null = null;
	let optionsGeometry: {
		x: number;
		y: number;
		width: number;
	} | null = null;
	let searchInputElement: HTMLElement;
	let isOpen = false;

	// reactivity
	$: if (searchValue) {
		fetchSuggestedLabels(searchValue);
	} else {
		suggestedArticleLabels = [];
	}

	$: if (isOpen) {
		// Set options geometry based on the input element
		const rect = searchInputElement.getBoundingClientRect();
		optionsGeometry = {
			x: rect.left + window.scrollX,
			y: rect.bottom + window.scrollY,
			width: rect.width
		};
		isLoading = true;
		searchValue = '';
		getAllArticleLabels().then(articleLabels => {
			suggestedArticleLabels = articleLabels;
			isLoading = false;
		});
	}

	$: if (isLoading || suggestedArticleLabels.length < 1) {
		selectedItemIndex = null;
	}

	$: if (chosenArticleLabel) {
		isOpen = false;
		dispatch('choose', chosenArticleLabel);
	}

	// events and issuers
	type EventType = {
		choose: ArticleLabelDto;
		cancel: void;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const createClickHandler = async () => {
		if (searchValue) {
			isLoading = true;
			await createArticleLabel({
				id: -1000, // no matter
				name: searchValue
			});
			fetchSuggestedLabels(searchValue);
		}
	};

	const inputKeyupHandler = (e: KeyboardEvent) => {
		if (e.code === 'Escape') {
			cancel();
		} else if (e.code === 'Enter') {
			if (selectedItemIndex !== null) {
				chosenArticleLabel = suggestedArticleLabels[selectedItemIndex];
				searchValue = '';
			}
		}
	};

	const inputKeydownHandler = (e: KeyboardEvent) => {
		if (e.code === 'ArrowUp') {
			moveSelectedIndex('decrease');
			e.preventDefault();
		} else if (e.code === 'ArrowDown') {
			moveSelectedIndex('increase');
			e.preventDefault();
		}
	};

	const focusHandler = () => {
		isOpen = true;
		if (suggestedArticleLabels.length > 0) {
			if (!searchValue) {
				suggestedArticleLabels = [];
			}
		}
	};

	const backgroundClickHandler = () => {
		cancel();
		dispatch('cancel');
	};

	const showAllLabelsHandler = async () => {
		isLoading = true;
		searchValue = '';
		suggestedArticleLabels = await getAllArticleLabels();
		isLoading = false;
	};

	const cancel = () => {
		isOpen = false;
	};

	// functions
	const fetchSuggestedLabels = decreaseNumberOfCalls(async (value: string) => {
		isLoading = true;
		let labelNameFragment = value;
		suggestedArticleLabels = await findAllArticleLabelsWithNameFragment(labelNameFragment);
		isLoading = false;
	}, 800);

	function moveSelectedIndex(action: 'increase' | 'decrease') {
		if (suggestedArticleLabels.length > 0) {
			if (selectedItemIndex !== null) {
				const delta = action === 'increase' ? 1 : -1;
				const result = selectedItemIndex + delta;
				if (0 <= result && result < suggestedArticleLabels.length) {
					selectedItemIndex = result;
				}
			} else {
				selectedItemIndex = 0;
			}
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="article-label-search">
	<input
		class={`search-name-fragment ${isOpen ? 'above-background' : ''}`}
		type="text"
		bind:value={searchValue}
		bind:this={searchInputElement}
		on:keyup={inputKeyupHandler}
		on:keydown={inputKeydownHandler}
		on:focus={focusHandler}
	/>
	{#if isOpen}
		<div
			class="suggested-options-background"
			on:click={backgroundClickHandler}
		/>
		<div
			class="suggested-options above-background"
			style={`left: ${optionsGeometry?.x}px; top: ${optionsGeometry?.y}px; width: ${optionsGeometry?.width}px`}
		>
			{#if isLoading}
				<LoadingIndicator />
			{:else if suggestedArticleLabels.length > 0}
				{#each suggestedArticleLabels as suggestedArticleLabel, i}
					<div
						class={`suggested-option ${i === selectedItemIndex ? 'selected-option' : ''}`}
						on:click={() => {
							chosenArticleLabel = suggestedArticleLabel;
							searchValue = '';
						}}
					>
						{suggestedArticleLabel.name}
					</div>
				{/each}
			{:else}
				{#if searchValue}
					<button on:click={createClickHandler}>Create label</button>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-label-search {
		@include column($normal-size);

		input {
			color: black;
		}

		button {
			@include standard-button;
		}

		.search-name-fragment {
			@include standard-input;
		}

		.suggested-options-background {
			@include full-screen;
			background: $background-weak-gradient;
			z-index: 1;
		}

		.suggested-options {
			@include standard-container;
			@include bordered(all, $second-light-color, 1px);
			@include styled-scrollbar;
			overflow-y: auto;
			max-height: 30vh;
			
			position: absolute;
			background-color: $second-color;
			color: $base-contrast-color;
		}

		.above-background {
			z-index: 2;
		}

		@mixin selected-option {
			@include standard-button;
			background-color: $second-light-color;
			padding: $normal-size;
		}

		.suggested-option {
			&:hover {
				@include selected-option();
			}

			padding: $normal-size;
		}

		.selected-option {
			@include selected-option();
		}
	}
</style>
