import * as vscode from 'vscode';
import {
	Position,
	Range
} from 'vscode';

import MockTextLine from './MockTextLine';

/**
 * Represents a text document, such as a source file. Text documents have
 * [lines](#TextLine) and knowledge about an underlying resource like a file.
 */
export default class MockTextDocument implements vscode.TextDocument {

	constructor(private lines?: vscode.TextLine[]) {
		if (!lines) {
			this.lines = [new MockTextLine()];
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
			const length = (i === lines.length - 1) && range.end.character - 1;
			return prev + cur.text.substr(from, length);
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
