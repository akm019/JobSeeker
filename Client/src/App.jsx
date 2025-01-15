import { useState } from 'react'
import { Outlet } from 'react-router'
import Navbar from './Components/Navbar'
import { AuthProvider } from './AuthContext.jsx'
import './App.css'
import { store } from './Store/Store.js'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';

function App() {
  const theme = createTheme(); // You can customize the theme here
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <Navbar onModalChange={(state) => setIsModalOpen(state)}/>
            <Outlet isModalOpen={isModalOpen}/>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </>
  
      
    
    
  )
}

export default App
