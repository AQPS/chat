import React, { createElement,useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { ReactRenderer } from '@tiptap/react';
import { MentionList } from './components/MentionList';
import tippy from 'tippy.js';
import './Chatsystem.css'; // Import the CSS file
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
 
 
// Custom mention list component
// const MentionList = ({ editor, command }) => (
//   <div className="mention-list">
//     {editor.options.editorProps.items.map((item, index) =>
//           <button
//             key={index}
//             onClick={() => command({id: item})}
//             className="mention-item"
//           >
//             {item}
//           </button>
//     )}
//   </div>
// )
   
 
 
// Main Chatsystem component
export const Chatsystem = ({ InputMessage, MentionJson, IdentityList, MentionName }) => {
  const [ready, setReady] = useState(false)
  const [ mentions, setMentions ] = useState([])

  useEffect (() => {
    if (IdentityList.status === "available") {
      const toMention = []
      const itemsLength = IdentityList.items.length
      for (let i = 0; i < itemsLength; i++){
        const fullname = MentionName.get(IdentityList.items[i]).value
        const identityId = IdentityList.items[i].id

        if (fullname) {
          toMention.push({fullname, identityId})
        } 
      }
      setMentions(toMention)
      setReady(true)
    }
  },[IdentityList])

  return (
    <div>
    {ready && <Chat InputMessage={InputMessage} Mentions={mentions} /> }
    </div>
  )
}

const Chat = ({ InputMessage, Mentions }) => {
  const [editor, setEditor] = useState(null);
  // Initialize editor  
  const editorInstance = useEditor({
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
        renderHTML ({ node }) {
          return [
            "span",
            {
              class: "mention",
              id: node.attrs.id,
              label: node.attrs.label
            },
            `@${node.attrs.label}`
          ]
        },
        suggestion: {
          items: ({ query }) => {
            return Mentions.filter(name =>
              name.fullname.toLowerCase().includes(query.toLowerCase())
            )
          },
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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
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
    if (editorInstance) {
      setEditor(editorInstance);
      if (InputMessage && typeof InputMessage.getValue === 'function') {
        const currentContent = InputMessage.getValue();
        if (currentContent) {
          editorInstance.commands.setContent(currentContent);
        }
      }
    }  
  }, [InputMessage, editorInstance]);
 
  return (
    <div className="container">
      <div className="toolbar">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="button">
          <strong>B</strong> {/* Bold Icon */}
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="button">
          <em>I</em> {/* Italic Icon */}
        </button>
        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className="button">
      <u>U</u> {/* Underline Icon */}
    </button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className="button">
          H1 {/* Heading 1 */}
        </button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="button">
          H2 {/* Heading 2 */}
        </button>
        <button onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} className="button">
          ➕ Table
        </button>

      </div>
      <EditorContent editor={editor} className="editorContent" />
    </div>
  );
};