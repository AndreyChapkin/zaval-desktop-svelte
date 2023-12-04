<script lang="ts">
	import { findTodosWithNameFragment, moveTodo } from '$lib/api/todo-calls';
	import type { CustomSvelteEvent } from '$lib/types/general';
	import type { DetailedTodoDto, LightTodoDto } from '$lib/types/todo';
	import { decreaseNumberOfCalls } from '$lib/utils/function-helpers';
	import LoadingIndicator from '../../../components/LoadingIndicator.svelte';
	import ModalWindow from './../../../components/ModalWindow.svelte';
	import MoveTodoCard from './MoveTodoCard.svelte';

	// data
	export let movingTodoDto: DetailedTodoDto | LightTodoDto;
	let searchValue: string;
	let todos: LightTodoDto[];
	let isLoading = false;

	// events and issuers

	// calls

	// handlers
	const selectHandler = async (selectEvent: CustomSvelteEvent<LightTodoDto>) => {
		await moveTodo({
			todoId: movingTodoDto.id,
			parentId: selectEvent.detail.id
		});
		location.href = `/todo/${movingTodoDto.id}`;
	};

	const toRootHandler = async () => {
		await moveTodo({
			todoId: movingTodoDto.id,
			parentId: null,
		});
		location.href = `/todo/${movingTodoDto.id}`;
	};

	// reactive functions
	const searchTodos = decreaseNumberOfCalls((value: string) => {
		isLoading = true;
		findTodosWithNameFragment(value).then((data) => {
			isLoading = false;
			todos = data;
		});
	}, 500);

	$: if (searchValue) {
		searchTodos(searchValue);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalWindow on:close>
	<div class="moving-todo-panel">
		<div class="moving-todo">
			{movingTodoDto.name}
		</div>
		<button class="to-root" on:click={toRootHandler}>To root</button>
		<div class="delimeter">or</div>
		<div class="search-panel">
			<input
				class="search-input"
				type="text"
				bind:value={searchValue}
				autofocus
			/>
			{#if isLoading}
				<LoadingIndicator />
			{:else}
				<div class="found-todo">
					{#if todos && todos.length > 0}
						{#each todos as todo}
							<MoveTodoCard
								{todo}
								on:select={selectHandler}
							/>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
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
		@include screen-sized(70, 80);
		@include column-stretch($wide-size);
	}

	.to-root {
		@include standard-button;
	}

	.delimeter {
		text-align: center;
		color: $base-contrast-color;
	}

	.search-panel {
		@include column-stretch($wide-size);
	}

	.search-input {
		color: $base-contrast-color;
		background: $strong-gradient;
		@include bordered($color: $strong-second-color, $size: $border-small-size);
		@include standard-input;
	}

	.moving-todo {
		background-color: $second-light-color;
		color: $base-contrast-color;
		@include standard-container;
	}

	.found-todo {
		@include scrollable;
		@include responsive-grid(350px);
	}
</style>
