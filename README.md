# User Interaction Application

This application facilitates group interactions and discussions among users in real-time. Users can create accounts, join groups, send messages, and manage group activities seamlessly. It mainly helps to focus on Human computer interactions.

## Functional Requirements
- **User Authentication**: Users can create accounts and log in securely.
- **Group Creation**: Users can create groups for discussions.
- **Group Management**: Group owners can add participants to the group.
- **Mail Notifications**: Users receive email notifications upon group invitation and for priority messages.
- **Priority Messages**: Users can send priority messages within groups.
- **Tagging Messages**: Users can create and assign tags to messages for better organization.
- **Activity Tracking**: The application tracks the number of messages sent by each user within the group graphically.
- **Tag Statistics**: It displays the maximum tags used in a group graphically.
- **Activity Timeline**: Graphical representation of group activity based on total messages sent per day.

## Non-Functional Requirements
- **Security**: Robust authentication and data encryption to ensure user data safety.
- **Scalability**: The application should handle a growing number of users and messages efficiently.
- **Performance**: Fast message delivery and response times for an improved user experience.
- **Reliability**: Minimal downtime and error handling mechanisms in place.
- **User-Friendly Interface**: Intuitive UI for easy navigation and interaction.

## Future Implementations
- **Integration**: Integrate with third-party services for additional functionalities like file sharing or video calls.

## Tech Stack Details
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Email Notifications**: Nodemailer
- **Data Visualization**: Chart.js





## Run Locally

Clone the project


Go to the project directory

```bash
  cd chat-app
```

Install dependencies

```bash
  npm install
```

```bash
  cd frontend/
  npm install
```

Start the server

```bash
  npm run start
```
Start the Client

```bash
  //open now terminal
  cd frontend
  npm start
```

  

