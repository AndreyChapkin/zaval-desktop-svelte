<script lang="ts">
	import { updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type { DetailedTodoDto, SaveHistoryDto } from '$lib/types/todo';
	import { ARROW_URL } from '$lib/utils/assets-references';
	import { onMount } from 'svelte';
	import SplitPane from '../../components/SplitPane.svelte';
	import PrimitiveCard from '../[status=status_enum]/components/PrimitiveCard.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoDescription from './components/TodoDescription.svelte';
	import TodoHistory from './components/TodoHistory.svelte';
	import TodoMenu from './components/TodoMenu.svelte';

	// state
	export let data: TodoDetailedPageData;
	$: mainDetailedTodoDto = data.detailedTodoDto;
	$: parentTodos = (mainDetailedTodoDto.parents ?? []).slice();
	let createInRootMenuIsOpen = false;
	let shouldSeeElement: HTMLElement;

	$: shownItems = 'all' as ('1' | '2' | '3')[] | 'all';
	$: {
		if (shouldSeeElement && data) {
			setTimeout(() => {
				if (shouldSeeElement.parentElement?.parentElement) {
					shouldSeeElement.parentElement.scrollTo(0, 2000);
				}
			}, 500);
		}
	}

	// handlers
	const todoDescriptionUpdateHandler = (event: CustomSvelteEvent<DetailedTodoDto>) => {
		window.location.reload();
	};

	const historySaveHandler = async (saveHistoryEvent: CustomSvelteEvent<SaveHistoryDto>) => {
		const saveHistoryDto = saveHistoryEvent.detail;
		const savedTodoHistoryDto = await updateTodoHistory(saveHistoryDto.todoId, saveHistoryDto);
		data = {
			...data,
			todoHistoryRecords: savedTodoHistoryDto.records
		};
	};

	onMount(() => {
		setTimeout(() => {
			if (shouldSeeElement.parentElement?.parentElement) {
				shouldSeeElement.parentElement.scrollTo(0, 2000);
			}
		}, 500);
	});
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="todo-details">
	{#if data.isRoot}
		<div class="root-control-panel">
			<button
				on:click={() => (createInRootMenuIsOpen = true)}
				class="standard-button">Add task</button
			>
		</div>
		<div class="root-todos">
			{#if mainDetailedTodoDto.children}
				{#each mainDetailedTodoDto.children as child (child.id)}
					<TodoCard todo={child} />
				{/each}
			{/if}
		</div>
		{#if createInRootMenuIsOpen}
			<TodoMenu
				on:close={() => (createInRootMenuIsOpen = false)}
				todoDto={null}
			/>
		{/if}
	{:else}
		<SplitPane
			type="horizontal"
			contextName="TodoWithIdPage-0"
			{shownItems}
			class="container-split"
		>
			<SplitPane
				type="vertical"
				contextName="TodoWithIdPage-1"
				slot="first"
				class="main-split"
			>
				<div
					class="main-todo"
					slot="second"
				>
					<TodoCard
						todo={mainDetailedTodoDto}
						isNavigable={false}
					/>
				</div>
				<div
					class="parent-todos"
					slot="first"
					bind:this={shouldSeeElement}
				>
					{#each parentTodos as todo, i (todo.id)}
						{#if i > 0}
							<img
								src={ARROW_URL}
								alt="status"
							/>
						{/if}
						<PrimitiveCard {todo} />
					{/each}
					<img
						src={ARROW_URL}
						alt="status"
					/>
				</div>
				<div
					class="children-todos"
					slot="third"
				>
					{#if mainDetailedTodoDto.children}
						{#each mainDetailedTodoDto.children as child (child.id)}
							<PrimitiveCard todo={child} />
						{/each}
					{/if}
				</div>
			</SplitPane>
			<SplitPane
				type="vertical"
				contextName="TodoWithIdPage-2"
				{shownItems}
				class="info-split"
				slot="second"
			>
				<TodoDescription
					detailedTodoDto={mainDetailedTodoDto}
					slot="first"
					on:update={todoDescriptionUpdateHandler}
				/>
				<TodoHistory
					slot="second"
					todoId={data.detailedTodoDto.id}
					records={data.todoHistoryRecords ?? []}
					on:save={historySaveHandler}
				/>
			</SplitPane>
		</SplitPane>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.todo-details {
		flex: 1;
		height: 100vh;

		.root-control-panel {
			padding: $wide-size;
		}

		.standard-button {
			@include standard-button;
		}

		.main-todo {
			padding: $wide-size;
		}

		.parent-todos,
		.children-todos {
			padding: $wide-size;
			@include column-stretched;

			img {
				@include icon-small-sized;
				margin: $normal-size;
				transform: rotate(180deg);
			}
		}

		:global(.main-split .split-area:last-child), :global(.main-split .split-area:first-child) {
			background-color: $base-darker-color;
		}

		:global(.children-todos .primitive-card) {
			margin-bottom: $wide-size;
		}

		.panel-label {
			font-size: small;
			padding: $normal-size 0;
			color: $base-weak-contrast-color;
		}

		:global(.container-split) {
			:global(.split-separator) {
				background-color: $base-color;
			}
		}

		:global(.main-split > .split-separator:nth-child(2)) {
			position: relative;
			z-index: 1;
		}

		:global(.main-split) {
			:global(.split-separator) {
				background-color: $base-color;
			}
		}

		.arrow {
			color: $base-light-color;
			margin-top: $small-size;
			margin-bottom: $small-size;
			margin-left: auto;
			margin-right: auto;
			font-weight: bold;
		}

		.root-todos {
			padding: $wide-size;
			@include responsive-grid(300px, $x-gap: $large-size, $y-gap: $wide-size);
		}
	}
</style>
