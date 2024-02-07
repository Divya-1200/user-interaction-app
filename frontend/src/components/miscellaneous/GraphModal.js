import React, { useState , useEffect} from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Flex, IconButton } from '@chakra-ui/react';
import { TimeIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
// import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const GraphModal = ({chatMessages}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleNext = () => setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
  const handlePrev = () => setActiveIndex((prevIndex) => (prevIndex + 2) % 3);
  const [messageCountData, setMessageCountData] = useState([]);

  useEffect(() => {
    // console.log("chatMessages ", chatMessages);
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
    if (messageCountData.length > 0) {

    }
  }, [messageCountData]);


  
  return (
    <>
      <IconButton icon={<TimeIcon />} onClick={handleOpen} />
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent maxWidth="1200px" maxHeight="1000px"> {/* Set maxWidth and maxHeight here */}
        <ModalHeader>Chat Analytics</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justifyContent="center" alignItems="center">
              <Box paddingRight="4">
                <IconButton icon={<ChevronLeftIcon />} onClick={handlePrev} />
              </Box>
              <Box
                w="1000px"
                h="700px"
                // bg={activeIndex === 0 ? 'blue.200' : 'gray.100'}
                mr="4"
                borderRadius="lg"
                display={activeIndex === 0 ? 'block' : 'none'}
              >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messageCountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }}  />
                    <YAxis  label={{ value: 'Message Count', angle: -90, position: 'insideLeft' }}/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
              </Box>
              <Box
                w="200px"
                h="200px"
                bg={activeIndex === 1 ? 'blue.200' : 'gray.100'}
                mr="4"
                borderRadius="lg"
                display={activeIndex === 1 ? 'block' : 'none'}
              >
                Item 2
              </Box>
              <Box
                w="200px"
                h="200px"
                bg={activeIndex === 2 ? 'blue.200' : 'gray.100'}
                borderRadius="lg"
                display={activeIndex === 2 ? 'block' : 'none'}
              >
                Item 3
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
