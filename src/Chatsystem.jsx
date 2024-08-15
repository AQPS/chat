import { createElement, useState, useEffect } from "react";
import { Editor, EditorState, ContentState, Modifier, SelectionState, RichUtils, convertToRaw } from "draft-js";
import 'draft-js/dist/Draft.css';

export const Chatsystem = (props) => {
    const { InputMessage } = props;
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        if (InputMessage && typeof InputMessage.value === 'string') {
            const messageText = InputMessage.value;

            // Convert plain text URLs to HTML links
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const linkifiedText = messageText.replace(urlRegex, (url) => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">${url}</a>`;
            });

            setDisplayText(linkifiedText);

            if (messageText.trim() !== "") {
                try {
                    const contentState = ContentState.createFromText(messageText);
                    let newEditorState = EditorState.createWithContent(contentState);

                    // Set cursor position to the end of the text
                    const lastBlockKey = contentState.getLastBlock().getKey();
                    const selectionState = SelectionState.createEmpty(lastBlockKey).merge({
                        anchorOffset: contentState.getLastBlock().getLength(),
                        focusOffset: contentState.getLastBlock().getLength(),
                    });
                    newEditorState = EditorState.forceSelection(newEditorState, selectionState);
                    
                    setEditorState(newEditorState);
                } catch (error) {
                    console.error("Error creating ContentState:", error);
                }
            } else {
                setEditorState(EditorState.createEmpty());
            }
        }
    }, [InputMessage]);

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);
        const contentState = newEditorState.getCurrentContent();
        const rawContent = contentState.getPlainText();

        if (InputMessage && typeof InputMessage.setValue === "function") {
            try {
                InputMessage.setValue(rawContent); // Update the InputMessage using setValue
            } catch (error) {
                console.error("Error setting InputMessage value:", error);
            }
        } else {
            console.error("InputMessage is not available or setValue is not a function.");
        }
    };

    // Handle inline style toggling (bold, italic, etc.)
    const toggleInlineStyle = (style) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}>
            {/* <div style={{ marginBottom: '10px' }}> */}
             
            <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder="Type your message here..."
                style={{ direction: 'ltr' }} // Ensure text direction is left-to-right
            />
        </div>
    );
};
