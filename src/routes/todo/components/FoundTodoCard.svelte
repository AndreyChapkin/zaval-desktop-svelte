<script lang="ts">
	import { getPrioritizedListOfTodos } from '$lib/api/todo-calls';
	import { ROOT_TODO_HIERARCHY, type DetailedTodoDto, type LightTodoDto } from '$lib/types/todo';
	import { TODO_COMPLEX_ICON_URL } from '$lib/utils/assets-references';
	import { presentDate } from '$lib/utils/presentation-helpers';
	import { createEventDispatcher } from 'svelte';
	import PrimitiveCard from '../[status=status_enum]/components/PrimitiveCard.svelte';

	// state
	export let todo: DetailedTodoDto | LightTodoDto;
	let parents: {
		isInitialized: boolean;
		data: LightTodoDto[];
	} = {
		isInitialized: false,
		data: []
	};
	let isRevealed = false;
	export let externalClass = '';

	// reactivity
	$: if (isRevealed && !parents.isInitialized) {
		getPrioritizedListOfTodos([todo.id]).then((prioritiezedList) => {
			parents = {
				isInitialized: true,
				data: prioritiezedList.parentBranchesMap[0]
			};
		});
	}

	// events
	type EventType = {
		select: DetailedTodoDto | LightTodoDto;
	};
	const dispatch = createEventDispatcher<EventType>();

	// handlers
	const todoIsRevealedHandler = () => {
		isRevealed = true;
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class={`found-todo-card ${externalClass}`}
	on:mouseenter={() => (isRevealed = true)}
>
	<div class="child-block">
		<div class="interaction-panel">
			<div
				class="go-to-todo"
				on:click={() => (dispatch('select', todo))}
			>
				<a href={`/todo/${todo.id === ROOT_TODO_HIERARCHY.id ? '' : todo.id}`}>
					<div class="link-area">
						<img
							src={TODO_COMPLEX_ICON_URL}
							alt="composition"
						/>
					</div>
				</a>
			</div>
		</div>
		<div class="todo-info">
			<div class="todo-name">
				{todo.name}
			</div>
			<div class="additional-info">
				<div class="todo-priority">
					{todo.priority}
				</div>
				<div class="todo-interacted-on">
					{presentDate(todo.interactedOn)}
				</div>
			</div>
		</div>
	</div>
	{#if isRevealed}
		<div class="parents-block">
			{#each parents.data as parent}
				<PrimitiveCard todo={parent} />
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '/static/style/todo-variables.scss';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';
	@import '/static/style/common/size/';
	@import '/static/style/common/color/';

	.found-todo-card {
		color: $base-contrast-color;
		padding: $normal-size $normal-size;
		position: relative;
		overflow: hidden;
		min-height: 70px;
		@include bordered(all, $second-light-color, 3px);

		@include column($large-size);
		border-radius: $normal-size;
	}

	.child-block {
		@include row-start($wide-size);
	}

	.interaction-panel {
		background-color: $base-light-color;
		border-radius: 1.5 * $normal-size;
		padding: 0.8 * $normal-size;
		@include column-centered($normal-size);

		.go-to-todo {
			@include like-normal-button;
		}
	}

	.todo-info {
		@apply flex-1;
		@include column-justifyied;

		.additional-info {
			@include row($normal-size);
			font-size: smaller;
			color: $base-weak-contrast-color;
		}
	}

	.parents-block {
		@include row($normal-size);
		overflow-x: scroll;
		@include styled-scrollbar;
	}
</style>
