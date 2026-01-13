import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Provider from './Providers/Provider.jsx'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Provider>
        <App />
        <ToastContainer />
      </Provider>
    </Router>
  </StrictMode>
)
