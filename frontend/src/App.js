import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Header from './Components/Main/Header';
import BookForm from '../src/Components/Book/BookForm';
import Chatbot from './Components/Chatbot/Chatbot';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Grow
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Plane from './Components/Images/plane.png';
import Logo from './Components/Images/logo.png';

// Keyframe animations
const float = keyframes`
  0% { transform: translate(-50%, -50%) perspective(800px) rotateX(10deg) rotateY(0deg); }
  50% { transform: translate(-50%, -45%) perspective(800px) rotateX(10deg) rotateY(5deg); }
  100% { transform: translate(-50%, -50%) perspective(800px) rotateX(10deg) rotateY(0deg); }
`;

const floatCloud = keyframes`
  0% { transform: translateX(-100px); }
  100% { transform: translateX(calc(100vw + 100px)); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled components
const TrendingContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1200,
  margin: '0 auto',
}));

const DestinationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: 16,
  boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  minWidth: 320,
  marginRight: theme.spacing(2),
  overflow: 'hidden',
  cursor: 'pointer',
  animation: `${fadeIn} 0.5s ease forwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
  },
}));

const DestinationImage = styled(Box)(({ theme, imageUrl }) => ({
  height: 200,
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))',
    transition: 'all 0.3s ease',
  },
  '&:hover::before': {
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
  }
}));

const ScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 0),
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
}));

const PriceText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  fontSize: '1.25rem',
  marginTop: theme.spacing(1),
  background: 'linear-gradient(90deg, #1a2a6c, #2b59c3, #1a2a6c)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 3s infinite linear`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const FilterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: 'rgba(248, 249, 250, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.5)',
  animation: `${fadeIn} 0.8s ease forwards`,
}));

const ScrollButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  zIndex: 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    transform: 'translateY(-50%) scale(1.1)',
  },
}));

// Logo Styled Component
const LogoImage = styled('img')({
  position: 'absolute',
  top: 20,
  left: 20,
  height: '50px',
  zIndex: 1000,
});

// Plane background wrapper
const BackgroundWrapper = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: -1,
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
});

const AnimatedPlane = styled('img')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '70%',
  maxWidth: '900px',
  transform: 'translate(-50%, -50%) perspective(800px) rotateX(10deg) rotateY(0deg)',
  animation: `${float} 8s ease-in-out infinite`,
  opacity: 0.15,
  pointerEvents: 'none',
});

// Cloud elements
const Cloud = styled('div')({
  position: 'absolute',
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '50%',
  filter: 'blur(12px)',
  zIndex: -1,
  animation: `${floatCloud} 30s linear infinite`,
});

// Animated route path
const RoutePath = styled('div')({
  position: 'absolute',
  height: '2px',
  background: 'rgba(26, 42, 108, 0.3)',
  transformOrigin: '0 0',
  zIndex: -1,
});

// Floating particles
const Particle = styled('div')({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.6)',
  animation: `${float} 15s infinite ease-in-out`,
});

// High-quality destination images from Unsplash
const destinationImages = {
  "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&auto=format",
  "Riyadh": "https://images.unsplash.com/photo-1641862365827-87faced8e7f8?w=600&h=400&fit=crop&auto=format",
  "Melbourne": "https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=600&h=400&fit=crop&auto=format",
  "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop&auto=format",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop&auto=format",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&auto=format",
  "Paris": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&h=400&fit=crop&auto=format",
  "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop&auto=format",
  "Bangkok": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop&auto=format",
  "Kuala Lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=400&fit=crop&auto=format",
  "Mumbai": "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&h=400&fit=crop&auto=format",
  "Delhi": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop&auto=format",
  "Hong Kong": "https://images.unsplash.com/photo-1508059637722-d2f1bf8d2e72?w=600&h=400&fit=crop&auto=format",
  "Seoul": "https://images.unsplash.com/photo-1534274867514-d5b47ef89edb?w=600&h=400&fit=crop&auto=format",
  "Frankfurt": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop&auto=format",
  "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop&auto=format",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop&auto=format",
  "Los Angeles": "https://images.unsplash.com/photo-1515896769750-31548aa180f8?w=600&h=400&fit=crop&auto=format",
  "Toronto": "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=600&h=400&fit=crop&auto=format",
  "Zurich": "https://images.unsplash.com/photo-1515488768410-cb1b1f3de5a9?w=600&h=400&fit=crop&auto=format"
};

