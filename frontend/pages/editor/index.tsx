import React, {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";

import {
  schema,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";

import { exampleSetup } from "prosemirror-example-setup";

import { Content, Title } from "../../ui/components";
// import { useWhyDidYouUpdate } from "../utils/hooks.ts";

import "prosemirror-view/style/prosemirror.css";
import "prosemirror-example-setup/style/style.css";

import "./styles.css";

type EditorType = "wysiwyg" | "markdown";

class MarkdownView {
  private div: HTMLDivElement;
  constructor(
    target: { appendChild: (arg0: HTMLDivElement) => HTMLDivElement },
    content: string,
  ) {
    this.div = target.appendChild(document.createElement("div"));
    // this.div.contentEditable = "true";
    // this.div.ariaDisabled = "true";
    this.div.classList.add("markdown-textarea");
    this.div.textContent = content;
  }

  get content(): string | null {
    return this.div.textContent;
  }

  set content(content: string) {
    this.div.textContent = content;
  }

  focus() {
    this.div.focus();
  }

  destroy() {
    this.div.remove();
  }
}

class ProseMirrorView {
  private view: EditorView;
  constructor(
    target:
      | Node
      | ((editor: HTMLElement) => void)
      | { mount: HTMLElement }
      | null,
    content: string,
  ) {
    this.view = new EditorView(target, {
      state: EditorState.create({
        doc: defaultMarkdownParser.parse(content),
        plugins: exampleSetup({ schema }),
      }),
      handleDOMEvents: {
        change: (view, event) => {
          console.log("change", view, event);
        },
      },
    });
  }

  get content(): string {
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }

  set content(content: string) {
    this.view.state.doc = defaultMarkdownParser.parse(content);
  }

  focus() {
    this.view.focus();
  }
  destroy() {
    this.view.destroy();
  }
}

const Editor: FC = () => {
  const [editorType, setEditorType] = useState<EditorType>("wysiwyg");
  const editorRef = useRef<MarkdownView | ProseMirrorView | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!import.meta.env?.SSR) {
      const savedEditorType = localStorage.getItem("editorType") || "wysiwyg";
      setEditorType(savedEditorType as EditorType);
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env?.SSR) {
      let view: MarkdownView | ProseMirrorView;
      let editorPlace = document.querySelector("#editor");
      if (editorPlace) {
        const savedContent = localStorage.getItem("content");
        let currentContent = savedContent ? JSON.parse(savedContent) : "";
        if (editorRef.current) {
          currentContent = editorRef.current.content || "";
          editorRef.current.destroy();
        }
        if (editorType === "wysiwyg") {
          view = new ProseMirrorView(editorPlace, currentContent);
        } else {
          view = new MarkdownView(editorPlace, currentContent);
        }

        editorRef.current = view;

        view.focus();
      }
    }
  }, [editorType]);

  const handleEditorTypeChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEditorType(e.target.value as EditorType);
      localStorage.setItem("editorType", e.target.value);
    },
    [],
  );

  return (
    <>
      <Title>Editor</Title>
      <Content>
        <div className="editor-types">
          <label>
            WYSIWYG
            <input
              id="wysiwyg"
              type="radio"
              value="wysiwyg"
              checked={editorType === "wysiwyg"}
              onChange={handleEditorTypeChanged}
            />
          </label>
          <label>
            Markdown (View only)
            <input
              id="markdown"
              type="radio"
              value="markdown"
              checked={editorType === "markdown"}
              onChange={handleEditorTypeChanged}
            />
          </label>
        </div>
        <div id="editor" />
        <div id="content" />
        <div className="editor-actions">
          <button
            onClick={() => {
              localStorage.setItem(
                "content",
                JSON.stringify(editorRef.current?.content),
              );
            }}
          >
            Save
          </button>
          <button
            onClick={() => localStorage.setItem("content", JSON.stringify(""))}
          >
            Clear
          </button>
        </div>
      </Content>
    </>
  );
};

export default memo(Editor);
