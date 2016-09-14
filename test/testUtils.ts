'use strict';

// https://github.com/VSCodeVim/Vim/blob/master/test/testUtils.ts
import * as assert from 'assert';
import {
	commands,
	window,
	workspace
} from 'vscode';

export async function setupWorkspace(file: string) {
	const doc = await workspace.openTextDocument(file);

	await window.showTextDocument(doc);

	assert.ok(window.activeTextEditor);
}

export function cleanupWorkspace() {
	return new Promise((resolve, reject) => {
		if (!window.visibleTextEditors.length) {
			return resolve();
		}

		const interval = setInterval(() => {
			if (window.visibleTextEditors.length) {
				return;
			}

			clearInterval(interval);
			resolve();
		}, 10);

		commands.executeCommand('workbench.action.closeAllEditors')
			.then(() => commands.executeCommand('workbench.files.action.closeAllFiles'))
			.then(null, err => {
				clearInterval(interval);
				reject(err);
			});
	}).then(() => {
		assert.strictEqual(window.visibleTextEditors.length, 0);
		assert(!window.activeTextEditor);
	});
}
