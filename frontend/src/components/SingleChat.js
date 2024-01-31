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
import UserListItem from "./userAvatar/UserListItem";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:3388";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  // const [tags, setTags] = useState([]);
  const [tagSearch, setTagSearch] = useState(false);
  const [tagSearchKey, setTagSearchKey] = useState('');
  const [searchTagResult, setSearchTagResult] = useState([]);
  const [messageTags, setMessageTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTagResultQuery, setSearchTagResultQuery] = useState('');
  const [searchUserResultQuery, setSearchUserResultQuery] = useState('');

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
      // console.log("message received", newMessage);
      console.log("selected tags",messageTags);
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        setMessageTags([]);
        const { data } = await axios.post(
          "http://localhost:3388/api/message",
          {
            content : newMessage,
            tags    : messageTags,
            chatId  : selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
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
    socket.on("message recieved", (newMessageRecieved) => {
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
    console.log("Updated messageTags:", messageTags);

    }, [messageTags]);

  const typingHandler =  async (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (!e.target.value.endsWith("#")){
      console.log("inside here");
      const bool = await false;
      setTagSearch(bool); 
      setSearchTagResult([]);
    }
    if (e.target.value.endsWith("#") || tagSearch) {  
      setTagSearch(true); 
      const query = e.target.value.split("#")[1];
      console.log(query);
      setTagSearchKey(query);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      try {
        const { data } =  await axios.get(
          `http://localhost:3388/api/tag?search=${query}`, config
        );
        setSearchTagResult(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
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
  const handleSearch = () => {
    const filteredMessages = messages.filter((message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setMessages(filteredMessages);
  };
  const handleAddTag = async (tag) => {
    console.log("adding", tag);
    setMessageTags(prevTags => {
      // Check if the tag already exists in the array
      if (!prevTags.includes(tag)) {
        // Update messageTags
        const newTags = [...prevTags, tag];
        
        // Perform actions after updating messageTags
        console.log("added ", newTags);
        console.log("prevTags:", prevTags);
        console.log("newTags:", newTags);
        setNewMessage((prevMessage) => {
          const messageWithoutTag = prevMessage.split('#')[0];
          const finalTag = tag.tag ? tag.tag : tag;
          return `${messageWithoutTag}#${finalTag}`;
        });
  
        setTagSearch(false);
        setSearchTagResult([]);
  
        // Return the updated state
        return newTags;
      }
      console.log("");
      // If the tag already exists, return the current state without modification
      return prevTags;
    });
  };

  const newSearchQuery = async (e) => {
    setSearchQuery(e.target.value);
    if(!e.target.value.startsWith("#")){
      setSearchTagResultQuery([]);
    }
    if(!e.target.value.startsWith("@")){
      setSearchTagResultQuery([]);
    }
    if(e.target.value.startsWith("#")){
      console.log("found the value"); 
      setTagSearch(true); 
      const query = e.target.value.split("#")[1];
      console.log(query);
      setTagSearchKey(query);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      console.log("searching tag");
      try {
        const { data } =  await axios.get(
          `http://localhost:3388/api/tag?search=${query}`, config
        );
        setSearchTagResultQuery(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    }
    if(!e.target.value.startsWith("@")){
      setSearchUserResultQuery([]);
    }
    if(e.target.value.startsWith('@')){
      
      try {
        
        const query = e.target.value.split("@")[1];
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`http://localhost:3388/api/user?search=${query}`, config);
        console.log(data);
  
        setSearchUserResultQuery(data);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      
      }
    }
  }
  const handleKeyDown = async (e) => {
    console.log("tagSearch ", tagSearch);
    if (e.key === ' ' && tagSearch || e.key === 'Enter' && tagSearch) {
      handleAddTag(tagSearchKey);
    }
  };
  const handleSearchUser = async (user) => {
    console.log(user.name);
    setSearchUserResultQuery([]);
    setSearchQuery(user.name)
  }
  
   
  const handleSearchTag = async (tag) => {
    setSearchTagResultQuery([]);
    setSearchQuery(tag.tag);
  }

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
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Input
        ml={4} mb={7}
        variant="filled"
        placeholder="Search messages..."
        value={searchQuery}
        onChange={newSearchQuery}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
      />
      
      {Array.isArray(searchUserResultQuery) ? (
          searchUserResultQuery
            .slice(0, 4)
            .map((tag) => (
              <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleSearchUser(tag)}
                />
            ))
        ) : (
          <div></div>
        )}
      {loading ? (
        // <ChatLoading />
        <div>Loading...</div>
      ) : (
        Array.isArray(searchTagResultQuery) ? (
          searchTagResultQuery
            .slice(0, 4)
            .map((tag) => (
              <TagListItem
                key={tag._id}
                tag={tag}
                handleFunction={() => handleSearchTag(tag)}
              />
            ))
        ) : (
          <div></div>
        )
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
                <ScrollableChat messages={messages} />
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
