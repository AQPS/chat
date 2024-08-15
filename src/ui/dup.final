import { createElement, useState, useEffect } from "react";
import { Editor, EditorState, ContentState, convertFromHTML, Modifier, RichUtils } from "draft-js";
import 'draft-js/dist/Draft.css';

const transformTextToHtml = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">${url}</a>`;
    });
};

// Dummy candidates for mention
const dummyCandidates = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Prince',
    'Edward Snowden'
];

export const Chatsystem = (props) => {
    const { InputMessage } = props;
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [displayText, setDisplayText] = useState("");
    const [showCandidates, setShowCandidates] = useState(false);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        if (InputMessage && typeof InputMessage.value === 'string') {
            const messageText = InputMessage.value;
            const htmlContent = transformTextToHtml(messageText);
            setDisplayText(htmlContent);

            try {
                const blocksFromHTML = convertFromHTML(messageText);
                const contentState = ContentState.createFromBlockArray(
                    blocksFromHTML.contentBlocks,
                    blocksFromHTML.entityMap
                );

                const newEditorState = EditorState.createWithContent(contentState);
                setEditorState(EditorState.moveFocusToEnd(newEditorState));
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

        if (plainText.includes('@')) {
            const cursorPosition = newEditorState.getSelection().getFocusOffset();
            const beforeCursor = plainText.slice(0, cursorPosition);
            const mentionIndex = beforeCursor.lastIndexOf('@');
            
            if (mentionIndex !== -1) {
                setCandidates(dummyCandidates);
                setShowCandidates(true);
            } else {
                setShowCandidates(false);
            }
        } else {
            setShowCandidates(false);
        }

        const htmlContent = transformTextToHtml(plainText);

        if (InputMessage && typeof InputMessage.setValue === "function") {
            try {
                InputMessage.setValue(htmlContent);
            } catch (error) {
                console.error("Error setting InputMessage value:", error);
            }
        }
    };

    const handleCandidateClick = (candidate) => {
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();

        const mentionIndex = selection.getAnchorOffset() - 1;
        const newText = `@${candidate} `;

        const newContentState = Modifier.insertText(
            contentState,
            selection.merge({
                anchorOffset: mentionIndex,
                focusOffset: selection.getAnchorOffset()
            }),
            newText
        );

        const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
        setEditorState(EditorState.moveFocusToEnd(newEditorState));
        setShowCandidates(false);

        const htmlContent = transformTextToHtml(newContentState.getPlainText());
        if (InputMessage && typeof InputMessage.setValue === "function") {
            try {
                InputMessage.setValue(htmlContent);
            } catch (error) {
                console.error("Error setting InputMessage value:", error);
            }
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px', position: 'relative' }}>
            <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder="Type your message here..."
            />
            {showCandidates && (
                <div style={{ position: 'absolute', bottom: '50px', background: 'white', border: '1px solid #ddd', zIndex: 1 }}>
                    {candidates.map((candidate, index) => (
                        <div key={index} style={{ padding: '5px', cursor: 'pointer' }} onClick={() => handleCandidateClick(candidate)}>
                            {candidate}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
