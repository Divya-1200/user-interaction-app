import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import React, { useEffect } from 'react';

import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useRef } from 'react';

const ScrollableChat = ({ messages ,  scrollToMessageId, onMessageDoubleTap, resetScrollToMessageId}) => {
  const { user } = ChatState();
  const messagesContainerRef = useRef();
  const messageRefs = useRef(messages.map(() => React.createRef()));

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString().substring(0,5);
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
      scrollToMessage(scrollToMessageId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, scrollToMessageId]);

  const scrollToMessage = (messageId) => {
    const messageIndex = messages.findIndex((message) => message._id === messageId);
    if (messageIndex !== -1 && messageRefs.current[messageIndex].current) {
      messageRefs.current[messageIndex].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      resetScrollToMessageId(); 
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
            onDoubleClick={() => onMessageDoubleTap(m)}    
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
                
                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0" 
                  }` ,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.reply && (
            <div
             
              style={{
                backgroundColor: "#d4edda",
                borderRadius: "20px",
                padding: "5px 15px",
              }}
              onDoubleClick={() => onMessageDoubleTap(m)}
            >
              {/* Reply messages */}
              <div style={{ marginBottom: "5px" }}>
                <strong>{m.sender._id === user._id ? "You" : m.sender.name} Replied to </strong>
                {m.reply.sender._id === user._id ? (
                  <strong>You</strong>
                ) : (
                  <strong>{m.reply.sender.name}</strong>
                )}
              </div>
              <div>{m.reply.content}</div>
              
            </div>
          )}
              <div style={{ marginBottom: "5px" }}>
              {m.sender._id === user._id ? (
               <strong>You</strong>
              ) : (
                <strong>{m.sender.name}</strong>
              )}
              </div>
              <div>{m.content}</div>
              {m.tags  && m.tags.length > 0 && (
                <hr style={{ margin: "5px 0" }}></hr>
              )}
              
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
