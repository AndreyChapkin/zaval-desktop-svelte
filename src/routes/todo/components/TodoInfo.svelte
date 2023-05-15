<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { createEventDispatcher } from 'svelte';
	import _ from 'lodash';
	import type { SaveInfoEventType } from './types';

	const AUTOSAVE_TIMEOUT = 3000; // 3s
	// TODO: save error handling
	type SaveRegulator = {
		isScheduledToSave: boolean;
		readyToSave: boolean;
		isDeferredScheduledToSave: boolean;
	};

	// data
	let clazz: string | null = null;
	export { clazz as class };
	export let todo: Todo;
	let editedInfo: string = todo.info;
	let editMode = false;
	let saveRegulator: SaveRegulator = {
		isScheduledToSave: false,
		readyToSave: true,
		isDeferredScheduledToSave: false
	};

	$: isSaved =
		!(saveRegulator.isScheduledToSave || saveRegulator.isDeferredScheduledToSave) &&
		saveRegulator.readyToSave;

	// events
	const dispatch = createEventDispatcher<SaveInfoEventType>();

	// handlers

	// plan to save in TIMEOUT if there is any change.
	// if we detect new change and there is planned saving already -> don't need to plan saving again
	const textChangeListener = () => {
		if (!saveRegulator.isScheduledToSave) {
			scheduleSaving();
		}
	};
	const scheduleSaving = () => {
		saveRegulator.isScheduledToSave = true;
		setTimeout(() => {
			if (saveRegulator.readyToSave) {
				saveEventIssuer();
				saveRegulator.isScheduledToSave = false;
			} else {
				saveRegulator.isDeferredScheduledToSave = true;
			}
		}, AUTOSAVE_TIMEOUT);
	};
	const switchModeHandler = () => {
		editMode = !editMode;
	};
	const saveEventIssuer = () => {
		dispatch('save', {
			saveCallbackStarter: (saveCallback) => {
				saveRegulator.readyToSave = false;
				return saveCallback({ id: todo.id, info: editedInfo }).then((todo) => {
					saveRegulator.readyToSave = true;
					if (saveRegulator.isDeferredScheduledToSave) {
						saveEventIssuer();
						saveRegulator.isDeferredScheduledToSave = false;
						saveRegulator.isScheduledToSave = false;
					}
					return todo;
				});
			}
		});
	};
</script>

<div
	on:dblclick={switchModeHandler}
	class={'todo-info flex flex-col' + ` ${clazz}`}
>
	<div class="secondary-info-zone">
		<div class={`indicator ${isSaved ? "indicator-invisible" : ""}`} />
		<div class="todo-name">
			{todo.name}
		</div>
	</div>
	<textarea
		class="todo-info-text"
		on:input={textChangeListener}
		bind:value={editedInfo}
	/>
</div>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	$secondary-info-zone-height: 20px;

	.todo-info {
		background-color: $base-color;
		padding-bottom: $secondary-info-zone-height;
		@apply w-full h-full flex;

		.secondary-info-zone {
			padding: 5px;
			height: $secondary-info-zone-height;
			@include row;
			@apply space-x-2;

			.indicator {
				height: 10px;
				width: 10px;
				background-color: $attention-color;
				@apply rounded-md;
			}

			.indicator-invisible {
				@apply bg-transparent;
			}

			.todo-name {
				color: $base-light-color;
				@apply text-sm;
			}
		}

		.todo-info-text {
			border-color: $base-dark-color;
			border-bottom-width: $border-narrow-size;
			border-top-width: $border-narrow-size;
			@apply p-2 resize-none outline-none flex-1;
		}
	}
</style>
