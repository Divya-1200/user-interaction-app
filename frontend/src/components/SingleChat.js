import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import TagListItem from "./userAvatar/TagListItem";
import MessageListItem from "./userAvatar/MessageListItem";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { Tooltip } from "@chakra-ui/react";


const ENDPOINT = "http://localhost:3388";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [tagLoading, setTagLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [tagSearch, setTagSearch] = useState(false);
  const [tagSearchKey, setTagSearchKey] = useState('');
  const [searchTagResult, setSearchTagResult] = useState([]);
  const [messageTags, setMessageTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [scrollToMessageId, setScrollToMessageId] = useState(null);
  const [priorityMessage, setPriorityMessage] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);


  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:3388/api/message/${selectedChat._id}`,
        config
      );
      // console.log("all messages ",data);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        setMessageTags(async (prevMessageTags) => {
          const updatedTags = Array.isArray(prevMessageTags) ? [...prevMessageTags] : [];
          const { data } = await axios.post(
            "http://localhost:3388/api/message",
            {
              content : newMessage,
              tags    : updatedTags,
              chatId  : selectedChat,
              priority : priorityMessage,
              users : selectedChat.users,
              replyingTo : replyingTo && replyingTo._id,
            },
            config
          );
          // console.log(data);
          socket.emit("new message", data);
          setMessages([...messages, data]);
          setMessageTags([]);
          setPriorityMessage(false);
        });
        // setMessageTags([]);
        if (replyingTo) {
          setReplyingTo(null);
        }
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };



  
  useEffect(() => {
    socket = io(ENDPOINT);
    // console.log("user in client socket", user);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message sent", (newMessageRecieved) => {
      // console.log("message is received here ",newMessageRecieved);
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  useEffect(() => {
    // console.log("Updated messageTags:", messageTags);
   // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [messageTags]);

  const typingHandler =  async (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    if (e.target.value.endsWith("#") || tagSearch) {
      const query = e.target.value.split("#").pop(); // Extract the tag query after "#"
      setTagSearch(true);
      setTagSearchKey(query);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      try {
        const { data } = await axios.get(
          `http://localhost:3388/api/tag?search=${query}`,
          config
        );
        setSearchTagResult(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    if(e.target.value.startsWith("!!") && !priorityMessage){
      setPriorityMessage(true);
    }
    if(!e.target.value.startsWith("!!") && priorityMessage){
      setPriorityMessage(false);
    }
    
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleKeyDown =  async (e) => {
    if (e.key === " " && tagSearch) {
      setMessageTags((prevMessageTags) => [...prevMessageTags, tagSearchKey]);  
      setTagSearch(false);
      setSearchTagResult([]);
    }
    
    if(e.key === 'Enter' && tagSearch){
      setMessageTags((prevMessageTags) => [...prevMessageTags, tagSearchKey]);  
      setTagSearch(false);
      setSearchTagResult([]);
    }

    if (e.key === "Backspace") {
      if (newMessage.endsWith("#")) {
        setTagSearch(false);
        setSearchTagResult([]);
        setTagSearchKey('');
        setMessageTags((prevMessageTags) => {
          const updatedMessageTags = [...prevMessageTags];
          updatedMessageTags.pop();
          return updatedMessageTags;

        }); 
       
      }
      /** It must be like when backspace is pressed and the hashtag value is modified then the tag must be modified in this set need to work on this  */
      // else {
      //   // Check if the previous character is a hashtag
      //   const lastHashIndex = newMessage.lastIndexOf('#');
      //   const previousChar = newMessage.charAt(lastHashIndex - 1);
        
      //   if (previousChar === '#') {
      //     // Remove the last message tag
      //     setMessageTags((prevMessageTags) => {
      //       const updatedMessageTags = [...prevMessageTags];
      //       updatedMessageTags.pop(); // Remove the last element
      //       console.log("prevMessageTags", prevMessageTags);
      //       return updatedMessageTags;
      //     });
      //   }
      // }      
    }
  }

  const handleAddTag = (tag) => {
    const lastHashIndex = newMessage.lastIndexOf('#');
    if(!messageTags.includes(tag.tag)){
      setMessageTags([...messageTags, tag.tag]); // Add the selected tag to messageTags
    }
    setSearchTagResult([]); // Clear the tag search results
    setTagSearch(false); // Reset tag search state
    setNewMessage(
      (prevMessage) =>
        prevMessage.substring(0, lastHashIndex) + `#${tag.tag}` + prevMessage.substring(lastHashIndex + tag.tag.length + 1)
    );  };

  /**Search bar*/
  const handleSearch = async () => {
    // Perform the search based on the 'search' query
    try {
      const filteredMessages = messages.filter((message) =>
      message.content.toLowerCase().includes(search.toLowerCase())
    );
      setSearchResults(filteredMessages);
      // setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  };

  useEffect(() => {
    handleSearch(); // Initial search when component mounts
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
    if(e.target.value === ''){
      setSearchResults([]);
    }
    else{
      handleSearch(); 
    }  
  };

  const handleSearchResults = (clickedIndex) => {
    setScrollToMessageId(clickedIndex);
    setSearchResults([]);

  };
  const resetScrollToMessageId = () => {
    setScrollToMessageId(null);
  };
  const handleDoubleTap = (message) => {
    if (replyingTo && replyingTo._id === message._id) {
      setReplyingTo(null);
    } else {
      setReplyingTo(message);
    }
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <Tooltip label="Search" hasArrow placement="bottom-end">
                  <Box d="flex" pb={2}>
                    <Input
                        placeholder="Search"
                        mr={2}   
                        value={search} 
                        onChange={handleChange}
                    />
                    
                  </Box>
                  
                  </Tooltip>
                  
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          {Array.isArray(searchResults) ? (
                searchResults
                  .slice(0, 4)
                  .map((message) => (
                    <MessageListItem
                      key={message._id}
                      message={message.content}
                      handleFunction={() => handleSearchResults(message._id)}
                    />
                  ))
              ) : (
                <div>No message found</div>
              )}
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} scrollToMessageId={scrollToMessageId} onMessageDoubleTap={handleDoubleTap} resetScrollToMessageId={resetScrollToMessageId}/>
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              Array.isArray(searchTagResult) ? (
                searchTagResult
                  .slice(0, 4)
                  .map((tag) => (
                    <TagListItem
                      key={tag._id}
                      tag={tag}
                      handleFunction={() => handleAddTag(tag)}
                    />
                  ))
              ) : (
                <div>No tags found</div>
              )
            )}

            {replyingTo && (
                <div style={{ marginBottom: '10px' }}>
                <strong>Replying to:</strong> {replyingTo.content}
                </div>
            )}

              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={handleKeyDown}
              />
             
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
