import React, {createElement, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
Quill.register({"modules/mention": Mention });
import "quill-mention/autoregister";
import {Mention} from 'quill-mention';

const atValues = [
  { id: 1, value: 'Fredrik Sundqvist' },
  { id: 2, value: 'Patrik Sjölin' }
];
const hashValues = [
  { id: 3, value: 'Fredrik Sundqvist 2' },
  { id: 4, value: 'Patrik Sjölin 2' }
];

export const Chatsystem = (props) => {
  const { InputMessage } = props;
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof InputMessage === 'string') {
      setMessage(InputMessage.trim() || '');
    }
  }, [InputMessage]);

  const handleEditorChange = (content) => {
    setMessage(content);

    if (InputMessage && typeof InputMessage.setValue === 'function') {
      InputMessage.setValue(content);
    } else {
      console.error('InputMessage is not available or setValue is not a function.');
    }
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link']
    ],
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@', '#'],
      source: function (searchTerm, renderList, mentionChar) {
        let values;

        if (mentionChar === '@') {
          values = atValues;
        } else {
          values = hashValues;
        }

        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = values.filter(item =>
            item.value.toLowerCase().includes(searchTerm.toLowerCase())
          );
          renderList(matches, searchTerm);
        }
      }
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}>
      <ReactQuill
        value={message}
        onChange={handleEditorChange}
        modules={modules}
        placeholder="Type your message here..."
      />
    </div>
  );
};
