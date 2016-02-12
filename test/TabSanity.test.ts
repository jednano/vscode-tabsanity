import { EOL } from 'os';
import * as assert from 'assert';

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

function createTabSanityFromLines(lines: string[]) {
	const doc = new TextDocument(lines.map((line, i) => {
		return new TextLine(line, EOL, i)
	}));
	const editor = new TextEditor(doc);
	return new TabSanity(editor);
}
