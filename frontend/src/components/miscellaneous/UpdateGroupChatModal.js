import { ViewIcon } from "@chakra-ui/icons";
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
  IconButton,
  Spinner,
  Textarea
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import TagBadgeItem from "../userAvatar/TagBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import TagListItem from "../userAvatar/TagListItem";
import { Text } from '@chakra-ui/react';
import { EditIcon, CheckIcon } from '@chakra-ui/icons';

// import { format } from 'date-fns'; 
// import eachDayOfInterval from 'date-fns/eachDayOfInterval';

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();
  const [searchTagResult, setSearchTagResult] = useState([]);
  const { selectedChat, setSelectedChat, user } = ChatState();
  const [groupChatName, setGroupChatName] = useState(selectedChat.chatName);
  const [editing, setEditing] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [groupChatDescription, setGroupChatDescription] = useState(
    selectedChat.groupDescription && selectedChat.groupDescription.trim() !== ""
      ? selectedChat.groupDescription
      : "Add your group description here"
  );
  const handleEdit = () => {
    setEditing(!editing);
  };

  const handleSave = () => {
    setEditing(false);
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
      const { data } = await axios.get(`http://localhost:3388/api/tag?search=${tagSearch}`, config);
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
      const { data } = await axios.get(`http://localhost:3388/api/user?search=${search}`, config);
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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:3388/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      // setSelectedChat("");
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      toast({
        title: "Updated Successfully",
        // description: error.response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };
  const handleAddTag = async (tag) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:3388/api/chat/tag/add`,
        {
          chatId: selectedChat._id,
          tag: tag,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };
  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:3388/api/chat/groupadd`,
        {
          chat: selectedChat,
          user: user1,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };
  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    return date.toISOString().substring(0, 10);
  };
  const handleTagRemove = async (tag) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:3388/api/chat/tag/remove`,
        {
          chatId: selectedChat._id,
          tagId : tag._id,
        },
        config
      );
      toast({
        title: "Tag removed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };
  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:3388/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      toast({
        title: "User removed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            
            <Box w="100%" mb={3}>
              <Box d="flex" alignItems="center" mb={2}>
              <Text fontWeight="bold"  mr={3}>Group Description</Text>
                {editing ? (
                  <IconButton
                    icon={<CheckIcon/>}
                    colorScheme="teal"
                    aria-label="Save"
                    onClick={handleSave}
                    mr={2}
                    fontSize="2px"
                  />
                ) : (
                  <IconButton
                    icon={<EditIcon />}
                    colorScheme="teal"
                    aria-label="Edit"
                    onClick={handleEdit}
                    mr={2}
                  />
                )}
                
              </Box>
              {editing ? (
                <Textarea
                  placeholder="Group Description"
                  value={groupChatDescription}
                  onChange={(e) => setGroupChatDescription(e.target.value)}
                />
              ) : (
                <div>
                  <Text>{groupChatDescription}</Text>
                </div>
              )}
            </Box>
            <FormControl d="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u.user._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u.user)}
                />
              ))}
            </Box>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}

            <FormControl>
              <Input
                placeholder="Add Tags"
                mb={1}
                onChange={(e) => searchTags(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e.target.value);
                  }
                }}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.tags.map((t) => (
                <TagBadgeItem
                  key={t._id}
                  tag={t}
                  handleFunction={() => handleTagRemove(t)}
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
                    handleFunction={() => handleAddTag(tag)}
                  />
                ))    
            )}
          </ModalBody>
          <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>

            <Box mt={3} textAlign="left" color="gray.500" fontSize="sm">
              <Text>Created At: {formatCreatedAt(selectedChat.createdAt)}</Text>
            </Box>

            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
