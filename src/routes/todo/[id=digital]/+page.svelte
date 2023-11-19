<script lang="ts">
	import { updateTodo, updateTodoHistory } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { TodoDetailedPageData } from '$lib/types/pages-data';
	import type { SaveHistoryDto } from '$lib/types/todo';
	import { EDIT_ICON_URL, PARENT_ICON_URL } from '$lib/utils/assets-references';
	import RichEditor from '../../components/RichEditor.svelte';
	import RichText from '../../components/RichText.svelte';
	import SplitPane from '../../components/SplitPane.svelte';
	import PrimitiveCard from '../[status=status_enum]/components/PrimitiveCard.svelte';
	import TodoCard from '../components/TodoCard.svelte';
	import TodoHistory from './components/TodoHistory.svelte';

	// state
	export let data: TodoDetailedPageData;
	$: mainDetailedTodoDto = data.detailedTodoDto;
	$: parentTodos = mainDetailedTodoDto.parents ?? [];
	let isDescriptionEditable: boolean = false;
	let showDoneChildrenTodos = false;
	let shownInfo: 'description' | 'history' = 'description';

	let effectiveChildrenTodos = mainDetailedTodoDto?.children ?? [];

	$: {
		// Show/hide done children todos
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
</script>

<!-- TODO: use https://svelte.dev/tutorial/svelte-component -->
<div class="todo-details-page">
	<SplitPane
		type="horizontal"
		contextName="TodoWithIdPage-0"
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
				slot="first"
			>
				<div class="main-interaction-panel">
					<a href={`/todo/${parentTodos[parentTodos.length - 1]?.id ?? 'root'}`}>
						<div class="link-area">
							<img
								src={PARENT_ICON_URL}
								alt="composition"
							/>
						</div>
					</a>
				</div>
				<TodoCard
					todo={mainDetailedTodoDto}
					isNavigable={false}
				/>
			</div>
			<div
				class="children-todos"
				slot="second"
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
		<div
			class="todo-info"
			slot="second"
		>
			<div class="info-switch-panel">
				<button
					class={`option-button ${shownInfo === 'description' ? 'selected-option' : ''}`}
					on:click={() => (shownInfo = 'description')}>Description</button
				>
				<button
					class={`option-button ${shownInfo === 'history' ? 'selected-option' : ''}`}
					on:click={() => (shownInfo = 'history')}>History</button
				>
			</div>
			{#if shownInfo === 'description'}
				{#if isDescriptionEditable}
					<RichEditor
						richContent={mainDetailedTodoDto.description}
						on:save={saveContentEditionHandler}
						on:cancel={cancelContentEditionHandler}
					/>
				{:else}
					<div class="description-interaction-panel">
						<button on:click={editHandler}>
							<img
								src={EDIT_ICON_URL}
								alt="status"
							/>
						</button>
					</div>
					<RichText richText={mainDetailedTodoDto.description} />
				{/if}
			{:else}
				<TodoHistory
					todoId={data.detailedTodoDto.id}
					records={data.todoHistoryRecords ?? []}
					on:save={historySaveHandler}
				/>
			{/if}
		</div>
	</SplitPane>
	<div class="parents-block">
		{#each parentTodos as todo, i (todo.id)}
			<PrimitiveCard {todo} />
		{/each}
	</div>
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.todo-details-page {
		flex: 1;
		height: 100vh;
		min-width: 0px;
		@include column;

		.selected-option {
			background-color: $second-color;
		}

		.main-todo {
			padding: $wide-size;

			.main-interaction-panel {
				margin-bottom: $normal-size;
				@include row;

				.link-area {
					background-color: $base-light-color;
					border-radius: $normal-size;
					padding: $small-size $normal-size;
				}

				img {
					@include icon-normal-sized;
				}
			}
		}

		.children-todos-menu {
			padding: $normal-size;

			button {
				@include standard-button;
			}
		}

		.todo-info {
			@include column;

			.info-switch-panel {
				@include row-centered($normal-size);

				button {
					color: $base-contrast-color;
					padding: $small-size $normal-size;
				}
			}

			.description-interaction-panel {
				background-color: $second-color;
				@include row-centered;
				padding: $small-size;

				img {
					@include icon-normal-sized;
				}
			}

			:global(.rich-editor) {
				@include scrollable-in-column;
			}
			:global(.rich-text) {
				@include scrollable-in-column;
			}
			:global(.todo-history) {
				@include scrollable-in-column;
			}
		}

		.parent-todos,
		.children-todos-body {
			padding: $wide-size;
			@include column-stretched;
		}

		.parents-block {
			@include row($normal-size);
			overflow-x: scroll;
			@include styled-scrollbar;
		}

		:global(.parents-block .primitive-card) {
			@include min-max-width(200px, 400px);
		}

		:global(.children-todos-body .primitive-card) {
			margin-bottom: $wide-size;
		}

		:global(.rich-editor-menu) {
			background: $strong-gradient;
		}
	}
</style>
