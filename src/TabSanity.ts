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

export default class TabSanity {

	allSpaces = /^ +$/;

	private get editor() {
		return window.activeTextEditor;
	}

	private get doc() {
		return this.editor.document;
	}

	private get tabSize() {
		return this.editor.options.tabSize;
	}

	public cursorLeft() {
		const { start, isEmpty } = this.editor.selection;
		if (!isEmpty) {
			this.moveToPosition(start);
			return;
		}
		this.moveToPosition(this.findNextLeftPosition(start));
	}

	private moveToPosition(anchor: Position, active = anchor) {
		this.editor.selection = new Selection(anchor, active);
		this.editor.revealRange(new Range(anchor, active));
	}

	private findNextLeftPosition(pos: Position) {
		if (this.isBeginningOfLine(pos)) {
			if (this.isFirstLine(pos)) {
				return pos;
			}
			return this.endOfPreviousLine(pos);
		}

		if (
			this.tabSize <= 1
			|| this.peekLeft(pos, 1) === TAB
			|| !this.isWithinIndentationRange(pos)
		) {
			return this.oneSpaceLeft(pos);
		}

		return this.findPreviousTabStop(pos);
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

	private isWithinIndentationRange(pos: Position) {
		if (isAfterFirstNonWhitespace.call(this)) {
			return false;
		}

		const extraSpaces = pos.character % this.tabSize;
		if (extraSpaces === 0) {
			return true;
		}

		const nextTabStop = this.tabSize - extraSpaces;
		return this.allSpaces.test(
			this.peekRight(pos, nextTabStop)
		);

		function isAfterFirstNonWhitespace() {
			return pos.isAfter(this.findFirstNonWhitespace(pos.line));
		}
	}

	private oneSpaceLeft(pos: Position) {
		return pos.with(pos.line, pos.character - 1);
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

	private findFirstNonWhitespace(lineNumber: number, offset = 0) {
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
		const { end, isEmpty } = this.editor.selection;
		if (!isEmpty) {
			this.moveToPosition(end);
			return;
		}
		this.moveToPosition(this.findNextRightPosition(end));
	}

	private findNextRightPosition(pos: Position) {
		if (this.isEndOfLine(pos)) {
			if (this.isLastLine(pos)) {
				return pos;
			}
			return this.startOfNextLine(pos);
		}

		if (
			this.tabSize <= 1
			|| this.peekRight(pos, 1) === TAB
			|| !this.isWithinIndentationRange(pos)
		) {
			return this.oneSpaceRight(pos);
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

	private oneSpaceRight(pos: Position) {
		return pos.with(pos.line, pos.character + 1);
	}

	private findNextTabStop(pos: Position) {
		const spaces = this.tabSize;
		let nextTabStop = pos.character + spaces;
		const textLine = this.doc.lineAt(pos.line);
		if (nextTabStop > textLine.firstNonWhitespaceCharacterIndex) {
			return this.oneSpaceRight(pos);
		}
		const lineLength = textLine.text.length
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

	public deleteLeft() {
		for (let selection of this.editor.selections) {
			const { start } = selection;
			if (!selection.isEmpty) {
				this.delete(selection);
				continue;
			}
			const deleteStartPosition = this.findNextLeftPosition(start);
			if (deleteStartPosition) {
				this.delete(new Range(deleteStartPosition, start));
			}
		}
	}

	private delete(location: Range|Selection) {
		this.editor.edit(edit => {
			edit.delete(location);
		});
	}

	public deleteRight() {
		for (let selection of this.editor.selections) {
			const { end } = selection;
			if (!selection.isEmpty) {
				this.delete(selection);
				continue;
			}
			const deleteEndPosition = this.findNextRightPosition(end);
			if (deleteEndPosition) {
				this.delete(new Range(end, deleteEndPosition));
			}
		}
	}

}
