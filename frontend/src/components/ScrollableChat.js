import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import React, { useEffect, useState } from 'react';

import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useRef } from 'react';

const ScrollableChat = ({ messages ,  scrollToMessageId}) => {
  const { user } = ChatState();
  const messagesContainerRef = useRef();
  const messageRefs = useRef(messages.map(() => React.createRef()));

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString().substring(0,5);
  };
  const [replyMode, setReplyMode] = useState(false);
  const handleDoubleTap = () => {
    setReplyMode(!replyMode);
  };
  const renderTags = (tags) => {
    return tags.map((tag) => (
      <span key={tag._id} style={{ color: "blue", fontWeight: "bold" }}>
        #{tag.tag}{" "}
      </span>
    ));
  };

  useEffect(() => {
    if (messages && scrollToMessageId) {
      // console.log("use effect ",messagesContainerRef.current);
      scrollToMessage(scrollToMessageId);
    }
  }, [messages, scrollToMessageId]);

  const scrollToMessage = (messageId) => {
    const messageIndex = messages.findIndex((message) => message._id === messageId);
    console.log("scrollToMessage ", messageRefs);
    if (messageIndex !== -1 && messageRefs.current[messageIndex].current) {
      messageRefs.current[messageIndex].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <ScrollableFeed ref={messagesContainerRef}>
      {messages &&
        messages.map((m, i) => (
          <div
            style={{ display: 'flex' }}
            key={m._id}
            ref={messageRefs.current[i]} 
            onDoubleClick={handleDoubleTap}            
          >
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
            <span
              ref={i === messages.length - 1 ? messagesContainerRef : null} // Add ref here
              style={{
                border: replyMode && '2px solid #FFB6C1',
                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0" 
                  }` ,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              <div style={{ marginBottom: "5px" }}>
              {m.sender._id === user._id ? (
               <strong>You</strong>
              ) : (
                <strong>{m.sender.name}</strong>
              )}
              </div>
              <div>{m.content}</div>
              <hr style={{ margin: "5px 0" }}></hr>
              <div>{renderTags(m.tags)}</div>
              <div style={{ fontSize: "0.6em", color: "#888" }}>
               {formatCreatedAt(m.createdAt)}
              </div>
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
