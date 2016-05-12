'use strict';

import {
	commands,
	ExtensionContext
} from 'vscode';

import { TabSanity } from './TabSanity';

export function activate(context: ExtensionContext) {
	const tabSanity = new TabSanity();
	Array.prototype.push.apply(
		context.subscriptions,
		[
			'cursorLeft',
			'cursorLeftSelect',
			'cursorHomeSelect',
			'cursorRight',
			'cursorRightSelect',
			'cursorEndSelect',
			'deleteLeft',
			'deleteRight'
		].map(command => {
			return commands.registerCommand(
				`tabsanity.${command}`,
				() => {
					tabSanity[command]();
				}
			);
		})
	);
}
