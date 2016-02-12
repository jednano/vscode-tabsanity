import { EOL } from 'os';
import * as assert from 'assert';
import {
	Position,
	Selection
} from 'vscode';

import TabSanity from '../src/TabSanity';
import {
	TextDocument,
	TextEditor,
	TextLine
} from './Mocks';

suite('TabSanity Tests', () => {

	const ts = createTabSanityFromLines([
		'    foo  ',
		'  bar    ',
		'          baz    qux '
	]);
	const expectedPositions = [
		[0, 4, 5, 6, 7, 8, 9],
		[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
		[0, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
	];

	test('#cursorRight', () => {
		selectBeginningOfDocument();
		for (let i = 0; i < expectedPositions.length; i++) {
			const positions = expectedPositions[i];
			for (let j = 0; j < positions.length; j++) {
				if (i === 0 && j === 0) {
					continue;
				}
				const actual = ts.cursorRight().character;
				const expected = positions[j];
				assert.strictEqual(actual, expected);
			}
		}
	});

	test('#cursorRightSelect', () => {
		selectBeginningOfDocument();
		for (let i = 0; i < expectedPositions.length; i++) {
			const positions = expectedPositions[i];
			for (let j = 0; j < positions.length; j++) {
				if (i === 0 && j === 0) {
					continue;
				}
				ts.cursorRightSelect();
				const actual = ts.editor.selection.end;
				const expected = new Position(i, positions[j]);
				assert.strictEqual(actual.isEqual(expected), true);
			}
		}
	});

	test('#cursorLeft', () => {
		selectEndOfDocument();
		for (let i = expectedPositions.length - 1; i >= 0; i--) {
			const positions = expectedPositions[i];
			for (let j = positions.length - 1; j >= 0; j--) {
				if (
					i === expectedPositions.length - 1
					&& j === positions.length - 1
				) {
					continue;
				}
				const actual = ts.cursorLeft().character;
				const expected = positions[j];
				assert.strictEqual(actual, expected);
			}
		}
	});

	test('#cursorLeftSelect', () => {
		selectEndOfDocument();
		for (let i = expectedPositions.length - 1; i >= 0; i--) {
			const positions = expectedPositions[i];
			for (let j = positions.length - 1; j >= 0; j--) {
				if (
					i === expectedPositions.length - 1
					&& j === positions.length - 1
				) {
					continue;
				}

				ts.cursorLeftSelect();
				const actual = ts.editor.selection.start;
				const expected = new Position(i, positions[j]);
				assert.strictEqual(actual.isEqual(expected), true);
			}
		}
	});

	function selectBeginningOfDocument() {
		const docStart = new Position(0, 0);
		ts.editor.selections = [new Selection(docStart, docStart)];
	}

	function selectEndOfDocument() {
		const lastLine = ts.doc.lineAt(ts.doc.lineCount - 1);
		const docEnd = new Position(
			lastLine.lineNumber,
			lastLine.text.length
		);
		ts.editor.selections = [new Selection(docEnd, docEnd)];
	}

});

function createTabSanityFromLines(lines: string[]) {
	const doc = new TextDocument(lines.map((line, i) => {
		return new TextLine(line, EOL, i)
	}));
	const editor = new TextEditor(doc);
	return new TabSanity(editor);
}