// Trending destinations data
const trendingDestinations = [
  { id: 1, route: "Colombo (CMB) to Dubai (DXB)", city: "Dubai", dates: "11/05/2025 - 02/02/2026", price: "LKR 111,846", seen: "a day ago", details: "Round-trip, Economy" },
  { id: 2, route: "Colombo (CMB) to Riyadh (RUH)", city: "Riyadh", dates: "10/01/2025 - 11/14/2025", price: "LKR 171,842", seen: "a day ago", details: "Round-trip, Economy" },
  { id: 3, route: "Colombo (CMB) to Melbourne (MEL)", city: "Melbourne", dates: "09/02/2025 - 10/30/2025", price: "LKR 308,084", seen: "a day ago", details: "Round-trip, Economy" },
  { id: 4, route: "Colombo (CMB) to Singapore (SIN)", city: "Singapore", dates: "12/01/2025 - 03/15/2026", price: "LKR 89,500", seen: "2 days ago", details: "Round-trip, Economy" },
  { id: 5, route: "Colombo (CMB) to London (LHR)", city: "London", dates: "01/05/2025 - 03/20/2026", price: "LKR 245,670", seen: "3 days ago", details: "Round-trip, Economy" },
  { id: 6, route: "Colombo (CMB) to Tokyo (NRT)", city: "Tokyo", dates: "02/10/2025 - 04/25/2026", price: "LKR 321,890", seen: "4 days ago", details: "Round-trip, Economy" },
  { id: 7, route: "Colombo (CMB) to Paris (CDG)", city: "Paris", dates: "03/15/2025 - 05/30/2026", price: "LKR 278,450", seen: "5 days ago", details: "Round-trip, Economy" },
  { id: 8, route: "Colombo (CMB) to Sydney (SYD)", city: "Sydney", dates: "04/20/2025 - 07/05/2026", price: "LKR 356,780", seen: "6 days ago", details: "Round-trip, Economy" },
  { id: 9, route: "Colombo (CMB) to Bangkok (BKK)", city: "Bangkok", dates: "05/25/2025 - 08/10/2026", price: "LKR 98,760", seen: "a week ago", details: "Round-trip, Economy" },
  { id: 10, route: "Colombo (CMB) to Kuala Lumpur (KUL)", city: "Kuala Lumpur", dates: "06/30/2025 - 09/15/2026", price: "LKR 102,340", seen: "a week ago", details: "Round-trip, Economy" },
  { id: 11, route: "Colombo (CMB) to Mumbai (BOM)", city: "Mumbai", dates: "07/05/2025 - 10/20/2026", price: "LKR 87,650", seen: "a week ago", details: "Round-trip, Economy" },
  { id: 12, route: "Colombo (CMB) to Delhi (DEL)", city: "Delhi", dates: "08/10/2025 - 11/25/2026", price: "LKR 92,130", seen: "2 weeks ago", details: "Round-trip, Economy" },
  { id: 13, route: "Colombo (CMB) to Hong Kong (HKG)", city: "Hong Kong", dates: "09/15/2025 - 12/30/2026", price: "LKR 189,470", seen: "2 weeks ago", details: "Round-trip, Economy" },
  { id: 14, route: "Colombo (CMB) to Seoul (ICN)", city: "Seoul", dates: "10/20/2025 - 01/05/2027", price: "LKR 267,890", seen: "2 weeks ago", details: "Round-trip, Economy" },
  { id: 15, route: "Colombo (CMB) to Frankfurt (FRA)", city: "Frankfurt", dates: "11/25/2025 - 02/10/2027", price: "LKR 298,760", seen: "3 weeks ago", details: "Round-trip, Economy" },
  { id: 16, route: "Colombo (CMB) to Istanbul (IST)", city: "Istanbul", dates: "12/30/2025 - 03/15/2027", price: "LKR 213,450", seen: "3 weeks ago", details: "Round-trip, Economy" },
  { id: 17, route: "Colombo (CMB) to New York (JFK)", city: "New York", dates: "01/05/2026 - 04/20/2027", price: "LKR 412,340", seen: "3 weeks ago", details: "Round-trip, Economy" },
  { id: 18, route: "Colombo (CMB) to Los Angeles (LAX)", city: "Los Angeles", dates: "02/10/2026 - 05/25/2027", price: "LKR 456,780", seen: "a month ago", details: "Round-trip, Economy" },
  { id: 19, route: "Colombo (CMB) to Toronto (YYZ)", city: "Toronto", dates: "03/15/2026 - 06/30/2027", price: "LKR 389,120", seen: "a month ago", details: "Round-trip, Economy" },
  { id: 20, route: "Colombo (CMB) to Zurich (ZRH)", city: "Zurich", dates: "04/20/2026 - 08/05/2027", price: "LKR 345,670", seen: "a month ago", details: "Round-trip, Economy" }
];

