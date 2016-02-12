import { EOL } from 'os';
import * as assert from 'assert';
import * as vscode from 'vscode';
import {
	Position,
	Selection,
	TextDocument,
	TextEditor,
	window
} from 'vscode';

import TabSanity from '../src/TabSanity';
import MockTextDocument from './MockTextDocument';
import MockTextEditor from './MockTextEditor';
import MockTextLine from './MockTextLine';

suite("TabSanity Tests", () => {

	test("#cursorRight", () => {
		const ts = mockDocument([
			'    foo  ',
			''
		]);
		assert.equal(ts.editor.selection.start.character, 0, 'starts at position 0');
		assert.equal(ts.cursorRight().character, 4, 'moves right 4 spaces');
		assert.equal(ts.cursorRight().character, 5, 'then moves right 1 space');
		assert.equal(ts.cursorRight().character, 6, 'then moves right 1 space');
		assert.equal(ts.cursorRight().character, 7, 'then moves right 1 space');
		assert.equal(ts.cursorRight().character, 8, 'then moves right 1 space');
		assert.equal(ts.cursorRight().character, 9, 'then moves right 1 space');
		// TODO: Keep going.
	});

});

function mockDocument(lines: string[]) {
	const doc = new MockTextDocument(lines.map((line, i) => {
		return new MockTextLine(line, EOL, i)
	}));
	const editor = new MockTextEditor(doc);
	return new TabSanity(editor);
}
