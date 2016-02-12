import * as vscode from 'vscode';
import {
	DecorationOptions,
	Position,
	Range,
	Selection,
	TextEditorDecorationType,
	TextEditorEdit,
	TextEditorOptions,
	TextEditorRevealType,
	ViewColumn
} from 'vscode';

/**
 * Represents an editor that is attached to a [document](#TextDocument).
 */
export class TextEditor implements vscode.TextEditor {

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

/**
 * Represents a text document, such as a source file. Text documents have
 * [lines](#TextLine) and knowledge about an underlying resource like a file.
 */
export class TextDocument implements vscode.TextDocument {

	constructor(private lines?: vscode.TextLine[]) {
		if (!lines) {
			this.lines = [new TextLine()];
		}
	}

	/**
	 * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
	 * represent files on disk. However, some documents may have other schemes indicating that they are not
	 * available on disk.
	 */
	public get uri(): vscode.Uri {
		throw new Error('Not implemented');
	}

	/**
	 * The file system path of the associated resource. Shorthand
	 * notation for [TextDocument.uri.fsPath](#TextDocument.uri.fsPath). Independent of the uri scheme.
	 */
	public get fileName(): string {
		throw new Error('Not implemented');
	}

	/**
	 * Is this document representing an untitled file.
	 */
	public get isUntitled(): boolean {
		throw new Error('Not implemented');
	}

	/**
	 * The identifier of the language associated with this document.
	 */
	public get languageId(): string {
		throw new Error('Not implemented');
	}

	/**
	 * The version number of this document (it will strictly increase after each
	 * change, including undo/redo).
	 */
	public get version(): number {
		throw new Error('Not implemented');
	}

	/**
	 * true if there are unpersisted changes.
	 */
	public get isDirty(): boolean {
		throw new Error('Not implemented');
	}

	/**
	 * Save the underlying file.
	 *
	 * @return A promise that will resolve to true when the file
	 * has been saved.
	 */
	public save(): Thenable<boolean> {
		throw new Error('Not implemented');
	}

	/**
	 * The number of lines in this document.
	 */
	public get lineCount() {
		return this.lines.length;
	}

	/**
	 * Returns a text line denoted by the line number. Note
	 * that the returned object is *not* live and changes to the
	 * document are not reflected.
	 *
	 * @param line A line number in [0, lineCount).
	 * @return A [line](#TextLine).
	 */
	public lineAt(line: number): vscode.TextLine;

	/**
	 * Returns a text line denoted by the position. Note
	 * that the returned object is *not* live and changes to the
	 * document are not reflected.
	 *
	 * The position will be [adjusted](#TextDocument.validatePosition).
	 *
	 * @see [TextDocument.lineAt](#TextDocument.lineAt)
	 * @param position A position.
	 * @return A [line](#TextLine).
	 */
	public lineAt(position: Position): vscode.TextLine;
	public lineAt(x: number|Position): vscode.TextLine {
		return this.lines[
			(typeof x === 'number') ? x : (<Position>x).line
		];
	}

	/**
	 * Converts the position to a zero-based offset.
	 *
	 * The position will be [adjusted](#TextDocument.validatePosition).
	 *
	 * @param position A position.
	 * @return A valid zero-based offset.
	 */
	public offsetAt(position: Position): number {
		throw new Error('Not implemented');
	}

	/**
	 * Converts a zero-based offset to a position.
	 *
	 * @param offset A zero-based offset.
	 * @return A valid [position](#Position).
	 */
	public positionAt(offset: number): Position {
		throw new Error('Not implemented');
	}

	/**
	 * Get the text of this document. A substring can be retrieved by providing
	 * a range. The range will be [adjusted](#TextDocument.validateRange).
	 *
	 * @param range Include only the text included by the range.
	 * @return The text inside the provided range or the entire text.
	 */
	public getText(range?: Range) {
		const lines = this.lines.slice(range.start.line, range.end.line + 1);
		return lines.reduce((prev, cur, i) => {
			const from = (i === 0) ? range.start.character : 0;
			const length = (i === lines.length - 1) && range.end.character;
			return prev + cur.text.substring(from, length);
		}, '');
	}

	/**
	 * Get a word-range at the given position. By default words are defined by
	 * common separators, like space, -, _, etc. In addition, per languge custom
	 * [word definitions](#LanguageConfiguration.wordPattern) can be defined.
	 *
	 * The position will be [adjusted](#TextDocument.validatePosition).
	 *
	 * @param position A position.
	 * @return A range spanning a word, or `undefined`.
	 */
	public getWordRangeAtPosition(position: Position): Range {
		throw new Error('Not implemented');
	}

	/**
	 * Ensure a range is completely contained in this document.
	 *
	 * @param range A range.
	 * @return The given range or a new, adjusted range.
	 */
	public validateRange(range: Range): Range {
		throw new Error('Not implemented');
	}

	/**
	 * Ensure a position is contained in the range of this document.
	 *
	 * @param position A position.
	 * @return The given position or a new, adjusted position.
	 */
	public validatePosition(position: Position): Position {
		throw new Error('Not implemented');
	}
}

/**
 * Represents a line of text, such as a line of source code.
 *
 * TextLine objects are __immutable__. When a [document](#TextDocument) changes,
 * previously retrieved lines will not represent the latest state.
 */
export class TextLine implements vscode.TextLine {

	private _text: string;
	private _lineNumber: number;

	constructor(
		text?: string,
		private newlineSequence?: string,
		lineNumber?: number
	) {
		this._text = text;
		this._lineNumber = lineNumber;
	}

	/**
	 * The zero-based line number.
	 */
	public get lineNumber() {
		return this._lineNumber;
	}

	/**
	 * The text of this line without the line separator characters.
	 */
	public get text() {
		return this._text;
	}

	/**
	 * The range this line covers without the line separator characters.
	 */
	public get range(): Range {
		return new Range(
			new Position(this.lineNumber, 0),
			new Position(this.lineNumber, this.text.length)
		);
	}

	/**
	 * The range this line covers with the line separator characters.
	 */
	public get rangeIncludingLineBreak(): Range {
		throw new Error('Not implemented');
	}

	/**
	 * The offset of the first character which is not a whitespace character as defined
	 * by `/\s/`.
	 */
	public get firstNonWhitespaceCharacterIndex(): number {
		const result = /\S/.exec(this.text);
		return result && result.index;
	}

	/**
	 * Whether this line is whitespace only, shorthand
	 * for [TextLine.firstNonWhitespaceCharacterIndex](#TextLine.firstNonWhitespaceCharacterIndex]) === [TextLine.text.length](#TextLine.text.length).
	 */
	public get isEmptyOrWhitespace(): boolean {
		throw new Error('Not implemented');
	}
}
