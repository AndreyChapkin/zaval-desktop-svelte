<script lang="ts">
	import { updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type { SaveHistoryDto } from '$lib/types/todo';
	import { ARROW_URL, EDIT_ICON_URL } from '$lib/utils/assets-references';
	import { onMount } from 'svelte';
	import RichEditor from '../../components/RichEditor.svelte';
	import RichText from '../../components/RichText.svelte';
	import SplitPane from '../../components/SplitPane.svelte';
	import PrimitiveCard from '../[status=status_enum]/components/PrimitiveCard.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoHistory from './components/TodoHistory.svelte';
	import TodoMenu from './components/TodoMenu.svelte';

	// state
	export let data: TodoDetailedPageData;
	$: mainDetailedTodoDto = data.detailedTodoDto;
	$: parentTodos = (mainDetailedTodoDto.parents ?? []).slice();
	let createInRootMenuIsOpen = false;
	let shouldSeeElement: HTMLElement;
	let isDescriptionEditable: boolean = false;
	let showDoneChildrenTodos = false;

	let effectiveChildrenTodos = mainDetailedTodoDto?.children ?? [];

	$: shownItems = 'all' as ('1' | '2' | '3')[] | 'all';
	$: {
		if (shouldSeeElement && data) {
			setTimeout(() => {
				if (shouldSeeElement?.parentElement?.parentElement) {
					shouldSeeElement?.parentElement.scrollTo(0, 2000);
				}
			}, 500);
		}
	}
	$: {
		if (showDoneChildrenTodos) {
			effectiveChildrenTodos = mainDetailedTodoDto?.children ?? [];
		} else {
			effectiveChildrenTodos = (mainDetailedTodoDto?.children ?? []).filter(
				(child) => child.status !== 'DONE'
			);
		}
	}

	// handlers
	const editHandler = () => {
		isDescriptionEditable = true;
	};

	const saveContentEditionHandler = (updateEvent: CustomSvelteEvent<string>) => {
		const content = updateEvent.detail;
		updateTodo(mainDetailedTodoDto.id, {
			description: content
		}).then(() => window.location.reload());
	};

	const cancelContentEditionHandler = (cancelEvent: CustomSvelteEvent<void>) => {
		isDescriptionEditable = false;
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
			if (shouldSeeElement?.parentElement?.parentElement) {
				shouldSeeElement?.parentElement.scrollTo(0, 2000);
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
					<div class="children-todos-menu">
						<button on:click={() => (showDoneChildrenTodos = !showDoneChildrenTodos)}>
							{showDoneChildrenTodos ? 'Hide done' : 'Show done'}
						</button>
					</div>
					<div class="children-todos-body">
						{#if effectiveChildrenTodos}
							{#each effectiveChildrenTodos as child (child.id)}
								<PrimitiveCard todo={child} />
							{/each}
						{/if}
					</div>
				</div>
			</SplitPane>
			<SplitPane
				type="vertical"
				contextName="TodoWithIdPage-2"
				{shownItems}
				class="info-split"
				slot="second"
			>
				<div
					class="description"
					slot="first"
				>
					{#if isDescriptionEditable}
						<RichEditor
							richContent={mainDetailedTodoDto.description}
							on:save={saveContentEditionHandler}
							on:cancel={cancelContentEditionHandler}
						/>
					{:else}
						<div class="description-menu">
							<button on:click={editHandler}>
								<img
									src={EDIT_ICON_URL}
									alt="status"
								/>
							</button>
						</div>
						<RichText richText={mainDetailedTodoDto.description} />
					{/if}
				</div>
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

		button {
			@include standard-button;
		}

		.root-control-panel {
			padding: $wide-size;
		}

		.standard-button {
			@include standard-button;
		}

		.main-todo {
			padding: $wide-size;
		}

		.children-todos-menu {
			padding: $normal-size;
		}

		.parent-todos,
		.children-todos-body {
			padding: $wide-size;
			@include column-stretched;

			img {
				@include icon-small-sized;
				margin: $normal-size;
				transform: rotate(180deg);
			}
		}

		:global(.main-split .split-area) {
			background-color: $base-dark-color;
		}

		:global(.container-split .split-separator) {
			background-color: $second-light-color;
		}

		:global(.main-split .split-separator) {
			background-color: $second-light-color;
		}

		:global(.main-split .split-area:nth-child(3)) {
			background: $second-gradient;
		}

		:global(.children-todos-body .primitive-card) {
			margin-bottom: $wide-size;
		}

		.panel-label {
			font-size: small;
			padding: $normal-size 0;
			color: $base-weak-contrast-color;
		}

		:global(.main-split > .split-separator:nth-child(2)) {
			position: relative;
			z-index: 1;
		}

		:global(.rich-editor-menu) {
			background: $strong-gradient;
		}

		.arrow {
			color: $base-light-color;
			margin-top: $small-size;
			margin-bottom: $small-size;
			margin-left: auto;
			margin-right: auto;
			font-weight: bold;
		}

		.description-menu {
			background-color: $second-light-color;
			padding: $small-size 0 0 $small-size;
			img {
				@include icon-normal-sized;
			}
		}

		.root-todos {
			padding: $wide-size;
			@include responsive-grid(300px, $x-gap: $large-size, $y-gap: $wide-size);
		}
	}
</style>
