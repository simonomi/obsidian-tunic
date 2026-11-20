import { Plugin } from 'obsidian';
import { RangeSetBuilder } from "@codemirror/state"
import { ViewPlugin, WidgetType, EditorView, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view'

const svgNamespaceURI = "http://www.w3.org/2000/svg"

const tunicWritingRegex = /^([| ]?)([/\\< ]?)([,|]?)([/\\>]?)-([| ]?)([/\\< ]?)(\|?)([/\\>]?)(\.?)$/;
const globalTunicWritingRegex = /`(([| ]?[/\\< ]?[,|]?[/\\>]?-[| ]?[/\\< ]?\|?[/\\>]?\.?\+?)+)`/g;

function makeLine(parent: Element, x1: number, y1: number, x2: number, y2: number) {
	const line = document.createElementNS(svgNamespaceURI, "line");
	line.setAttribute("x1", x1.toString());
	line.setAttribute("y1", y1.toString());
	line.setAttribute("x2", x2.toString());
	line.setAttribute("y2", y2.toString());
	parent.appendChild(line);
}

function tunicWriting(text: string): HTMLElement {
	const words = text.split("+");
	
	const characters = document.createElement("span");
	characters.addClass("tunic");
	
	for (const word of words) {
		const writingMatch = word.match(tunicWritingRegex);
		
		if (!writingMatch) { return undefined; }
		
		const character = document.createElementNS(svgNamespaceURI, "svg");
		character.setAttribute("width", "1em");
		character.setAttribute("viewBox", "-5 -5 110 230");
		
		const group = document.createElementNS(character.namespaceURI, "g");
		group.setAttribute("stroke", "var(--text-normal)");
		group.setAttribute("stroke-width", "10");
		character.appendChild(group);
		
		makeLine(group, -5, 100, 105, 100);
		
		if (writingMatch[1] == "|") {
			makeLine(group, 0, 33, 0, 100);
		}
		
		if (writingMatch[2] == "/" || writingMatch[2] == "<") {
			makeLine(group, -5, 33, 50, 0);
		}
		if (writingMatch[2] == "\\" || writingMatch[2] == "<") {
			makeLine(group, -5, 33, 50, 66);
		}
		
		if (writingMatch[3] == ",") {
			makeLine(group, 50, 66, 50, 100);
		} else if (writingMatch[3] == "|") {
			makeLine(group, 50, 0, 50, 100);
		}
		
		if (writingMatch[4] == "/" || writingMatch[4] == ">") {
			makeLine(group, 50, 66, 105, 33);
		}
		if (writingMatch[4] == "\\" || writingMatch[4] == ">") {
			makeLine(group, 50, 0, 105, 33);
		}
		
		if (writingMatch[5] == "|") {
			makeLine(group, 0, 133, 0, 166);
		}
		
		if (writingMatch[6] == "/" || writingMatch[6] == "<") {
			makeLine(group, -5, 166, 50, 133);
		}
		if (writingMatch[6] == "\\" || writingMatch[6] == "<") {
			makeLine(group, -5, 166, 50, 200);
		}
		
		if (writingMatch[7] == "|") {
			makeLine(group, 50, 133, 50, 200);
		}
		
		if (writingMatch[8] == "/" || writingMatch[8] == ">") {
			makeLine(group, 50, 200, 105, 166);
		}
		if (writingMatch[8] == "\\" || writingMatch[8] == ">") {
			makeLine(group, 50, 133, 105, 166);
		}
		
		if (writingMatch[9] == ".") {
			const circle = document.createElementNS(svgNamespaceURI, "circle");
			circle.setAttribute("cx", "50");
			circle.setAttribute("cy", "200");
			circle.setAttribute("r", "10");
			group.appendChild(circle);
		}
		
		characters.appendChild(character);
	}
	
	return characters;
}

export default class TunicPlugin extends Plugin {
	async onload () {
		this.registerEditorExtension(viewPlugin);
		this.registerMarkdownPostProcessor((element, _) => {
			const codeBlocks = element.findAll("code");
			
		codeBlockLoop:
			for (const codeBlock of codeBlocks) {
				const characters = tunicWriting(codeBlock.textContent);
				
				if (characters) {
					codeBlock.replaceWith(characters);
				}
			}
		})
	}
	
	onunload () {}
}

class TunicWidget extends WidgetType {
	constructor(readonly codeBlock: string) {
		super()
	}
	
	toDOM(_: EditorView): HTMLElement {
		return tunicWriting(this.codeBlock);
	}
}

const viewPlugin = ViewPlugin.fromClass(class {
	decorations: DecorationSet;
	
	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}
	
	update(update: ViewUpdate) {
		if (
			update.docChanged ||
			update.viewportChanged ||
			update.selectionSet
		) {
			this.decorations = this.buildDecorations(update.view);
		}
	}
	
	destroy() { }
	
	buildDecorations(view: EditorView): DecorationSet {
		let builder = new RangeSetBuilder<Decoration>();
		let lines: number[] = [];
		if (view.state.doc.length > 0) {
			lines = Array.from(
				{ length: view.state.doc.lines },
				(_, i) => i + 1,
			);
		}
		
		const currentSelections = [...view.state.selection.ranges];
		
		for (let n of lines) {
			const line = view.state.doc.line(n);
			
			let matches = Array.from(line.text.matchAll(globalTunicWritingRegex))
			for (const match of matches) {
				const from = match.index != undefined ? match.index + line.from : -1
				const to = from + match[0].length
				
				let add = true
				currentSelections.forEach((r) => {
					if (r.to >= from && r.from <= to) {
						add = false
					}
				})
				
				if (add) {
					builder.add(from, to, Decoration.widget({ widget: new TunicWidget(match[1]) }))
				}
			}
		}
		return builder.finish();
	}
}, {
	decorations: (v) => v.decorations,
})
