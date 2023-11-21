<script lang="ts">
	import {
		createArticleLabel,
		findAllArticleLabelsWithNameFragment,
		findAllArticlesWithTitleFragment,
		getAllArticleLabels,
		getTheMostRecentArticleLights
	} from '$lib/api/article-calls';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import { createEventDispatcher } from 'svelte';
	import { CANCEL_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import LoadingIndicator from '../../../../components/LoadingIndicator.svelte';

	// state
	let isLoading = false;
	let suggestedArticleLights: ArticleLightDto[] = [];
	let searchValue = '';
	const notTriggeringValue = () => searchValue;
	const dropSearchValue = () => (searchValue = '');
	let selectedItemIndex: number | null = null;
	let optionsGeometry: {
		x: number;
		y: number;
		width: number;
	} | null = null;
	let searchInputElement: HTMLElement;
	export let isOpen = false;
	export let autofocus = false;

	// reactivity
	$: searchValue, fetchSuggestedArticlesInhibitly(searchValue);

	$: if (isOpen) {
		// Set options geometry based on the input element
		if (searchInputElement) {
			const rect = searchInputElement.getBoundingClientRect();
			optionsGeometry = {
				x: rect.left + window.scrollX,
				y: rect.bottom + window.scrollY,
				width: rect.width
			};
		}
		fetchSuggestedArticleLights(notTriggeringValue());
	} else {
		dropSearchValue();
	}

	$: if (isLoading || suggestedArticleLights.length < 1) {
		selectedItemIndex = null;
	}

	// events and issuers
	type EventType = {
		accept: ArticleLightDto;
		cancel: void;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const inputKeyupHandler = (e: KeyboardEvent) => {
		if (e.code === 'Escape') {
			cancelHandler();
		} else if (e.code === 'Enter') {
			// TODO
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
	};

	const cancelHandler = () => {
		dispatch('cancel');
		isOpen = false;
	};

	const createChooseOptionHandler = (dto: ArticleLightDto) => () => {
		dispatch('accept', dto);
		isOpen = false;
	};

	// functions
	const fetchSuggestedArticleLights = async (value: string) => {
		isLoading = true;
		if (value) {
			suggestedArticleLights = await findAllArticlesWithTitleFragment(value);
		} else {
			suggestedArticleLights = await getTheMostRecentArticleLights();
		}
		isLoading = false;
	};

	const fetchSuggestedArticlesInhibitly = decreaseNumberOfCalls(fetchSuggestedArticleLights, 800);

	function moveSelectedIndex(action: 'increase' | 'decrease') {
		if (suggestedArticleLights.length > 0) {
			if (selectedItemIndex !== null) {
				const delta = action === 'increase' ? 1 : -1;
				const result = selectedItemIndex + delta;
				if (0 <= result && result < suggestedArticleLights.length) {
					selectedItemIndex = result;
				}
			} else {
				selectedItemIndex = 0;
			}
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="article-search">
	<input
		class={`search-name-fragment ${isOpen ? 'above-background' : ''}`}
		type="text"
		{autofocus}
		bind:value={searchValue}
		bind:this={searchInputElement}
		on:keyup={inputKeyupHandler}
		on:keydown={inputKeydownHandler}
		on:focus={focusHandler}
	/>
	{#if isOpen}
		<div
			class="suggested-options-background"
			on:click={cancelHandler}
		/>
		<div
			class="choice-pane above-background"
			style={`left: ${optionsGeometry?.x}px; top: ${optionsGeometry?.y}px; width: ${optionsGeometry?.width}px`}
		>
			<div class="suggested-options">
				{#if isLoading}
					<LoadingIndicator />
				{:else if suggestedArticleLights.length > 0}
					{#each suggestedArticleLights as suggestedArticle, i}
						<div
							class={`suggested-option ${i === selectedItemIndex ? 'selected-option' : ''}`}
							on:click={createChooseOptionHandler(suggestedArticle)}
						>
							{suggestedArticle.title}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-search {
		@include column($normal-size);

		input {
			color: black;
		}

		button {
			@include standard-button;
		}

		img {
			@include icon-normal-sized;
		}

		.search-name-fragment {
			@include standard-input;
		}

		.suggested-options-background {
			@include full-screen;
			background: $background-weak-gradient;
			z-index: 1;
		}

		.choice-pane {
			position: absolute;
			@include column($small-size);
		}

		.suggested-options {
			@include standard-container;
			@include bordered(all, $second-light-color, 1px);
			@include styled-scrollbar;
			width: 100%;
			overflow-y: auto;
			height: 30vh;

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
