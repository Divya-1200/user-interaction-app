import { useHistory } from "react-router";
import { useParams } from 'react-router-dom';
import { useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

function InvitationPage(){
    const history = useHistory();
    const { userid, chatid } = useParams();
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("userInfo"));
                if (user && user._id === userid) {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    };
                     await axios.get(`http://localhost:3388/api/chat/accept/${userid}/${chatid}`, config);
                  
                    toast({
                        title: "Invitation Accepted",
                        description: "You have been joined the group",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "top",
                    });
                    history.push("/chats");
                } else {
                    throw new Error("Invalid user or user ID");
                }
            } catch (error) {
                toast({
                    title: "Error Occurred!",
                    description: "An error occurred while accepting the invitation.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
                history.push("/chats");
            }
        };

        fetchData();
           
    }, [history, userid, chatid, toast]);
    return (
        <div>
           
        </div>
    );
}
export default InvitationPage;
