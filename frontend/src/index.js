import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
//import Users from './Components/User/Users';
import Payments from './Components/Payment/Payments';
import Schedules from './Components/Schedule/Schedules';
import Staffs from './Components/Staff/staffs';
import Books from './Components/Book/Books';
import Passengers from './Components/Passenger/Passengers';
import Checks from './Components/Check/Checks';
import Registers from './Components/Register/Registers';


// 🟡 MUI X Date Picker support
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      
        
        <Route path="/payments" element={<Payments />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/staffs" element={<Staffs />} />
         <Route path="/books" element={<Books />} />
         <Route path="/passengers" element={<Passengers />} />
           <Route path="/checks" element={<Checks />} />
        <Route path="/registers" element={<Registers />} />


      </Routes>
    </BrowserRouter>
  </LocalizationProvider>
);
