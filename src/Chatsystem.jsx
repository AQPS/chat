import { createElement, useState, useEffect, useCallback } from "react";
import { Editor, EditorState, ContentState, convertFromHTML, Modifier, RichUtils } from "draft-js";
import 'draft-js/dist/Draft.css';

// Dummy candidates for mention
const dummyCandidates = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Prince',
    'Edward Snowden'
];

const transformTextToHtml = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">${url}</a>`;
    });
};

export const Chatsystem = (props) => {
    const { InputMessage } = props;
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [showCandidates, setShowCandidates] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (InputMessage && typeof InputMessage.value === 'string') {
            const messageText = InputMessage.value;
            const htmlContent = transformTextToHtml(messageText);
            const blocksFromHTML = convertFromHTML(messageText);
            const contentState = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap
            );

            let newEditorState = EditorState.createWithContent(contentState);
            setEditorState(EditorState.moveFocusToEnd(newEditorState));
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }, [InputMessage]);

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);

        const contentState = newEditorState.getCurrentContent();
        const plainText = contentState.getPlainText();
        const cursorPosition = newEditorState.getSelection().getFocusOffset();
        const beforeCursor = plainText.slice(0, cursorPosition);
        const mentionIndex = beforeCursor.lastIndexOf('@');

        if (mentionIndex !== -1) {
            const mentionText = beforeCursor.slice(mentionIndex + 1);
            if (mentionText) {
                const filteredCandidates = dummyCandidates.filter(candidate =>
                    candidate.toLowerCase().includes(mentionText.toLowerCase())
                );
                setCandidates(filteredCandidates);
                setShowCandidates(true);

                // Position the dropdown correctly
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setDropdownPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                    });
                }
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
        const selectionState = editorState.getSelection();

        // Find the position of '@' to replace text after it
        const mentionIndex = selectionState.getAnchorOffset() - 1;
        const newText = `@${candidate} `;

        // Replace text with the selected candidate
        const newContentState = Modifier.replaceText(
            contentState,
            selectionState.merge({
                anchorOffset: mentionIndex,
                focusOffset: selectionState.getAnchorOffset()
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
                style={{ minHeight: '200px' }} // Ensure text direction and height
            />
            {showCandidates && candidates.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        border: '1px solid #ddd',
                        backgroundColor: '#fff',
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        width: '200px' // Ensure dropdown width
                    }}
                >
                    {candidates.map((candidate, index) => (
                        <div
                            key={index}
                            style={{ padding: '5px', cursor: 'pointer' }}
                            onClick={() => handleCandidateClick(candidate)}
                        >
                            {candidate}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
