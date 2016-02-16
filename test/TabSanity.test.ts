'use strict';

import { EOL } from 'os';
import * as assert from 'assert';
import { join } from 'path';
import {
	commands,
	Position,
	Selection,
	TextDocument,
	TextEditor,
	window
} from 'vscode';

import { TabSanity } from '../src/TabSanity';
import {
	cleanupWorkspace,
	setupWorkspace
} from './testUtils';

suite('TabSanity Tests', () => {

	let ts: TabSanity;

	suiteSetup(() => {
		return setupWorkspace(join(
			__dirname,
			'..',
			'..',
			'test',
			'fixtures',
			'spaces'
		)).then(() => {
			ts = new TabSanity();
			ts.editor.options = {
				insertSpaces: true,
				tabSize: 4
			};
		})
	});

	suiteTeardown(cleanupWorkspace);

	const expectedStops = [
		[0, 4, 5, 6, 7, 8, 9],
		[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
		[0, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
	];

	test('#cursorRight', () => {
		selectBeginningOfDocument();
		for (let i = 0; i < expectedStops.length; i++) {
			const stops = expectedStops[i];
			for (let j = 0; j < stops.length; j++) {
				if (i === 0 && j === 0) {
					continue;
				}
				const actual = ts.cursorRight().character;
				const expected = stops[j];
				assert.strictEqual(
					actual,
					expected,
					`line: ${i}, char: ${expected}`
				);
			}
		}
	});

	test('#cursorRightSelect', () => {
		selectBeginningOfDocument();
		let firstAnchor: Position;
		for (let i = 0; i < expectedStops.length; i++) {
			const stops = expectedStops[i];
			for (let j = 0; j < stops.length; j++) {
				const stop = stops[j];
				if (i === 0 && j === 0) {
					firstAnchor = new Position(i, stop);
					continue;
				}
				ts.cursorRightSelect();
				const sel = ts.editor.selection;
				const anchor = sel.anchor;
				const active = sel.active;
				assert.strictEqual(
					sel.anchor.isEqual(firstAnchor),
					true,
					`first anchor is not the same`
				);
				const expected = new Position(i, stop);
				assert.strictEqual(
					sel.active.isEqual(expected),
					true,
					`line: ${i}, char: ${stop}`
				);
			}
		}
	});

	test('#cursorLeft', () => {
		selectEndOfDocument();
		for (let i = expectedStops.length - 1; i >= 0; i--) {
			const stops = expectedStops[i];
			for (let j = stops.length - 1; j >= 0; j--) {
				if (
					i === expectedStops.length - 1
					&& j === stops.length - 1
				) {
					continue;
				}
				const actual = ts.cursorLeft().character;
				const expected = stops[j];
				assert.strictEqual(
					actual,
					expected,
					`line: ${i}, char: ${expected}`
				);
			}
		}
	});

	test('#cursorLeftSelect', () => {
		selectEndOfDocument();
		let firstAnchor: Position;
		for (let i = expectedStops.length - 1; i >= 0; i--) {
			const stops = expectedStops[i];
			for (let j = stops.length - 1; j >= 0; j--) {
				const stop = stops[j];
				if (
					i === expectedStops.length - 1
					&& j === stops.length - 1
				) {
					firstAnchor = new Position(i, stop);
					continue;
				}
				ts.cursorLeftSelect();
				const sel = ts.editor.selection;
				const anchor = sel.anchor;
				const active = sel.active;
				assert.strictEqual(
					sel.anchor.isEqual(firstAnchor),
					true,
					`first anchor is not the same`
				);
				const expected = new Position(i, stop);
				assert.strictEqual(
					sel.active.isEqual(expected),
					true,
					`line: ${i}, char: ${stop}`
				);
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
