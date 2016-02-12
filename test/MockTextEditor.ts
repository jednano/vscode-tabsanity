import * as vscode from 'vscode';
import {
	DecorationOptions,
	Position,
	Range,
	Selection,
	TextDocument,
	TextEditorDecorationType,
	TextEditorEdit,
	TextEditorOptions,
	TextEditorRevealType,
	ViewColumn
} from 'vscode';

/**
 * Represents an editor that is attached to a [document](#TextDocument).
 */
export default class MockTextEditor implements vscode.TextEditor {

	constructor(
		/**
		 * The document associated with this text editor. The document will be the same for the entire lifetime of this text editor.
		 */
		public document?: TextDocument,
		/**
		 * Text editor options.
		 */
		public options?: TextEditorOptions
	) {
		this.document = document;
		const positionZero = new Position(0, 0);
		this.selections = [new Selection(positionZero, positionZero)];
		this.options = options || {
			insertSpaces: true,
			tabSize: 4
		};
	}

	/**
	 * The primary selection on this text editor. Shorthand for `TextEditor.selections[0]`.
	 */
	public get selection() {
		return this.selections[0];
	}

	/**
	 * The selections in this text editor. The primary selection is always at index 0.
	 */
	public selections: Selection[];

	/**
	 * Perform an edit on the document associated with this text editor.
	 *
	 * The given callback-function is invoked with an [edit-builder](#TextEditorEdit) which must
	 * be used to make edits. Note that the edit-builder is only valid while the
	 * callback executes.
	 *
	 * @param callback A function which can make edits using an [edit-builder](#TextEditorEdit).
	 * @return A promise that resolves with a value indicating if the edits could be applied.
	 */
	public edit(callback: (editBuilder: TextEditorEdit) => void): Thenable<boolean> {
		throw new Error('Not implemented');
	}

	/**
	 * Adds a set of decorations to the text editor. If a set of decorations already exists with
	 * the given [decoration type](#TextEditorDecorationType), they will be replaced.
	 *
	 * @see [createTextEditorDecorationType](#window.createTextEditorDecorationType).
	 *
	 * @param decorationType A decoration type.
	 * @param rangesOrOptions Either [ranges](#Range) or more detailed [options](#DecorationOptions).
	 */
	public setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: Range[] | DecorationOptions[]): void {
		throw new Error('Not implemented');
	}

	/**
	 * Scroll as indicated by `revealType` in order to reveal the given range.
	 *
	 * @param range A range.
	 * @param revealType The scrolling strategy for revealing `range`.
	 */
	public revealRange(range: Range, revealType?: TextEditorRevealType) {
		// noop
	}

	/**
	 * Show the text editor.
	 *
	 * @deprecated **This method is deprecated.** Use [window.showTextDocument](#window.showTextDocument)
	 * instead. This method shows unexpected behavior and will be removed in the next major update.
	 *
	 * @param column The [column](#ViewColumn) in which to show this editor.
	 */
	public show(column?: ViewColumn): void {
		throw new Error('Not implemented');
	}

	/**
	 * Hide the text editor.
	 *
	 * @deprecated **This method is deprecated.** Use the command 'workbench.action.closeActiveEditor' instead.
	 * This method shows unexpected behavior and will be removed in the next major update.
	 */
	public hide(): void {
		throw new Error('Not implemented');
	}

}