function App() {
  const [selectedRoute, setSelectedRoute] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [budget, setBudget] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef(null);
  const [clouds, setClouds] = useState([]);
  const [particles, setParticles] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Generate random clouds, particles and routes on component mount
  useEffect(() => {
    // Clouds
    const initialClouds = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      width: `${100 + Math.random() * 200}px`,
      height: `${60 + Math.random() * 100}px`,
      delay: `${Math.random() * 30}s`,
      duration: `${40 + Math.random() * 80}s`,
      opacity: `${0.3 + Math.random() * 0.5}`,
    }));
    setClouds(initialClouds);

    // Particles
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${2 + Math.random() * 4}px`,
      delay: `${Math.random() * 15}s`,
      duration: `${20 + Math.random() * 40}s`,
    }));
    setParticles(initialParticles);

    // Route paths
    const initialRoutes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: `${10 + Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      width: `${100 + Math.random() * 300}px`,
      angle: `${Math.random() * 360}deg`,
      delay: `${Math.random() * 5}s`,
      duration: `${15 + Math.random() * 30}s`,
    }));
    setRoutes(initialRoutes);
  }, []);

  const handleClearFilters = () => {
    setSelectedRoute('');
    setDepartureDate('');
    setBudget('');
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      setIsScrolling(true);
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      setIsScrolling(true);
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  const getImageUrl = (city) => {
    return destinationImages[city] || `https://via.placeholder.com/600x400/1a2a6c/ffffff?text=${encodeURIComponent(city)}`;
  };

  return (
    <div className="App">
      {/* Logo at the top left corner */}
      <LogoImage src={Logo} alt="AirGo Logo" />
      
      {/* 3D Plane Background with Clouds, Particles and Routes */}
      <BackgroundWrapper>
        <AnimatedPlane src={Plane} alt="Flying plane" />
        
        {/* Cloud elements */}
        {clouds.map(cloud => (
          <Cloud
            key={cloud.id}
            style={{
              top: cloud.top,
              left: cloud.left,
              width: cloud.width,
              height: cloud.height,
              opacity: cloud.opacity,
              animationDelay: cloud.delay,
              animationDuration: cloud.duration,
            }}
          />
        ))}
        
        {/* Route paths */}
        {routes.map(route => (
          <RoutePath
            key={route.id}
            style={{
              top: route.top,
              left: route.left,
              width: route.width,
              transform: `rotate(${route.angle})`,
              animationDelay: route.delay,
              animationDuration: route.duration,
            }}
          />
        ))}
        
        {/* Floating particles */}
        {particles.map(particle => (
          <Particle
            key={particle.id}
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </BackgroundWrapper>

      <Header />
      
      {/* Welcome Section with Booking Form */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh", 
        textAlign: "center",
        padding: 4,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Fade in={true} timeout={1000}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1a2a6c', 
                mb: 2,
                background: 'linear-gradient(45deg, #1a2a6c, #2b59c3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${pulse} 2s infinite`,
              }}
            >
              Welcome to AirGo
            </Typography>
            <Slide direction="down" in={true} timeout={800}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Book your next flight with ease and explore the world
              </Typography>
            </Slide>
            <Grow in={true} timeout={1200}>
              <Box>
                <BookForm />
              </Box>
            </Grow>
          </Box>
        </Fade>
        
        {/* Animated flight icons */}
        <FlightTakeoffIcon 
          sx={{ 
            position: 'absolute', 
            top: '20%', 
            left: '10%', 
            fontSize: 40, 
            color: '#1a2a6c',
            opacity: 0.7,
            animation: `${float} 6s infinite ease-in-out`,
          }} 
        />
        <FlightLandIcon 
          sx={{ 
            position: 'absolute', 
            bottom: '20%', 
            right: '10%', 
            fontSize: 40, 
            color: '#2b59c3',
            opacity: 0.7,
            animation: `${float} 7s infinite ease-in-out reverse`,
          }} 
        />
      </Box>

      {/* Trending Destinations Section */}
      <TrendingContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: '#1a2a6c', mr: 2 }} />
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1a2a6c' }}
          >
            Trending destinations
          </Typography>
        </Box>
        
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Discover the most popular flight routes with amazing deals
        </Typography>

        {/* Filter Section */}
        <FilterSection>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 'bold' }}>
              Select route
            </Typography>
            <select 
              value={selectedRoute} 
              onChange={(e) => setSelectedRoute(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <option value="">All routes</option>
              {trendingDestinations.map((dest) => (
                <option key={dest.id} value={dest.route}>{dest.route}</option>
              ))}
            </select>
          </Box>

          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 'bold' }}>
              Departure Date
            </Typography>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
            />
          </Box>

          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" display="block" gutterBottom sx={{ fontWeight: 'bold' }}>
              Budget
            </Typography>
            <select 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                transition: 'all 0.3s ease',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <option value="">Any budget</option>
              <option value="100000">Under LKR 100,000</option>
              <option value="200000">Under LKR 200,000</option>
              <option value="300000">Under LKR 300,000</option>
              <option value="400000">Under LKR 400,000</option>
              <option value="500000">Under LKR 500,000</option>
            </select>
          </Box>

          <Button 
            variant="outlined" 
            onClick={handleClearFilters} 
            sx={{ 
              alignSelf: 'flex-end', 
              mb: 0.5,
              animation: `${pulse} 2s infinite`,
            }}
          >
            Clear Filters
          </Button>
        </FilterSection>

        <Divider sx={{ my: 3 }} />

        {/* Horizontal Scroll Container with Navigation Buttons */}
        <Box sx={{ position: 'relative' }}>
          <ScrollButton onClick={scrollLeft} sx={{ left: -20 }}>
            <ChevronLeftIcon />
          </ScrollButton>
          
          <ScrollContainer ref={scrollRef}>
            {trendingDestinations.map((destination, index) => (
              <Zoom in={!isScrolling} timeout={500} key={destination.id} style={{ transitionDelay: `${index * 100}ms` }}>
                <DestinationCard>
                  <DestinationImage imageUrl={getImageUrl(destination.city)}>
                    {!destinationImages[destination.city] && (
                      <Typography 
                        variant="h6" 
                        sx={{ color: 'white', zIndex: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontSize: '1.2rem', fontWeight: 'bold' }}
                      >
                        {destination.city}
                      </Typography>
                    )}
                  </DestinationImage>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FlightTakeoffIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {destination.route}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                      {destination.dates}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">From</Typography>
                      <PriceText>{destination.price}*</PriceText>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                        Seen: {destination.seen}
                      </Typography>
                      <Chip 
                        label={destination.details} 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          fontSize: '0.7rem', 
                          backgroundColor: '#e3f2fd',
                          animation: `${pulse} 3s infinite`,
                        }} 
                      />
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      fullWidth 
                      sx={{ 
                        mt: 2, 
                        backgroundColor: '#1a2a6c', 
                        '&:hover': { 
                          backgroundColor: '#2b59c3',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(43, 89, 195, 0.4)',
                        }, 
                        py: 1, 
                        fontSize: '0.8rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Book now
                    </Button>
                  </Box>
                </DestinationCard>
              </Zoom>
            ))}
          </ScrollContainer>

          <ScrollButton onClick={scrollRight} sx={{ right: -20 }}>
            <ChevronRightIcon />
          </ScrollButton>
        </Box>

        {/* Additional Info Box */}
        <Zoom in={true} timeout={1000}>
          <Box sx={{ 
            mt: 6, 
            p: 3, 
            backgroundColor: 'rgba(232, 245, 233, 0.8)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(46, 125, 50, 0.2)',
            display: 'flex',
            alignItems: 'center',
            animation: `${pulse} 2s infinite`,
          }}>
            <LocalOfferIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                ✈️ Special Offer!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Book any of these trending destinations today and get <strong>10% off</strong> on your next booking! 
                Use promo code: <strong>AIRGO10</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offer valid until December 31, 2025. Terms and conditions apply.
              </Typography>
            </Box>
          </Box>
        </Zoom>
      </TrendingContainer>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}

export default App;