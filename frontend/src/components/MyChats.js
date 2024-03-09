import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useHistory } from "react-router";
API_URL=process.env.API_URL;
const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const [notacceptedChats, setNotAcceptedChats] = useState([]);
  const toast = useToast();
  const history = useHistory();
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${API_URL}/api/chat`, config);
      const acceptedChats = data.filter(chat => chat.users.some(user1 => user1.user._id ===  user._id && user1.status === 'accepted'));
      const filteredData = data.filter(chat => chat.users.some(user1 => user1.user._id ===  user._id && user1.status === 'pending'));
      setNotAcceptedChats(filteredData);

      setChats(acceptedChats);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleAccept = async(chat) => {
    try{
      const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.get(`${API_URL}/api/chat/accept/${user._id}/${chat._id}`, config);
 
      toast({
          title: "Invitation Accepted",
          description: "You have been joined the group",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
      });
      history.push("/");
    }
    catch (error) {
      toast({
        title: "Error Occurred!",
        description: "An error occurred while accepting the invitation.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
    });
    history.push("/");
    }
  };
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
        <div
        ></div>
        <div 
        mt={5}></div>
        {notacceptedChats? (
        <Stack overflowY="scroll">
         
          {notacceptedChats.map((chat) => (
            <Box
              onClick={() => setSelectedChat(chat)}
              cursor="pointer"
              bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
              color={selectedChat === chat ? "white" : "black"}
              px={3}
              py={2}
              borderRadius="lg"
              key={chat._id}          
            >    
              <Box display="flex"
                alignItems="center"
                justifyContent="space-between">
                <Text>
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                </Text>
                <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(chat);
                    }}
                    colorScheme="green"
                    borderRadius="lg"
                  
                  >
                    Accept
                </Button>
              </Box>
              {chat.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )} 
        </Box>
       
         
    ))}
  </Stack>
) : (
  <ChatLoading />
)}

      </Box>
    </Box>
  );
};

export default MyChats;
