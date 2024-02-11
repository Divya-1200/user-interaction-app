import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";

const TagBadgeItem = ({ tag, handleFunction }) => {
 
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="green"
      cursor="pointer"
      onClick={handleFunction}
    >
      {tag.tag}
      <CloseIcon pl={1} />
    </Badge>
  );
};

export default TagBadgeItem;