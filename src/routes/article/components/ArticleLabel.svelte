<script lang="ts">
	import { EDIT_ICON_URL, REMOVE_ICON_URL, SAVE_ICON_URL } from '$lib/utils/assets-references';
	import { createEventDispatcher } from 'svelte';
	import ModalWindow from '../../components/ModalWindow.svelte';
	import { deleteArticleLabel, updateArticleLabel } from '$lib/api/article-calls';

	// state
	export let articleLabel: ArticleLabelDto;
	export let isReadOnlyMode = false;
	let isMenuOpen = false;
	let editValue = articleLabel.name;

	// reactivity

	// events and issuers
	type EventType = {
		edit: ArticleLabelDto;
		remove: ArticleLabelDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const editHandler = () => {
		isMenuOpen = true;
	};

	const saveHandler = async () => {
		await updateArticleLabel(articleLabel.id, {
			name: editValue
		});
		isMenuOpen = false;
		dispatch('edit', {
			id: articleLabel.id,
			name: editValue
		});
	};

	const removeHandler = async () => {
		await deleteArticleLabel(articleLabel.id);
		isMenuOpen = false;
		dispatch('remove', articleLabel);
	};

	const closeMenuHandler = () => {
		isMenuOpen = false;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="article-label">
	<div class="label-name">{articleLabel.name}</div>
	{#if !isReadOnlyMode}
		<button on:click={editHandler}>
			<img
				src={EDIT_ICON_URL}
				alt="status"
			/>
		</button>
	{/if}
	{#if isMenuOpen}
		<ModalWindow on:close={closeMenuHandler}>
			<div class="article-label-menu">
				<input
					type="text"
					bind:value={editValue}
				/>
				<button on:click={saveHandler}>
					<img
						src={SAVE_ICON_URL}
						alt="status"
					/>
				</button>
				<button on:click={removeHandler}>
					<img
						src={REMOVE_ICON_URL}
						alt="status"
					/>
				</button>
			</div>
		</ModalWindow>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.article-label {
		@include row($normal-size);
		@include standard-container;
		background-color: $strong-second-darker-color;
		color: $base-contrast-color;
		

		.label-name {
			min-width: 150px;
		}

		img {
			@include icon-normal-sized;
		}
	}

	.article-label-menu {
		@include row($normal-size);
		@include standard-container;
		background-color: $second-color;

		input {
			@include standard-input;
		}

		button {
			@include standard-button;
		}

		img {
			@include icon-large-sized;
		}
	}
</style>
