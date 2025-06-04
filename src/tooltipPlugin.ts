import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export function tooltipPlugin() {
    return new Plugin({
        props: {
            decorations(state) {
                const { from, to } = state.selection;
                if (from === to) return null;

                const tooltip = document.createElement("div");
                tooltip.className = "tooltip";
                tooltip.textContent = state.doc.textBetween(from, to, " ");

                return DecorationSet.create(state.doc, [
                    Decoration.widget(to, () => tooltip, { side: -1 })
                ]);
            }
        }
    });
}
