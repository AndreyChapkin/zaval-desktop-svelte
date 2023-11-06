<script lang="ts">
	import type { CustomSvelteEvent } from '$lib/types/general';
	import {
		findSelectedElementWithClass,
		findSelectedElementsWithClass
	} from '$lib/utils/rich-editor/dom-helpers';
	import { afterUpdate } from 'svelte';
	import RichEditorLine from './RichEditorLine.svelte';
	import {
		getRandomInt,
		getTextAfterCaret,
		getTextAfterSelection,
		getTextBeforeCaret,
		getTextBeforeSelection,
		setCaretToPosition
	} from './line-helpers';

	// data
	export let richContent: string = '12\r\n33334\r\n566666\r\n78\r\n';
	export let contentLines: { text: string; id: number }[] = richContent.split('\r\n').map((i) => ({
		text: i,
		id: getRandomInt(1000000, 2000000)
	}));
	let actualLineNumber = 1;
	let richEditorContainer: HTMLElement;
	let mutationDescription: any | null = null;

	$: if (contentLines) {
		console.log('@@@ ' + JSON.stringify(contentLines));
	}

	// lifecycle
	afterUpdate(() => {
		const actualLineContainer = richEditorContainer.children[actualLineNumber - 1];
		if (actualLineContainer) {
			setCaretToPosition(0, actualLineContainer as HTMLElement);
		}
	});

	// events and issuers
	const onNewLineHandler = async (
		event: CustomSvelteEvent<{
			newLineNumber: number;
			newLineContent: string;
			prevLineContent: string;
		}>
	) => {};

	// functions

	// handlers
	const keyupHandler = (event: KeyboardEvent) => {
		if (event.code === 'Enter') {
		}
		if (event.code === 'Backspace' || event.code === 'Delete') {
		}
	};

	const keydownHandler = (event: KeyboardEvent) => {
		if (event.code === 'Enter') {
			const splittedLineContainer = findSelectedElementWithClass('rich-editor-line');
			if (splittedLineContainer) {
				const prevLineNumber = Number(splittedLineContainer.dataset.lineNumber);
				const prevLineIndex = prevLineNumber - 1;
				const prevLineText = getTextBeforeCaret(splittedLineContainer);
				const newLineText = getTextAfterCaret(splittedLineContainer);
				const elementsBeforeSelectedLine = contentLines.slice(0, prevLineIndex);
				const elementsAfterSelectedLine = contentLines.slice(prevLineIndex + 1);
				const prevLineDesc = { text: prevLineText, id: getRandomInt(1000000, 2000000) };
				const newLineDesc = { text: newLineText, id: getRandomInt(1000000, 2000000) };
				contentLines = [
					...elementsBeforeSelectedLine,
					prevLineDesc,
					newLineDesc,
					...elementsAfterSelectedLine
				];
			}
			event.preventDefault();
		}
		if (event.code === 'Backspace' || event.code === 'Delete') {
			const selectedLineContainers = findSelectedElementsWithClass('rich-editor-line');
			if (selectedLineContainers) {
				let [firstContainer, lastContainer] = selectedLineContainers;
				let firstLineNumber = Number(firstContainer.dataset.lineNumber);
				let lastLineNumber = Number(lastContainer.dataset.lineNumber);
				if (firstLineNumber > lastLineNumber) {
					const tempN = firstLineNumber;
					firstLineNumber = lastLineNumber;
					lastLineNumber = tempN;
					const tempC = firstContainer;
					firstContainer = lastContainer;
					lastContainer = tempC;
				}
				console.log("@@@ getTextBeforeSelection: " + JSON.stringify(getTextBeforeSelection(Array.from(richEditorContainer.children) as HTMLElement[])));
				console.log("@@@ getTextAfterSelection: " + JSON.stringify(getTextAfterSelection(Array.from(richEditorContainer.children) as HTMLElement[])));
			}
			event.preventDefault();
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="rich-editor-markdown"
	contenteditable
	bind:this={richEditorContainer}
	on:keydown={keydownHandler}
	on:keyup={keyupHandler}
>
	{#each contentLines as contentLine, i (contentLine.id)}
		<RichEditorLine
			contentLine={contentLine.text}
			lineNumber={i + 1}
			on:newLine={onNewLineHandler}
		/>
	{/each}
</div>

<style lang="scss">
	@import '/static/style/common/color/';
	@import '/static/style/common/size/';
	@import '/static/style/common/composition/';
	@import '/static/style/common/facade/';

	@font-face {
		font-family: Nunito;
		font-weight: normal;
		src: url('$lib/assets/fonts/Nunito-Regular.ttf');
	}

	@font-face {
		font-family: Nunito;
		font-weight: bold;
		src: url('$lib/assets/fonts/Nunito-Black.ttf');
	}

	.rich-editor-markdown {
		:global(.rich-editor-line) {
			outline: none;
		}
	}
</style>
