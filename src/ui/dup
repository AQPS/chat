import { createElement, useState, useEffect } from "react";
import { Editor, EditorState, ContentState, Modifier, SelectionState, RichUtils, convertToRaw, convertFromHTML } from "draft-js";
import 'draft-js/dist/Draft.css';

const transformTextToHtml = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">${url}</a>`;
    });
};

export const Chatsystem = (props) => {
    const { InputMessage } = props;
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        if (InputMessage && typeof InputMessage.value === 'string') {
            const messageText = InputMessage.value;
            const htmlContent = transformTextToHtml(messageText);
            setDisplayText(htmlContent);

            try {
                // Convert HTML to Draft.js ContentState
                const blocksFromHTML = convertFromHTML(messageText);
                const contentState = ContentState.createFromBlockArray(
                    blocksFromHTML.contentBlocks,
                    blocksFromHTML.entityMap
                );

                let newEditorState = EditorState.createWithContent(contentState);

                // Check if contentState has at least one block
                if (contentState.getBlockMap().size > 0) {
                    // Set cursor position to the end of the text
                    const lastBlockKey = contentState.getLastBlock().getKey();
                    const selectionState = SelectionState.createEmpty(lastBlockKey).merge({
                        anchorOffset: contentState.getLastBlock().getLength(),
                        focusOffset: contentState.getLastBlock().getLength(),
                    });
                    newEditorState = EditorState.forceSelection(newEditorState, selectionState);
                }

                setEditorState(newEditorState);
            } catch (error) {
                console.error("Error creating ContentState:", error);
            }
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }, [InputMessage]);

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);
        const contentState = newEditorState.getCurrentContent();
        const plainText = contentState.getPlainText();

        // Transform plain text URLs to anchor tags
        const htmlContent = transformTextToHtml(plainText);

        if (InputMessage && typeof InputMessage.setValue === "function") {
            try {
                InputMessage.setValue(htmlContent); // Update the InputMessage using HTML content
            } catch (error) {
                console.error("Error setting InputMessage value:", error);
            }
        } else {
            console.error("InputMessage is not available or setValue is not a function.");
        }
    };

    const toggleInlineStyle = (style) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}>
            {/* Toolbar for inline styles */}
            {/* <div style={{ marginBottom: '10px' }}>
                <button onClick={() => toggleInlineStyle('BOLD')}>Bold</button>
                <button onClick={() => toggleInlineStyle('ITALIC')}>Italic</button>
                <button onClick={() => toggleInlineStyle('UNDERLINE')}>Underline</button>
                <button onClick={() => toggleInlineStyle('CODE')}>Code</button>
            </div> */}
            <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder="Type your message here..."
                style={{ direction: 'ltr' }} // Ensure text direction is left-to-right
            />
            {/* <div style={{ marginTop: '10px', color: '#555' }}>
                <strong>Input Message:</strong>
                <div
                    style={{
                        backgroundColor: 'lightgray',
                        color: 'black',
                        padding: '5px',
                        borderRadius: '4px',
                        textAlign: 'left' // Align text to the left
                    }}
                    dangerouslySetInnerHTML={{ __html: displayText || "No message available" }}
                />
            </div> */}
        </div>
    );
};
