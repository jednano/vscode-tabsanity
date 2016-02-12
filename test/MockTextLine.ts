import * as vscode from 'vscode';
import {
	Range
} from 'vscode';

/**
 * Represents a line of text, such as a line of source code.
 *
 * TextLine objects are __immutable__. When a [document](#TextDocument) changes,
 * previously retrieved lines will not represent the latest state.
 */
export default class MockTextLine implements vscode.TextLine {

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
		throw new Error('Not implemented');
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
