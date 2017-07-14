'use strict';

import {
	commands,
	Position,
	Range,
	Selection,
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
		const tabSize = this.editor.options.tabSize;
		return (tabSize === 'auto') ? 4 : tabSize as number;
	}

	public async cursorUp() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'up',
				by: 'wrappedLine'
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			const newPos = (sel.start.line === 0)
				? sel.start.with(0, 0)
				: this.findTabStopPositionIfWithinLeadingWhitespace(
					sel.start.with(sel.start.line - 1)
				);
			return new Selection(newPos, newPos);
		}));
	}

	public async cursorUpSelect() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'up',
				by: 'wrappedLine',
				select: true
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			const newActivePos = (sel.start.line === 0)
				? sel.start.with(0, 0)
				: this.findTabStopPositionIfWithinLeadingWhitespace(
					sel.active.with(sel.active.line - 1)
				);
			return new Selection(sel.anchor, newActivePos);
		}));
	}

	public async cursorDown() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'down',
				by: 'wrappedLine'
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			const newPos = (sel.end.line + 1 === this.doc.lineCount)
				? sel.end.with(sel.end.line, this.lastCharacter(sel.end))
				: this.findTabStopPositionIfWithinLeadingWhitespace(
					sel.end.with(sel.end.line + 1)
				);
			return new Selection(newPos, newPos);
		}));
	}

	private lastCharacter(pos: Position) {
		const line = this.doc.lineAt(pos);
		return line.range.end.character;
	}

	public async cursorDownSelect() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'down',
				by: 'wrappedLine',
				select: true
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			const newActivePos = (sel.end.line + 1 === this.doc.lineCount)
				? sel.end.with(sel.end.line, this.lastCharacter(sel.end))
				: this.findTabStopPositionIfWithinLeadingWhitespace(
					sel.active.with(sel.active.line + 1)
				);
			return new Selection(sel.anchor, newActivePos);
		}));
	}

	private findTabStopPositionIfWithinLeadingWhitespace(pos: Position) {
		if (this.isWithinLeadingWhitespace(pos)) {
			const remainder = pos.character % this.tabSize;
			const offset = (remainder / this.tabSize > .5)
				? remainder - this.tabSize
				: remainder;
			pos = pos.with(pos.line, pos.character - offset);
		}
		return pos;
	}

	public async cursorLeft() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'left',
				by: 'character'
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			const start = (sel.isEmpty)
				? this.findNextLeftPosition(sel.start)
				: sel.start;
			return new Selection(start, start);
		}));
	}

	private findNextLeftPosition(pos: Position) {
		if (this.isBeginningOfLine(pos)) {
			return (this.isFirstLine(pos)) ? pos : this.endOfPreviousLine(pos);
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

	private assignSelections(selections: Selection[]) {
		const editor = this.editor;
		editor.selections = selections;
		editor.revealRange(editor.selections.slice(-1)[0]);
		return selections;
	}

	public async cursorLeftSelect() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'left',
				by: 'character',
				select: true
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			return new Selection(
				sel.anchor,
				this.findNextLeftPosition(sel.active)
			);
		}, this));
	}

	public cursorHomeSelect() {
		return this.assignSelections(this.editor.selections.map(sel => {
			let newStart = this.findFirstNonWhitespace(sel.start.line);
			return new Selection(
				sel.anchor,
				fallbackToStartOfLine(sel.start, newStart)
			);
		}, this));

		function fallbackToStartOfLine(start: Position, newStart: Position) {
			return (start.isEqual(newStart)
				? new Position(start.line, 0)
				: newStart);
		}
	}

	public async cursorRight() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'right',
				by: 'character'
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			const end = (sel.isEmpty)
				? this.findNextRightPosition(sel.end)
				: sel.end;
			return new Selection(end, end);
		}));
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
		const textLine = this.doc.lineAt(pos.line);
		const lineLength = textLine.text.length;
		if (nextTabStop > lineLength) {
			nextTabStop = lineLength;
		} else if (spaces > 1) {
			nextTabStop += (this.tabSize - nextTabStop) % this.tabSize;
		}
		return pos.with(pos.line, nextTabStop);
	}

	public async cursorRightSelect() {
		if (!this.editor.options.insertSpaces) {
			return await commands.executeCommand('cursorMove', {
				to: 'right',
				by: 'character',
				select: true
			});
		}
		return this.assignSelections(this.editor.selections.map(sel => {
			return new Selection(
				sel.anchor,
				this.findNextRightPosition(sel.active)
			);
		}, this));
	}

	public cursorEndSelect() {
		return this.assignSelections(this.editor.selections.map(sel => {
			const endLine = this.doc.lineAt(sel.end.line);
			return new Selection(
				sel.anchor,
				new Position(sel.end.line, endLine.text.length)
			);
		}, this));
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
