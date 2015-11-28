import {
	commands,
	ExtensionContext,
	window
} from 'vscode';

import TabSanity from './TabSanity';

export function activate(context: ExtensionContext) {
	const tabSanity = new TabSanity();

	context.subscriptions.push(window.onDidChangeActiveTextEditor(editor => {
		tabSanity.editor = editor;
		tabSanity.tabSize = editor.options.tabSize;
	}));

	context.subscriptions.push(window.onDidChangeTextEditorOptions(event => {
		tabSanity.editor = event.textEditor;
		tabSanity.tabSize = event.options.tabSize;
	}));

	Array.prototype.push.apply(
		context.subscriptions,
		[
			'cursorLeft',
			'cursorLeftSelect',
			'cursorRight',
			'cursorRightSelect',
			'deleteLeft',
			'deleteRight'
		].map(command => {
			return commands.registerCommand(
				`tabSanity.${command}`,
				() => {
					tabSanity[command]();
				}
			);
		})
	);
}
