import { useState } from 'react'
import { Outlet } from 'react-router'
import Navbar from './Components/Navbar'
import { AuthProvider } from './AuthContext.jsx'
import './App.css'
import { store } from './Store/Store.js'
import { Provider } from 'react-redux'


function App() {
  const [isModalOpen,setIsModalOpen] = useState(false);

  return (
   
      <>
      <Provider store={store}>
      <AuthProvider>
   <Navbar onModalChange={(state) =>setIsModalOpen(state)}/>
   <Outlet isModalOpen={isModalOpen}/>
      </AuthProvider>
      </Provider>
     

   </>
      
    
    
  )
}

export default App
