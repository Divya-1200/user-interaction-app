import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import TagListItem from "../userAvatar/TagListItem";
import TagBadgeItem from "../userAvatar/TagBadgeItem";


const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTags, setSelectedTag] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [groupChatDescription, setGroupChatDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [searchTagResult, setSearchTagResult] = useState([]);
  
  const toast = useToast();

  const { user, chats, setChats } = ChatState();
  API_URL=process.env.API_URL;
  const handleGroup = (userToAdd) => {
    // console.log("user added",userToAdd);
    // console.log("selected chats",selectedUsers);
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
    setSearchResult([]);
  };
  const handleTags = async (tagToAdd) => {
    if(selectedTags.includes(tagToAdd)){
      toast({
        title: "Tag already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedTag([...selectedTags, tagToAdd]);
    setSearchTagResult([]);
  };
  const handleDeleteTag = (tag) => {
    setSelectedTag(selectedTags.filter((sel) => sel._id !== tag._id));

  };
  const searchTags = async (query) => {
    setTagSearch(query);
    if(!query){
      return;
    }
    try{
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/api/tag?search=${tagSearch}`, config);
      setLoading(false);
      setSearchTagResult(data);
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
  };
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
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
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${API_URL}/api/chat/group`,
        {
          name: groupChatName,
          decription: groupChatDescription,
          tags: JSON.stringify(selectedTags.map((t) => t._id)),
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      // console.log(data);
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        // description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedTag([]);
    setSelectedUsers([]); 
    setSearchResult([]); 
    setSearchTagResult([]); 
    onClose(); 
  };
  /**Need to handle single tag addition */
  // const handleAddTag = async (tag) => {
  //   try {
  //     setLoading(true);
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     };
  //     const { data } = await axios.put(
  //       `http://localhost:3388/api/chat/tag/add`,
  //       {
  //         chatId: selectedChat._id,
  //         tag: tag,
  //       },
  //       config
  //     );
  //     setSelectedChat(data);
  //     setFetchAgain(!fetchAgain);
  //     setLoading(false);
  //   } catch (error) {
  //     toast({
  //       title: "Error Occured!",
  //       description: error.response.data.message,
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //       position: "top",
  //     });
  //     setLoading(false);
  //   }
  // };
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={handleCloseModal} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Textarea
                placeholder="Description"
                mb={3}
                onChange={(e) => setGroupChatDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: John, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            
            <Box w="100%" d="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
            <FormControl>
              <Input
                placeholder="Add Tags for this Discussions"
                mb={1}
                onChange={(e) => searchTags(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTags(e.target.value);
                    }
                  }}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap">
              {selectedTags.map((t) => (
                <TagBadgeItem
                  key={t._id}
                  tag={t}
                  handleFunction={() => handleDeleteTag(t)}
                />
              ))}
            </Box>
            {loading ? (
              // <ChatLoading />
              <div>Loading...</div>
            ) : (
              searchTagResult
                ?.slice(0, 4)
                .map((tag) => (
                  <TagListItem
                    key={tag._id}
                    tag={tag}
                    handleFunction={() => handleTags(tag)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
