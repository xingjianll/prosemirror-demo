import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

const lintPluginKey = new PluginKey("lintPlugin");

function lintDeco(doc: any, issues: any[]): DecorationSet {
    const decorations: Decoration[] = [];

    for (const issue of issues) {
        decorations.push(
            Decoration.inline(
                issue.from,
                issue.to,
                {
                    class: "lint-issue",
                    title: issue.message,
                },
                { nodeName: "span" }
            )
        );

        decorations.push(
            Decoration.widget(issue.to, () => {
                const icon = document.createElement("span");
                icon.className = "lint-icon";
                icon.title = issue.message; // native browser tooltip on icon
                (icon as any).problem = issue;
                icon.textContent = "⚠";
                return icon;
            }, { key: issue.message })
        );
    }

    return DecorationSet.create(doc, decorations);
}


export const lintPlugin = new Plugin({
    key: lintPluginKey,
    state: {
        init(_, { doc }) {
            return DecorationSet.empty;
        },
        apply(tr, oldDecos, oldState, newState) {
            const meta = tr.getMeta(lintPluginKey) as DecorationSet | undefined;
            if (meta) {
                return meta;
            }
            if (tr.docChanged) {
                return oldDecos.map(tr.mapping, newState.doc);
            }
            return oldDecos;
        }
    },
    props: {
        decorations(state) {
            return this.getState(state);
        },
        handleClick(view: EditorView, _, event) {
            const el = event.target as HTMLElement;
            if (el.classList.contains("lint-icon") && (el as any).problem) {
                const { from, to } = (el as any).problem;
                view.dispatch(
                    view.state.tr
                        .setSelection(TextSelection.create(view.state.doc, from, to))
                        .scrollIntoView()
                );
                return true;
            }
            return false;
        }
    },
    view(editorView) {
        let timeout: number | null = null;

        function lint() {
            const text = editorView.state.doc.textContent;

            fetch("http://localhost:8000/lint", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: text }),
            })
                .then((res) => res.json())
                .then((issues) => {
                    const decos = lintDeco(editorView.state.doc, issues);
                    // Here we put the new DecorationSet into the transaction metadata:
                    editorView.dispatch(
                        editorView.state.tr.setMeta(lintPluginKey, decos)
                    );
                })
                .catch((err) => {
                    console.error("Linting error:", err);
                });
        }

        return {
            update() {
                if (timeout) clearTimeout(timeout);
                timeout = window.setTimeout(lint, 500);
            }
        };
    }
});

