import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import Users from './Components/User/Users';
import Payments from './Components/Payment/Payments';
import Schedules from './Components/Schedule/Schedules';
import Register from './Components/Reg/Register';
import Login from './Components/Reg/Login';
import Logout from './Components/Reg/Logout';
import Staffs from './Components/Staff/staffs';

// 🟡 MUI X Date Picker support
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/staffs" element={<Staffs />} />
      </Routes>
    </BrowserRouter>
  </LocalizationProvider>
);
