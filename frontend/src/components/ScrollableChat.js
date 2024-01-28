import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import React, { useState } from 'react';
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";


const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString().substring(0,5);
  };
  const [replyMode, setReplyMode] = useState(false);
  const handleDoubleTap = () => {
    setReplyMode(!replyMode);
  };
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id} onDoubleClick={handleDoubleTap}>
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
