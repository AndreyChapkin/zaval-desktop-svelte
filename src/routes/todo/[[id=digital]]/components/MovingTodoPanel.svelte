<script lang="ts">
	import { getTodoHierarchy, moveTodo } from '$lib/api/todo-calls';
	import { ROOT_TODO_ID } from '$lib/constants/todo/fields';
	import type { TodoHierachyDto } from '$lib/types/todo';
	import { onMount } from 'svelte';
	import ModalWindow from './../../../components/ModalWindow.svelte';
	import MoveTodoCard from './MoveTodoCard.svelte';

	// constants
	const withParentsLayoutClass = "with-parents-layout";
	const onlyChildrenLayoutClass = "only-children-layout";

	// data
	export let movingTodoDto: TodoHierachyDto;
	export let potentialNewParentDto: TodoHierachyDto | null;
	$: showParents = potentialNewParentDto && potentialNewParentDto.id !== ROOT_TODO_ID;
	$: layoutClass = showParents ? withParentsLayoutClass : onlyChildrenLayoutClass;
	$: parentTodos = potentialNewParentDto?.parents ?? [];
	$: childrenTodos = potentialNewParentDto?.children?.filter((it) => it.id !== movingTodoDto.id) ?? [];
	$: isLoading = true;

	// events and issuers

	// calls
	const getNewPontentialParentHierarchy = async (id: number | null = null) => {
		isLoading = true;
		const newParentDto = await getTodoHierarchy(id);
		potentialNewParentDto = newParentDto;
		isLoading = false;
	};

	// handlers
	const createSelectHandler = (dto: TodoHierachyDto) => async () => {
		await moveTodo({
			todoId: movingTodoDto.id,
			parentId: dto.id
		});
		location.href = `/todo/${movingTodoDto.id}`;
	};

	const createGoToHandler = (dto: TodoHierachyDto) => async () => {
		getNewPontentialParentHierarchy(dto.id);
	};

	// lifecycle
	onMount(() => {
		getNewPontentialParentHierarchy(potentialNewParentDto?.id ?? null);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close>
	<div class={`moving-todo-panel ${layoutClass}`}>
		<div class="moving-todo">
			{movingTodoDto.name}
		</div>
		{#if isLoading}
			<div>Loading...</div>
		{:else}
			{#if potentialNewParentDto && potentialNewParentDto.id !== ROOT_TODO_ID}
				<div class="parents">
					<div class="potential-new-parent">
						<MoveTodoCard
							todo={potentialNewParentDto}
							on:select={createSelectHandler(potentialNewParentDto)}
							on:visit={createGoToHandler(potentialNewParentDto)}
						/>
					</div>
					<div class="upper-parents">
						{#each parentTodos as parentTodo (parentTodo.id)}
							<div class="arrow">/\</div>
							<MoveTodoCard
								todo={parentTodo}
								on:select={createSelectHandler(parentTodo)}
								on:visit={createGoToHandler(parentTodo)}
							/>
						{/each}
					</div>
				</div>
			{/if}
			<div class="children">
				{#each childrenTodos as childTodo (childTodo.id)}
					<MoveTodoCard
						todo={childTodo}
						on:select={createSelectHandler(childTodo)}
						on:visit={createGoToHandler(childTodo)}
					/>
				{/each}
			</div>
		{/if}
	</div>
</ModalWindow>

<style lang="scss">
	@import '/static/style/variables-mixins.scss';

	.moving-todo-panel {
		position: absolute;
		left: 10vw;
		top: 10vh;
		width: 80vw;
		height: 80vh;
		background-color: $base-color;
		overflow: hidden;
		display: grid;
		grid-template-rows: minmax(100px, 1fr) minmax(100px, 3fr);

		@apply rounded-md;
	}

	.with-parents-layout {
		grid-template-areas:
			'header header'
			'left right';
		grid-template-columns: minmax(100px, 1fr) minmax(100px, 2fr);
	}

	.only-children-layout {
		grid-template-areas:
			'header'
			'right';
	}

	.moving-todo {
		grid-area: header;
		padding: $normal-size;

		@include attractive-component;
		@include bordered(bottom, $base-pale-color);
	}

	.parents {
		overflow-y: auto;
		grid-area: left;
		padding: $normal-size;

		@include column-stretched;
		@include scrollable;
		@include bordered(right, $base-pale-color);
	}

	.arrow {
		margin-left: auto;
		margin-right: auto;
		text-align: center;
	}

	.children {
		overflow-y: auto;
		grid-area: right;
		padding: $normal-size;

		@include responsive-grid();
		@include scrollable;
	}

	/* .moving-todo-panel {
		padding: $normal-size;
		background-color: $base-color;

		width: 90vw;
		height: 90vh;
		@include column-stretched;

		.moving-todo {
			padding: $normal-size;
			@include attractive-component;
			@include bordered($side: bottom, $color: $base-dark-color);
		}

		.parents-and-children {
			flex: 1;
			@include row-stretched($normal-size);

			.parents {
				flex: 2;
				@include bordered($side: right, $color: $base-dark-color);
				@include column;
				padding-top: $normal-size;
				padding-right: $normal-size;
				background-color: red;
				@include scrollable;

				.potential-new-parent {
					@include bordered($side: bottom);
				}

				.upper-parents {
					@include column-stretched;
					background-color: pink;
					flex: 1;

					.arrow {
						color: white;
						margin-top: $narrow-size;
						margin-bottom: $narrow-size;
						margin-left: auto;
						margin-right: auto;
					}
				}
			}

			.children {
				flex: 3;
				padding-top: $normal-size;
				@include responsive-grid(300px);
			}
		}

		.main-and-parents-todos {
			width: 45%;
			@include column-stretched;

			.main-todo {
				border-color: red;
				border-width: 2px;
				padding: $normal-size;

				@include attractive-component;
			}
		}

		.children-todos {
			@apply flex-1;
			@include responsive-grid;
		}

		img {
			@include icon-normal-sized;
			margin-left: auto;
			margin-right: auto;
		}

		.button-like {
			background-color: pink;
		}
	} */
</style>
