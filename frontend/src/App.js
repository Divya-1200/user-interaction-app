import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import InvitationPage from "./Pages/InvitationPage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path="/accept/:userid/:chatid" component={InvitationPage} />
    </div>
  );
}

export default App;
