import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import React from 'react'
import App from './App.jsx'
import ReactDOM from "react-dom/client"
import Hero from './Components/Hero.jsx'
import Navbar from './Components/Navbar.jsx'
import Signup from './Components/Signup.jsx'
import JobFind from './Components/JobFind.jsx'
import Courses from './Components/Courses.jsx'
import ChatRooms from './Components/Chats/ChatRooms.jsx'
import ChatRoom from './Components/Chats/ChatRoom.jsx'
import ChatRoomLayout from './Components/Chats/ChatRoomLayout.jsx'
import ResumeAnalyzer from './Components/Chats/ResumeAnalyzer.jsx'
import QuizHistory from './Components/QuizHistory.jsx'

import JobPost from './Components/JobPost.jsx'
import {
  createBrowserRouter,RouterProvider
} from "react-router-dom";
import Form from './Components/Form.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ProfileEdit from './Components/ProfileEdit.jsx'
import MockInterview from './Components/quiz.jsx'
import AIQuiz from './Components/quiz.jsx'

const router = createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
     { path:'',
      element:<Hero/>
},
{
  path:'/Signup',
  element:<Signup/>
},
{
  path:'form',
  element:<Form/>
},
{
  path:'JobPost',
  element:<JobPost/>
},
{
  path:'JobFind',
  element:<JobFind/>
},
{
  path:'ProfileEdit',
  element:<ProfileEdit/>
  
},
{
  path:'Courses',
  element:<Courses/>
},
{
  path:'ChatRooms',
  element:<ChatRooms/>
},
{
  path:'chat/:roomId',
  element:<ChatRoomLayout/>
},
{
  path:"resumeAnalyzer",
  element:<ResumeAnalyzer/>
},
{
  path:"AIQuiz",
  element:<AIQuiz/>
},
{
  path:"QuizHistory",
  element:<QuizHistory/>
}

// {
//   path:'chat/:roomId',
//   element:<ChatRoom/>
// },

]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <GoogleOAuthProvider clientId='259322720860-8ikdleici6jj1bb8m54g5pgc04tu7n2f.apps.googleusercontent.com'>
    
        <RouterProvider router={router} />
      
     </GoogleOAuthProvider>
  </React.StrictMode>,
)
