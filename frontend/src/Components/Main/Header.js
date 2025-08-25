import React from 'react';
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="App-header">
      
      
      <div className="button-container">
        <button className="user-button" onClick={() => navigate('/users')}>Users</button>
        <button className="user-button" onClick={() => navigate('/schedules')}>Shedules</button>
         <button className="user-button" onClick={() => navigate('/staffs')}>Staff</button>
         <button className="user-button" onClick={() => navigate('/books')}>Booking</button>
          <button className="user-button" onClick={() => navigate('/passengers')}>Passenger</button>
            <button className="user-button" onClick={() => navigate('/checks')}>Checking</button>
              <button className="user-button" onClick={() => navigate('/payments')}>Payments</button>
           <button className="user-button" onClick={() => navigate('/registers')}>Register</button>
   


         
      </div>


     
    </header>
  );
};

export default Header;
