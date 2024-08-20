import React, { createElement, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';

// Sample mention items (just names now)
const mentionNames = ['Alice', 'Bob', 'Charlie'];

// Custom mention list component
const MentionList = ({ items, command }) => (
  <div style={styles.mentionList}>
    {items.map((item, index) => (
      <button
        key={index}
        onClick={() => command(item)}
        style={styles.mentionItem}
      >
        {item}
      </button>
    ))}
  </div>
);

// Main Chatsystem component
export const Chatsystem = ({ InputMessage }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      TextStyle, // For bold and italic
      Image.configure({
        inline: true,
      }),
      Mention.configure({
        suggestion: {
          items: ({ query }) =>
            mentionNames.filter(name =>
              name.toLowerCase().includes(query.toLowerCase())
            ),
          render: () => {
            let component;
            let popup;

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                });
              },
              onUpdate: (props) => {
                component.updateProps(props);
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                  popup[0].hide();
                  return true;
                }
                return component.ref.onKeyDown(props);
              },
              onExit: () => {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: InputMessage || '<p>Start typing with @ to mention someone...</p>',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      if (InputMessage && typeof InputMessage.setValue === 'function') {
        InputMessage.setValue(content);
      }
    },
  });

  useEffect(() => {
    if (editor && InputMessage && typeof InputMessage.getValue === 'function') {
      const currentContent = InputMessage.getValue();
      if (currentContent) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [editor, InputMessage]);

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} style={styles.button}>
          <strong>B</strong> {/* Bold Icon */}
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} style={styles.button}>
          <em>I</em> {/* Italic Icon */}
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={styles.button}>
          H1 {/* Heading 1 */}
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={styles.button}>
          H2 {/* Heading 2 */}
        </button>
        <button onClick={() => editor.chain().focus().setLink({ href: 'https://example.com' }).run()} style={styles.button}>
          🔗 {/* Link Icon */}
        </button>
        <button onClick={() => editor.chain().focus().setImage({ src: 'https://via.placeholder.com/150' }).run()} style={styles.button}>
          🖼️ {/* Image Icon */}
        </button>
      </div>
      <EditorContent editor={editor} style={styles.editorContent} />
      <style jsx>{`
        .mention-list {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 150px;
          overflow-y: auto;
          padding: 5px;
        }
        .mention-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 5px;
          border: none;
          background: none;
          cursor: pointer;
        }
        .mention-item:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    maxWidth: '800px',
    margin: 'auto',
  },
  toolbar: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    paddingBottom: '5px',
    marginBottom: '10px',
  },
  button: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px 10px',
    fontSize: '14px',
    marginRight: '5px',
  },
  editorContent: {
    minHeight: '200px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  },
  mentionList: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    maxHeight: '150px',
    overflowY: 'auto',
    padding: '5px',
  },
  mentionItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '5px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  mentionItemHover: {
    backgroundColor: '#f0f0f0',
  },
};
