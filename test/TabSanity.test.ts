import { EOL } from 'os';
import * as assert from 'assert';
import {
	Position
} from 'vscode';

import TabSanity from '../src/TabSanity';
import {
	TextDocument,
	TextEditor,
	TextLine
} from './Mocks';

suite("TabSanity Tests", () => {

	test("#cursorRight", () => {
		const ts = createTabSanityFromLines([
			'    foo  ',
			'  bar    ',
			'          baz '
		]);
		const expectedPositions = [
			[4, 5, 6, 7, 8, 9],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			[0, 4, 8, 9, 10, 11, 12, 13, 14]
		];
		for (const positions of expectedPositions) {
			for (const expected of positions) {
				const actual = ts.cursorRight().character;
				assert.strictEqual(actual, expected);
			}
		}
	});

});

function createTabSanityFromLines(lines: string[]) {
	const doc = new TextDocument(lines.map((line, i) => {
		return new TextLine(line, EOL, i)
	}));
	const editor = new TextEditor(doc);
	return new TabSanity(editor);
}
