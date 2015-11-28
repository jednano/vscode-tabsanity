import {
	Position,
	Range,
	Selection,
	TextDocument,
	TextEditor,
	window
} from 'vscode';

const TAB = '\t';

export default class TabSanity {

	public editor: TextEditor;
	public tabSize: number;

	private get doc() {
		return this.editor.document;
	}

	public cursorLeft() {
		const { start } = this.editor.selection;
		if (!this.editor.selection.isEmpty) {
			this.moveToPosition(start);
			return;
		}
		if (start.isAfter(this.firstNonWhitespaceCharacterPosition(start.line))) {
			this.moveLeft(1);
			return;
		}
		if (this.peekLeft(1) === TAB) {
			this.moveLeft(1);
			return;
		}
		this.moveLeft(this.tabSize);
	}

	private firstNonWhitespaceCharacterPosition(line: number, offset = 0) {
		return new Position(
			line,
			this.doc.lineAt(line).firstNonWhitespaceCharacterIndex + offset
		);
	}

	private moveLeft(spaces: number) {
		const { start } = this.editor.selection;
		const character = (start.character < spaces)
			? 0
			: start.character - spaces;
		this.moveToPosition(start.with(start.line, character));
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

	private moveToPosition(anchor: Position, active = anchor) {
		this.editor.selection = new Selection(anchor, active);
		this.editor.revealRange(new Range(anchor, active));
	}

	public cursorLeftSelect() {
	}

	public cursorRight() {
		const { end } = this.editor.selection;
		if (!this.editor.selection.isEmpty) {
			this.moveToPosition(end);
			return;
		}
		if (end.isAfter(this.firstNonWhitespaceCharacterPosition(end.line, -1))) {
			this.moveRight(1);
			return;
		}
		if (this.peekRight(1) === TAB) {
			this.moveRight(1);
			return;
		}
		this.moveRight(this.tabSize);
	}

	private moveRight(spaces: number) {
		const { end } = this.editor.selection;
		let character = end.character + spaces;
		const lineLength = this.doc.lineAt(end.line).text.length;
		if (character > lineLength) {
			character = lineLength;
		}
		this.moveToPosition(end.with(end.line, character));
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
	}

	public deleteLeft() {
	}

	public deleteRight() {
	}

}
