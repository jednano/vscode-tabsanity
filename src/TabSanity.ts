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
		if (pos.character === 0) {
			if (pos.line === 0) {
				return pos;
			}
			const previousLine = this.doc.lineAt(pos.line - 1);
			return pos.with(
				previousLine.lineNumber,
				previousLine.range.end.character
			);
		}
		if (this.peekLeft(pos, 1) === TAB) {
			return pos.with(pos.line, pos.character - 1);
		}
		const firstNonWhitespace = this.findFirstNonWhitespace(pos.line);
		if (pos.isAfter(firstNonWhitespace)) {
			return pos.with(pos.line, pos.character - 1);
		}
		if (pos.character % this.tabSize) {
			return pos.with(pos.line, pos.character - 1);
		}
		let spaces = this.tabSize;
		let character = pos.character - spaces;
		if (spaces > 1) {
			character += (this.tabSize - character) % this.tabSize;
		}
		return pos.with(pos.line, character);
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
		const lineLength = this.doc.lineAt(pos.line).text.length;
		if (pos.character === lineLength) {
			if (pos.line === (this.doc.lineCount - 1)) {
				return pos;
			}
			const nextLine = this.doc.lineAt(pos.line + 1);
			return pos.with(
				nextLine.lineNumber,
				nextLine.range.start.character
			);
		}
		if (this.peekRight(pos, 1) === TAB) {
			return pos.with(pos.line, pos.character + 1);
		}
		const firstNonWhitespace = this.findFirstNonWhitespace(pos.line, -1);
		if (!pos.isBefore(firstNonWhitespace)) {
			return pos.with(pos.line, pos.character + 1);
		}
		let spaces = this.tabSize;
		let character = pos.character + spaces;
		const posLine = this.doc.lineAt(pos.line);
		if (character > posLine.firstNonWhitespaceCharacterIndex) {
			return pos.with(pos.line, pos.character + 1);
		}
		if (character > lineLength) {
			character = lineLength;
		} else if (spaces > 1) {
			character += (this.tabSize - character) % this.tabSize;
		}
		return pos.with(pos.line, character);
	}

	private peekRight(position: Position, chars: number) {
		return this.doc.getText(new Range(
			position,
			position.with(position.line, position.character + chars)
		));
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
