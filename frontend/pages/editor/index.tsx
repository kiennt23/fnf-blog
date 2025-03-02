import React, { FC, memo, useEffect, useRef, useState } from "react";

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

  get content() {
    return this.div.textContent;
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
    });
  }

  get content() {
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }
  focus() {
    this.view.focus();
  }
  destroy() {
    this.view.destroy();
  }
}

const Editor: FC = () => {
  const [editorType, setEditorType] = useState("wysiwyg");
  const editorRef = useRef<MarkdownView | ProseMirrorView | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!import.meta.env?.SSR) {
      let view: MarkdownView | ProseMirrorView;
      let editorPlace = document.querySelector("#editor");
      if (editorPlace) {
        let currentContent = "";
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
              onChange={(e) => setEditorType(e.target.value)}
            />
          </label>
          <label>
            Markdown (View only)
            <input
              id="markdown"
              type="radio"
              value="markdown"
              checked={editorType === "markdown"}
              onChange={(e) => setEditorType(e.target.value)}
            />
          </label>
        </div>
        <div id="editor" />
        <div id="content" />
      </Content>
    </>
  );
};

export default memo(Editor);
