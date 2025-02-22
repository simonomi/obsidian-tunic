import { Plugin } from 'obsidian';

const svgNamespaceURI = "http://www.w3.org/2000/svg"

const tunicWritingRegex = /^(\|?)([/\\<]?)([.|]?)([/\\>]?)-(\|?)([/\\<]?)(\|?)([/\\>]?)(\.?)$/;

function makeLine(parent: Element, x1: number, y1: number, x2: number, y2: number) {
	const line = document.createElementNS(svgNamespaceURI, "line");
	line.setAttribute("x1", x1.toString());
	line.setAttribute("y1", y1.toString());
	line.setAttribute("x2", x2.toString());
	line.setAttribute("y2", y2.toString());
	parent.appendChild(line);
}

export default class TunicPlugin extends Plugin {
	async onload () {
		this.registerMarkdownPostProcessor((element, context) => {
			const codeBlocks = element.findAll("code");
			
			for (const codeBlock of codeBlocks) {
				const writingMatch = codeBlock.textContent.match(tunicWritingRegex);
				
				if (writingMatch) {
					const character = document.createElementNS(svgNamespaceURI, "svg");
					character.setAttribute("width", "1em");
					character.setAttribute("viewBox", "-10 -10 120 230");
					
					const group = document.createElementNS(character.namespaceURI, "g");
					group.setAttribute("stroke", "var(--text-normal)");
					group.setAttribute("stroke-width", "10");
					character.appendChild(group);
					
					makeLine(group, 0, 100, 100, 100);
					
					if (writingMatch[1] == "|") {
						makeLine(group, 0, 33, 0, 100);
					}
					
					if (writingMatch[2] == "/" || writingMatch[2] == "<") {
						makeLine(group, 0, 33, 50, 0);
					}
					if (writingMatch[2] == "\\" || writingMatch[2] == "<") {
						makeLine(group, 0, 33, 50, 66);
					}
					
					if (writingMatch[3] == ".") {
						makeLine(group, 50, 66, 50, 100);
					} else if (writingMatch[3] == "|") {
						makeLine(group, 50, 0, 50, 100);
					}
					
					if (writingMatch[4] == "/" || writingMatch[4] == ">") {
						makeLine(group, 50, 66, 100, 33);
					}
					if (writingMatch[4] == "\\" || writingMatch[4] == ">") {
						makeLine(group, 50, 0, 100, 33);
					}
					
					if (writingMatch[5] == "|") {
						makeLine(group, 0, 133, 0, 166);
					}
					
					if (writingMatch[6] == "/" || writingMatch[6] == "<") {
						makeLine(group, 0, 166, 50, 133);
					}
					if (writingMatch[6] == "\\" || writingMatch[6] == "<") {
						makeLine(group, 0, 166, 50, 200);
					}
					
					if (writingMatch[7] == "|") {
						makeLine(group, 50, 133, 50, 200);
					}
					
					if (writingMatch[8] == "/" || writingMatch[8] == ">") {
						makeLine(group, 50, 133, 100, 166);
					}
					if (writingMatch[8] == "\\" || writingMatch[8] == ">") {
						makeLine(group, 50, 200, 100, 166);
					}
					
					if (writingMatch[9] == ".") {
						const circle = document.createElementNS(svgNamespaceURI, "circle");
						circle.setAttribute("cx", "50");
						circle.setAttribute("cy", "200");
						circle.setAttribute("r", "10");
						group.appendChild(circle);
					}
					
					codeBlock.replaceWith(character);
				}
			}
		})
	}
	
	onunload () {}
}
