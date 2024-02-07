import React, { useState , useEffect} from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Flex, IconButton } from '@chakra-ui/react';
import { TimeIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
// import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const GraphModal = ({chatMessages}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tagCounts, setTagCounts] = useState([]);
  const [messageCountData, setMessageCountData] = useState([]);
  const [userMessageCountData, setUserMessageCountData] = useState([]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleNext = () => setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
  const handlePrev = () => setActiveIndex((prevIndex) => (prevIndex + 2) % 3);

  useEffect(() => {
    if (chatMessages.length > 0) {
      const tagCountsMap = countTags(chatMessages);
      const tagCountsArray = mapToTagCountArray(tagCountsMap);
      setTagCounts(tagCountsArray);
    }
  }, [chatMessages]);

  const countTags = (messages) => {
    const tagCountsMap = new Map();
    messages.forEach(message => {
      if (message.tags && message.tags.length > 0) {
        message.tags.forEach(tag => {
          tagCountsMap.set(tag.tag, (tagCountsMap.get(tag.tag) || 0) + 1);
        });
      }
    });
    return tagCountsMap;
  };

  const mapToTagCountArray = (tagCountsMap) => {
    const tagCountsArray = [];
    tagCountsMap.forEach((count, tag) => {
      tagCountsArray.push({ tag, count });
    });
    return tagCountsArray;
  };

  useEffect(() => {
    console.log("chatMessages ", chatMessages);
    if (chatMessages.length > 0) {
      const filteredMessages = chatMessages.filter(message => message.createdAt);
      const groupedMessages = groupMessagesByDate(filteredMessages);
      const messageCountPerDay = countMessagesPerDay(groupedMessages);
      setMessageCountData(messageCountPerDay);
    }
  }, [chatMessages]);

  const groupMessagesByDate = (messages) => {
    const groupedMessages = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });
    return groupedMessages;
  };

  const countMessagesPerDay = (groupedMessages) => {
    const messageCountPerDay = [];
    for (const date in groupedMessages) {
      messageCountPerDay.push({
        date,
        count: groupedMessages[date].length
      });
    }
    return messageCountPerDay;
  };

  useEffect(() => {
    const messageCounts = {};
    chatMessages.forEach(message => {
    const userEmail = message.sender.email;
    if (!messageCounts[userEmail]) {
      messageCounts[userEmail] = 0;
    }
    messageCounts[userEmail]++;
  });
  const data = Object.keys(messageCounts).map(userEmail => ({
    user: userEmail,
    count: messageCounts[userEmail],
  }));
  setUserMessageCountData(data);
  console.log(data);
  }, [chatMessages]);
  useEffect(() => {
    if (messageCountData.length > 0) {

    }
  }, [messageCountData]);


  
  return (
    <>
      <IconButton icon={<TimeIcon />} onClick={handleOpen} />
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent maxWidth="90%" maxHeight="90%"> {/* Set maxWidth and maxHeight here */}
        <ModalHeader>Chat Analytics</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justifyContent="center" alignItems="center">
              <Box paddingRight="4">
                <IconButton icon={<ChevronLeftIcon />} onClick={handlePrev} />
              </Box>
              <Box
                w="100%" h="500px" mb="4"
                borderRadius="lg"
                display={activeIndex === 0 ? 'block' : 'none'}
              >
            <div style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messageCountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} label={{ value: 'Date', position: 'insideBottom', offset: -5 }}  />
                    <YAxis  label={{ value: 'Message Count', angle: -90, position: 'insideLeft' }}/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
           </div>
              </Box>
              <Box
                w="100%"
                h="500px"
                mb="20"
                borderRadius="lg"
                display={activeIndex === 1 ? 'block' : 'none'}
              >
                <div style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
               <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tagCounts}>
                    <CartesianGrid strokeDasharray="1 1" />
                    <XAxis dataKey="tag" angle={-45} textAnchor="end" label={{ value: 'Tags', position: 'insideBottom'}}/>
                    <YAxis label={{ value: 'Tag count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" barSize={50}/>
                    </BarChart>
                </ResponsiveContainer>
                </div>
              </Box>
              <Box
                w="100%"
                h="500px"
                mb="4"
                borderRadius="lg"
                display={activeIndex === 2 ? 'block' : 'none'}
              >
               <div style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
               <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userMessageCountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user" angle={-45} textAnchor="end" label={{ value: 'Users', position: 'insideBottom' }}/>
                    <YAxis label={{ value: 'Total Messages sent', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" barSize={50}/>
                    </BarChart>
                </ResponsiveContainer>
                </div>
              </Box>
              <Box paddingLeft="4">
                <IconButton icon={<ChevronRightIcon />} onClick={handleNext} />
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GraphModal;
