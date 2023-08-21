<script lang="ts">
	import { getTodoHierarchy, moveTodo } from '$lib/api/todo-calls';
	import { ROOT_TODO_ID } from '$lib/constants/todo/fields';
	import type { TodoDto, TodoHierachyDto } from '$lib/types/todo';
	import { onMount } from 'svelte';
	import ModalWindow from './../../../components/ModalWindow.svelte';
	import MoveTodoCard from './MoveTodoCard.svelte';

	// constants
	const withParentsLayoutClass = "with-parents-layout";
	const onlyChildrenLayoutClass = "only-children-layout";

	// data
	export let movingTodoDto: TodoHierachyDto | TodoDto;
	export let potentialNewParentDto: TodoHierachyDto | null;
	$: showParents = potentialNewParentDto && potentialNewParentDto.id !== ROOT_TODO_ID;
	$: layoutClass = showParents ? withParentsLayoutClass : onlyChildrenLayoutClass;
	$: parentTodos = potentialNewParentDto?.parents?.reverse() ?? [];
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
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	.moving-todo-panel {
		background-color: $base-dark-color;
		padding: $large-size;

		@include bordered($color: $base-color, $size: $border-small-size);
		@include screen-sized(80, 80);
		@include column-stretched($wide-size);
	}

	.moving-todo {
		background-color: $base-light-color;
		color: $base-contrast-color;
		@include standard-container;
	}

	.with-parents-layout {
	}

	.only-children-layout {
	}
</style>
