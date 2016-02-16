'use strict';

import {
	commands,
	Position,
	Range,
	Selection,
	TextDocument,
	TextEditor,
	window
} from 'vscode';

const TAB = '\t';
const ALL_SPACES = /^ +$/;

export class TabSanity {

	public get editor() {
		return window.activeTextEditor;
	}

	public get doc() {
		return this.editor.document;
	}

	private get tabSize() {
		return this.editor.options.tabSize;
	}

	public cursorLeft() {
		const sel = this.editor.selection;
		const start = sel.start;
		const isEmpty = sel.isEmpty;
		if (!isEmpty) {
			this.moveToPosition(start);
			return;
		}
		return this.moveToPosition(this.findNextLeftPosition(start));
	}

	private moveToPosition(anchor: Position, active?: Position) {
		active = active || anchor;
		const newSelection = new Selection(anchor, active);
		this.editor.selections = [newSelection];
		this.editor.revealRange(newSelection);
		return anchor;
	}

	private findNextLeftPosition(pos: Position) {
		if (this.isBeginningOfLine(pos)) {
			if (this.isFirstLine(pos)) {
				return pos;
			}
			return this.endOfPreviousLine(pos);
		}

		const previousPosition = pos.with(pos.line, pos.character - 1);
		if (
			this.tabSize <= 1
			|| this.isOnATabStop(previousPosition)
			|| this.peekLeft(pos, 1) === TAB
			|| !this.isWithinLeadingWhitespace(previousPosition)
			|| this.isWithinAlignmentRange(previousPosition)
		) {
			return previousPosition;
		}

		return this.findPreviousTabStop(pos);
	}

	private isWithinLeadingWhitespace(pos: Position) {
		return pos.isBefore(this.findFirstNonWhitespace(pos.line));
	}

	private isOnATabStop(pos: Position) {
		return !(pos.character % this.tabSize);
	}

	private isWithinAlignmentRange(pos: Position) {
		const extraSpaces = pos.character % this.tabSize;
		const nextTabStop = this.tabSize - extraSpaces;
		return !ALL_SPACES.test(this.peekRight(pos, nextTabStop));
	}

	private isBeginningOfLine(pos: Position) {
		return pos.character === 0;
	}

	private isFirstLine(pos: Position) {
		return pos.line === 0;
	}

	private endOfPreviousLine(pos: Position) {
		const previousLine = this.doc.lineAt(pos.line - 1);
		return pos.with(
			previousLine.lineNumber,
			previousLine.range.end.character
		);
	}

	private findPreviousTabStop(pos: Position) {
		let spaces = this.tabSize;
		let previousTabStop = pos.character - spaces;
		if (spaces > 1) {
			previousTabStop += (this.tabSize - previousTabStop) % this.tabSize;
		}
		return pos.with(pos.line, previousTabStop);
	}

	private peekLeft(position: Position, chars: number) {
		return this.doc.getText(new Range(
			position.with(position.line, position.character - chars),
			position
		));
	}

	private findFirstNonWhitespace(lineNumber: number, offset?: number) {
		offset = offset || 0;
		const line = this.doc.lineAt(lineNumber);
		let character = line.firstNonWhitespaceCharacterIndex + offset;
		if (character < 0) {
			character = 0;
		}
		return new Position(lineNumber, character);
	}

	public cursorLeftSelect() {
		this.editor.selections = this.editor.selections.map(selection => {
			return new Selection(
				selection.anchor,
				this.findNextLeftPosition(selection.active)
			);
		}, this);
	}

	public cursorRight() {
		const sel = this.editor.selection;
		const end = sel.end;
		const isEmpty = sel.isEmpty;
		if (!isEmpty) {
			this.moveToPosition(end);
			return;
		}
		return this.moveToPosition(this.findNextRightPosition(end));
	}

	private findNextRightPosition(pos: Position) {
		if (this.isEndOfLine(pos)) {
			if (this.isLastLine(pos)) {
				return pos;
			}
			return this.startOfNextLine(pos);
		}

		const nextPosition = pos.with(pos.line, pos.character + 1);
		if (
			this.tabSize <= 1
			|| this.isOnATabStop(nextPosition)
			|| this.peekRight(pos, 1) === TAB
			|| !this.isWithinLeadingWhitespace(nextPosition)
			|| this.isWithinAlignmentRange(nextPosition)
		) {
			return nextPosition;
		}

		return this.findNextTabStop(pos);
	}

	private isEndOfLine(pos: Position) {
		return pos.character === this.doc.lineAt(pos.line).text.length;
	}

	private isLastLine(pos: Position) {
		return pos.line === this.doc.lineCount - 1;
	}

	private startOfNextLine(pos: Position) {
		const nextLine = this.doc.lineAt(pos.line + 1);
		return pos.with(
			nextLine.lineNumber,
			nextLine.range.start.character
		);
	}

	private peekRight(position: Position, chars: number) {
		return this.doc.getText(new Range(
			position,
			position.with(position.line, position.character + chars)
		));
	}

	private findNextTabStop(pos: Position) {
		let spaces = this.tabSize;
		let nextTabStop = pos.character + spaces;
		const textLine = this.doc.lineAt(pos.line)
		const lineLength = textLine.text.length;
		if (nextTabStop > lineLength) {
			nextTabStop = lineLength;
		} else if (spaces > 1) {
			nextTabStop += (this.tabSize - nextTabStop) % this.tabSize;
		}
		return pos.with(pos.line, nextTabStop);
	}

	public cursorRightSelect() {
		this.editor.selections = this.editor.selections.map(selection => {
			return new Selection(
				selection.anchor,
				this.findNextRightPosition(selection.active)
			);
		}, this);
	}

	public async deleteLeft() {
		for (let selection of this.editor.selections) {
			const start = selection.start;
			if (!selection.isEmpty) {
				await this.delete(selection);
				continue;
			}
			const deleteStartPosition = this.findNextLeftPosition(start);
			if (deleteStartPosition) {
				await this.delete(new Range(deleteStartPosition, start));
			}
		}
		this.editor.revealRange(this.editor.selection);
	}

	private delete(location: Range|Selection) {
		return this.editor.edit(edit => {
			edit.delete(location);
		});
	}

	public async deleteRight() {
		for (let selection of this.editor.selections) {
			const end = selection.end;
			if (!selection.isEmpty) {
				await this.delete(selection);
				continue;
			}
			const deleteEndPosition = this.findNextRightPosition(end);
			if (deleteEndPosition) {
				await this.delete(new Range(end, deleteEndPosition));
			}
		}
	}

}
