import React from 'react';
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="App-header">
      
      
      <div className="button-container">
        <button className="user-button" onClick={() => navigate('/users')}>Users</button>
        <button className="user-button" onClick={() => navigate('/payments')}>Payments</button>
        <button className="user-button" onClick={() => navigate('/schedules')}>Shedules</button>
         <button className="user-button" onClick={() => navigate('/staffs')}>Staff</button>


        
        <button className="user-button" onClick={() => navigate('/register')}>Register</button>
        <button className="user-button" onClick={() => navigate('/login')}>Login</button>
        <button className="user-button" onClick={() => navigate('/logout')}>Logout</button>
         
      </div>


     
    </header>
  );
};

export default Header;
