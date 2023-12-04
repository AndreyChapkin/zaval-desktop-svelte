<script lang="ts">
	import {
		createArticleLabel,
		deleteArticleLabel,
		findAllArticleLabelsWithNameFragment,
		getAllArticleLabels
	} from '$lib/api/article-calls';
	import { CANCEL_ICON_URL, REMOVE_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import { createEventDispatcher, onMount } from 'svelte';
	import LoadingIndicator from '../../components/LoadingIndicator.svelte';
	import ModalWindow from '../../components/ModalWindow.svelte';
	import ArticleLabel from './ArticleLabel.svelte';
	import RemoveAcceptance from '../../components/RemoveAcceptance.svelte';

	// state
	let isLoading = true;
	let suggestedArticleLabels: ArticleLabelDto[] = [];
	let searchValue = '';
	let inputElement: HTMLInputElement;
	let suggestedOptionsElement: HTMLInputElement;
	export let chosenArticleLabels: ArticleLabelDto[] = [];
	let selectedItemIndex: number | null = null;
	$: suggestCreation = suggestedArticleLabels.length < 1 && searchValue;
	let labelToRemove: ArticleLabelDto | null = null;
	$: isRemovingLabel = !!labelToRemove;

	// reactivity
	$: searchValue, fetchSuggestedLabelsInhibitly(searchValue);

	$: if (isLoading || suggestedArticleLabels.length < 1) {
		selectedItemIndex = null;
	}

	$: {
		// scroll selected item into view
		if (selectedItemIndex !== null) {
			let selectedOptionElement = suggestedOptionsElement.children[
				selectedItemIndex
			] as HTMLElement;
			selectedOptionElement.scrollIntoView();
		}
	}

	// lifecycle
	onMount(() => {
		inputElement.focus();
		// add listener to accept result on Alt + S combination
		const globalAcceptListener = (event: KeyboardEvent) => {
			if (event.altKey) {
				if (event.code === 'KeyS') {
					acceptHandler();
				}
			}
		};
		window.addEventListener('keyup', globalAcceptListener);
		return () => {
			window.removeEventListener('keyup', globalAcceptListener);
		};
	});

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
			const createdOption = await createArticleLabel({
				id: -1000, // no matter
				name: searchValue
			});
			chooseOption(createdOption);
			searchValue = '';
		}
	};

	const inputKeyupHandler = (e: KeyboardEvent) => {
		if (e.code === 'Escape') {
			cancelHandler();
		} else if (e.code === 'Enter') {
			if (selectedItemIndex !== null) {
				const selectedLabelDto = suggestedArticleLabels[selectedItemIndex];
				chooseOption(selectedLabelDto);
			} else if (suggestCreation) {
				createClickHandler();
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

	const acceptHandler = () => {
		dispatch('accept', chosenArticleLabels);
	};

	const clearHandler = () => {
		chosenArticleLabels = [];
	};

	const cancelHandler = () => {
		dispatch('cancel');
	};

	const createChooseOptionHandler = (dto: ArticleLabelDto) => (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			chooseOption(dto);
		}		
	}

	const createSubmitLabelToDeletionHandler = (dto: ArticleLabelDto) => () => {
		labelToRemove = dto;
	};

	const createRemoveOptionFromCollectionHandler = (articleLabel: ArticleLabelDto) => () => {
		chosenArticleLabels = chosenArticleLabels.filter((label) => label.id !== articleLabel.id);
	};

	// functions
	const chooseOption = (dto: ArticleLabelDto) => {
		// Add new label to the current labels collection
		const isPresented = chosenArticleLabels.findIndex((i) => i.id === dto!!.id) > -1;
		if (!isPresented) {
			chosenArticleLabels = [...chosenArticleLabels, dto];
		}
	};

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

	const removeLabel = async () => {
		isLoading = true;
		const removingLabel = labelToRemove!!;
		labelToRemove = null;
		await deleteArticleLabel(removingLabel?.id);
		fetchSuggestedLabels(searchValue);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close={cancelHandler}>
	<div class="article-label-search">
		<div class="search-panel">
			<input
				class="search-name-fragment"
				type="text"
				bind:this={inputElement}
				bind:value={searchValue}
				on:keyup={inputKeyupHandler}
				on:keydown={inputKeydownHandler}
			/>
			<div class="suggested-options">
				{#if isLoading}
					<LoadingIndicator />
				{:else if suggestedArticleLabels.length > 0}
					{#each suggestedArticleLabels as suggestedArticleLabel, i}
						<div
							class={`suggested-option ${i === selectedItemIndex ? 'selected-option' : ''}`}
							on:click={createChooseOptionHandler(suggestedArticleLabel)}
						>
							<div class="suggested-option-name">
								{suggestedArticleLabel.name}
							</div>
							<button
								class="suggested-option-remove"
								on:click={createSubmitLabelToDeletionHandler(suggestedArticleLabel)}
							>
								<img
									src={REMOVE_ICON_URL}
									alt="status"
								/>
							</button>
						</div>
					{/each}
				{:else if searchValue}
					<button on:click={createClickHandler}>Create label</button>
				{/if}
			</div>
		</div>
		<div class="result-panel">
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
	</div>
	{#if isRemovingLabel}
		<RemoveAcceptance
			on:accept={removeLabel}
			on:cancel={() => (labelToRemove = null)}
		/>
	{/if}
</ModalWindow>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-label-search {
		@include row($wide-size);
		@include screen-sized(80, 80);
		padding: $large-size;
		background-color: $base-dark-color;
		@include bordered(all, $base-color, 1px);

		input {
			@include standard-input;
		}

		button {
			@include standard-button;
		}

		img {
			@include icon-normal-sized;
		}

		.search-panel,
		.result-panel {
			flex: 1;
			@include column-stretch;
		}

		.result-panel {
			.interaction-panel {
				margin-bottom: $normal-size;
			}
		}

		.suggested-options {
			@include standard-container;
			@include bordered(all, $second-light-color, 1px);
			@include scrollable-in-column;
			overflow-y: auto;

			background-color: $second-color;
			color: $base-contrast-color;
		}

		@mixin selected-option {
			background-color: $second-lighter-color;
		}

		.suggested-option {
			@include row-justify-and-align-center($normal-size);
			padding: $normal-size;
			cursor: pointer;

			&:hover {
				background-color: $second-light-color;
			}
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
