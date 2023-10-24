<script lang="ts">
	import {
		createArticleLabel,
		findAllArticleLabelsWithNameFragment,
		getAllArticleLabels
	} from '$lib/api/article-calls';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import { createEventDispatcher } from 'svelte';
	import LoadingIndicator from '../../components/LoadingIndicator.svelte';
	import ArticleLabel from './ArticleLabel.svelte';
	import { CANCEL_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';

	// state
	let isLoading = false;
	let suggestedArticleLabels: ArticleLabelDto[] = [];
	let searchValue = '';
	const notTriggeringValue = () => searchValue;
	const dropSearchValue = () => (searchValue = '');
	export let chosenArticleLabels: ArticleLabelDto[] = [];
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
	$: searchValue, fetchSuggestedLabelsInhibitly(searchValue);

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
		fetchSuggestedLabels(notTriggeringValue());
	} else {
		dropSearchValue();
	}

	$: if (isLoading || suggestedArticleLabels.length < 1) {
		selectedItemIndex = null;
	}

	// events and issuers
	type EventType = {
		accept: ArticleLabelDto[];
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

	const acceptHandler = () => {
		dispatch('accept', chosenArticleLabels);
		isOpen = false;
	};

	const clearHandler = () => {
		chosenArticleLabels = [];
	};

	const cancelHandler = () => {
		dispatch('cancel');
		isOpen = false;
	};

	const createChooseOptionHandler = (dto: ArticleLabelDto) => () => {
		// Add new label to the current labels collection
		const isPresented = chosenArticleLabels.findIndex((i) => i.id === dto!!.id) > -1;
		if (!isPresented) {
			chosenArticleLabels = [...chosenArticleLabels, dto];
		}
	};

	const createRemoveOptionFromCollectionHandler = (articleLabel: ArticleLabelDto) => () => {
		chosenArticleLabels = chosenArticleLabels.filter((label) => label.id !== articleLabel.id);
	};

	// functions
	const fetchSuggestedLabels = async (value: string) => {
		isLoading = true;
		if (value) {
			suggestedArticleLabels = await findAllArticleLabelsWithNameFragment(value);
		} else {
			suggestedArticleLabels = await getAllArticleLabels();
		}
		isLoading = false;
	};

	const fetchSuggestedLabelsInhibitly = decreaseNumberOfCalls(fetchSuggestedLabels, 800);

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
				{:else if suggestedArticleLabels.length > 0}
					{#each suggestedArticleLabels as suggestedArticleLabel, i}
						<div
							class={`suggested-option ${i === selectedItemIndex ? 'selected-option' : ''}`}
							on:click={createChooseOptionHandler(suggestedArticleLabel)}
						>
							{suggestedArticleLabel.name}
						</div>
					{/each}
				{:else if searchValue}
					<button on:click={createClickHandler}>Create label</button>
				{/if}
			</div>
			<div class="interaction-panel">
				<button on:click={acceptHandler}>
					<img
						src={SAVE_ICON_URL}
						alt="status"
					/>
				</button>
				<button on:click={clearHandler}>
					<img
						src={CANCEL_ICON_URL}
						alt="status"
					/>
				</button>
			</div>
			<div class="article-label-editable-combination">
				{#each chosenArticleLabels as chosenLabel}
					<div class="removable-article-label">
						<ArticleLabel
							isReadOnlyMode
							articleLabel={chosenLabel}
						/>
						<button on:click={createRemoveOptionFromCollectionHandler(chosenLabel)}>
							<img
								src={CANCEL_ICON_URL}
								alt="status"
							/>
						</button>
					</div>
				{/each}
			</div>
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

		.article-label-editable-combination {
			@include row($normal-size);
			flex-wrap: wrap;
		}

		.removable-article-label {
			@include row($small-size);
			flex-wrap: wrap;
			flex-shrink: 0;

			button:not(:hover) {
				background-color: transparent;
			}
		}
	}
</style>
