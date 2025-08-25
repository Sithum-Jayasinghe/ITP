import './App.css';
import Header from './Components/Main/Header'; // ✅ Header Component
import BookForm from '../src/Components/Book/BookForm'; // ✅ Booking Form


function App() {
  return (
    <div className="App">
      <Header /> {/* Top Header */}

      {/* Welcome text at the top */}
      <h1 style={{ marginTop: "20px", textAlign: "center" }}>Welcome to AirGo</h1>

      {/* Centered Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh", // take most of screen height
          textAlign: "center",
        }}
      >
        {/* Booking Form (Centered) */}
        <BookForm />

       
      
      </div>
    </div>
  );
}

export default App;
