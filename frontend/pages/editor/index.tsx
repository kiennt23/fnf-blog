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
  private textarea: HTMLTextAreaElement;
  constructor(
    target: { appendChild: (arg0: HTMLTextAreaElement) => HTMLTextAreaElement },
    content: string,
  ) {
    this.textarea = target.appendChild(document.createElement("textarea"));
    this.textarea.classList.add("markdown-textarea");
    this.textarea.value = content;
  }

  get content() {
    return this.textarea.value;
  }
  focus() {
    this.textarea.focus();
  }
  destroy() {
    this.textarea.remove();
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
      if (editorRef.current) {
        editorRef.current.destroy();
      }
      let view: MarkdownView | ProseMirrorView;
      let editorPlace = document.querySelector("#editor");
      let contentPlace = document.querySelector("#content");
      if (editorPlace && contentPlace) {
        if (editorType === "wysiwyg") {
          view = new ProseMirrorView(
            editorPlace,
            contentPlace?.textContent || "",
          );
        } else {
          view = new MarkdownView(editorPlace, contentPlace?.textContent || "");
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
        <div id="editor" />
        <div id="content" />
        <label htmlFor="wysiwyg">WYSIWYG</label>
        <input
          id="wysiwyg"
          type="radio"
          value="wysiwyg"
          checked={editorType === "wysiwyg"}
          onChange={(e) => setEditorType(e.target.value)}
        />
        <label htmlFor="markdown">Markdown</label>
        <input
          id="markdown"
          type="radio"
          value="markdown"
          checked={editorType === "markdown"}
          onChange={(e) => setEditorType(e.target.value)}
        />
      </Content>
    </>
  );
};

export default memo(Editor);
