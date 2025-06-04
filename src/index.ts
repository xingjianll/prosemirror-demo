import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup } from "prosemirror-example-setup";

// css
import "prosemirror-view/style/prosemirror.css";
import "prosemirror-menu/style/menu.css";
import "prosemirror-example-setup/style/style.css";
import "./tooltip.css";
import "./lint.css";

// plugin
import { tooltipPlugin } from "./tooltipPlugin";
import { lintPlugin } from "./lintPlugin";

const editorElement = document.querySelector("#editor");

if (editorElement) {
    const state = EditorState.create({
        schema,
        plugins: [
            ...exampleSetup({ schema }),
            tooltipPlugin(),
            lintPlugin,
        ]
    });

    new EditorView(editorElement, { state });
}
