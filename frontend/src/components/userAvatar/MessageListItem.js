import { Box, Text } from "@chakra-ui/layout";

const MessageListItem = ({message, handleFunction }) => {
 

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Box>
       <Text>
        {message}
       </Text>
      </Box>
    </Box>
  );
};

export default MessageListItem;
