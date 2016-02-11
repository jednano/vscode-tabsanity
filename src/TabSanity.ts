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
		this.moveToPosition(this.getPositionLeftOfStart(start));
	}

	private moveToPosition(anchor: Position, active = anchor) {
		this.editor.selection = new Selection(anchor, active);
		this.editor.revealRange(new Range(anchor, active));
	}

	private getPositionLeftOfStart(start: Position) {
		if (start.character === 0) {
			if (start.line === 0) {
				return start;
			}
			const previousLine = this.doc.lineAt(start.line - 1);
			return start.with(
				previousLine.lineNumber,
				previousLine.range.end.character
			);
		}
		if (this.peekLeft(1) === TAB) {
			return start.with(start.line, start.character - 1);
		}
		const firstNonWhite = this.getFirstNonWhitespacePosition(start.line);
		if (start.isAfter(firstNonWhite)) {
			return start.with(start.line, start.character - 1);
		}
		if (start.character % this.tabSize) {
			return start.with(start.line, start.character - 1);
		}
		let spaces = this.tabSize;
		let character = start.character - spaces;
		if (spaces > 1) {
			character += (this.tabSize - character) % this.tabSize;
		}
		return start.with(start.line, character);
	}

	private peekLeft(chars: number) {
		const { start } = this.editor.selection;
		return this.doc.getText(
			new Range(
				start.with(start.line, start.character - chars),
				start
			)
		);
	}

	private getFirstNonWhitespacePosition(lineNumber: number, offset = 0) {
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
				this.getPositionLeftOfStart(selection.active)
			);
		});
	}

	public cursorRight() {
		const { end, isEmpty } = this.editor.selection;
		if (!isEmpty) {
			this.moveToPosition(end);
			return;
		}
		this.moveToPosition(this.getPositionRightOfEnd(end));
	}

	private getPositionRightOfEnd(end: Position) {
		const lineLength = this.doc.lineAt(end.line).text.length;
		if (end.character === lineLength) {
			if (end.line === (this.doc.lineCount - 1)) {
				return end;
			}
			const nextLine = this.doc.lineAt(end.line + 1);
			return end.with(
				nextLine.lineNumber,
				nextLine.range.start.character
			);
		}
		if (this.peekRight(1) === TAB) {
			return end.with(end.line, end.character + 1);
		}
		const firstNonWhite = this.getFirstNonWhitespacePosition(end.line, -1);
		if (!end.isBefore(firstNonWhite)) {
			return end.with(end.line, end.character + 1);
		}
		let spaces = this.tabSize;
		let character = end.character + spaces;
		const endLine = this.doc.lineAt(end.line);
		if (character > endLine.firstNonWhitespaceCharacterIndex) {
			return end.with(end.line, end.character + 1);
		}
		if (character > lineLength) {
			character = lineLength;
		} else if (spaces > 1) {
			character += (this.tabSize - character) % this.tabSize;
		}
		return end.with(end.line, character);
	}

	private peekRight(chars: number) {
		const { end } = this.editor.selection;
		return this.doc.getText(
			new Range(
				end,
				end.with(end.line, end.character + chars)
			)
		);
	}

	public cursorRightSelect() {
		this.editor.selections = this.editor.selections.map(selection => {
			return new Selection(
				selection.anchor,
				this.getPositionRightOfEnd(selection.active)
			);
		});
	}

	public deleteLeft() {
		for (let selection of this.editor.selections) {
			const { start } = selection;
			if (!selection.isEmpty) {
				this.delete(selection);
				continue;
			}
			const deleteStartPosition = this.getPositionLeftOfStart(start);
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
			const deleteEndPosition = this.getPositionRightOfEnd(end);
			if (deleteEndPosition) {
				this.delete(new Range(end, deleteEndPosition));
			}
		}
	}

}
