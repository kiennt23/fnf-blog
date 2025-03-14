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
  private readonly div: HTMLDivElement;
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
    return this.div?.textContent;
  }

  set content(content: string) {
    if (this.div) {
      this.div.textContent = content;
    }
  }

  focus() {
    this.div.focus();
  }

  destroy() {
    this.div.remove();
  }

  clear() {
    this.content = "";
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
    });
  }

  get content(): string {
    return defaultMarkdownSerializer.serialize(this.view?.state.doc);
  }

  set content(content: string) {
    if (this.view?.state) {
      this.view.state.doc = defaultMarkdownParser.parse(content);
    }
  }

  focus() {
    this.view.focus();
  }

  destroy() {
    this.view.destroy();
  }

  clear() {
    if (this.view) {
      this.view.updateState(
        EditorState.create({
          doc: defaultMarkdownParser.parse(""),
          plugins: [...this.view.state.plugins],
        }),
      );
    }
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
      const savedContent = localStorage.getItem("content");
      let currentContent = "";
      try {
        currentContent = savedContent ? JSON.parse(savedContent) : "";
      } catch (error) {
        console.error("Failed to parse saved content:", error);
      }
      let editorPlace = document.querySelector("#editor");
      if (editorPlace) {
        if (editorRef.current) {
          currentContent = editorRef.current.content || "";
          editorRef.current.destroy();
          editorRef.current = undefined;
        }

        let view: MarkdownView | ProseMirrorView;
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
      try {
        localStorage.setItem("editorType", e.target.value);
      } catch (error) {
        console.error("Failed to save editor type:", error);
      }
    },
    [],
  );

  return (
    <>
      <Title>Editor</Title>
      <Content>
        <div className="editor-actions">
          <div className="editor-left-actions">
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
          <div className="editor-right-actions">
            <button
              onClick={() => {
                try {
                  localStorage.setItem(
                    "content",
                    JSON.stringify(editorRef.current?.content),
                  );
                } catch (error) {
                  console.error("Failed to save content:", error);
                }
              }}
            >
              Save Draft
            </button>
            <button
              onClick={() => {
                try {
                  editorRef.current?.clear();
                  localStorage.setItem("content", JSON.stringify(""));
                } catch (error) {
                  console.error("Failed to clear content:", error);
                }
              }}
            >
              Clear Draft
            </button>
            <button
              onClick={async () => {
                const currentContent = editorRef.current?.content;
                try {
                  const res = await fetch("api/editor/save", {
                    method: "POST",
                    body: JSON.stringify({ content: currentContent }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (!res.ok) {
                    throw new Error(
                      `API request failed with status ${res.status}`,
                    );
                  }
                  const data = await res.json();
                  console.log(data);
                } catch (error) {
                  console.error("Failed to save content:", error);
                }
              }}
            >
              Save!
            </button>
          </div>
        </div>
        <div id="editor" />
      </Content>
    </>
  );
};

export default memo(Editor);
