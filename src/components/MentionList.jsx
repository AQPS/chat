import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    createElement
  } from "react";
import '../Chatsystem.css'
  
  export const MentionList = forwardRef((props,  ref) => {
    const { items } = props
    const [selectedIndex, setSelectedIndex] = useState(0);
  
    const selectItem = (index) => {
      const item = 
      items[index];
  
      if (item) {
        props.command({ id: item.identityId, label: item.fullname });
      }
    };
  
    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + items.length - 1) % items.length
      );
    };
  
    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };
  
    const enterHandler = () => {
      selectItem(selectedIndex);
    };
  
    useEffect(() => setSelectedIndex(0), [items]);
  
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }
  
        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }
  
        if (event.key === "Enter") {
          enterHandler();
          return true;
        }
  
        return false;
      }
    }));
  
    return (
      <div className="mention-list, items">
        {items ? (
          items.map((item, index) => (
            <div
              className="mention-item"
              key={index}
              onClick={() => selectItem(index)}
            >
              {item.fullname}
            </div>
          ))
        ) : (
          <div className="mention-item">No result</div>
        )}
      </div>
    );
  });
  