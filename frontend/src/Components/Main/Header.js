import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Tooltip,
  Badge,
  Chip,
  InputBase,
  alpha,
  Menu,
  MenuItem,
  Divider
} from "@mui/material";
import {
  FlightTakeoff,
  Event,
  People,
  FactCheck,
  Payment,
  Groups,
  PersonAdd,
  Search,
  AccountCircle,
  Notifications,
  Language,
  HelpOutline,
  Menu as MenuIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '300px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isActive = (path) => location.pathname === path;

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg, #1a2a6c 0%, #2b59c3 50%, #1e3c8a 100%)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
        mb: 2,
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', padding: '0 16px !important' }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="logo"
            onClick={() => navigate("/")}
            sx={{ 
              mr: 1,
              background: "linear-gradient(45deg, #fff 0%, #e0f7fa 100%)",
              "&:hover": {
                background: "linear-gradient(45deg, #e0f7fa 0%, #b2ebf2 100%)",
              }
            }}
          >
            <FlightTakeoff sx={{ color: "#1a2a6c" }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ 
              fontWeight: 800, 
              letterSpacing: 1.2,
              background: "linear-gradient(45deg, #fff 30%, #e0f7fa 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: { xs: 'none', sm: 'block' }
            }}
          >
            AirGo Airways
          </Typography>
        </Box>

        {/* Main Navigation - Top Row */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          flexGrow: 1,
          justifyContent: 'center'
        }}>
          {/* Top Navigation Row */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            mb: 0.5,
            justifyContent: 'center'
          }}>
            {/* Booking & Schedules */}
            <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
              <Tooltip title="Book your flight">
                <Button
                  color="inherit"
                  startIcon={<FlightTakeoff sx={{ fontSize: 18 }} />}
                  onClick={() => navigate("/books")}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: isActive("/books") ? 700 : 500,
                    background: isActive("/books") ? "rgba(255, 255, 255, 0.2)" : "transparent",
                    borderRadius: 1,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.15)",
                    }
                  }}
                >
                  BOOKING
                </Button>
              </Tooltip>

              <Tooltip title="View & Manage Schedules">
                <Button
                  color="inherit"
                  startIcon={<Event sx={{ fontSize: 18 }} />}
                  onClick={() => navigate("/schedules")}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: isActive("/schedules") ? 700 : 500,
                    background: isActive("/schedules") ? "rgba(255, 255, 255, 0.2)" : "transparent",
                    borderRadius: 1,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.15)",
                    }
                  }}
                >
                  SCHEDULES
                </Button>
              </Tooltip>
            </Box>

            {/* Divider */}
            <Box sx={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />

            {/* Secondary Navigation */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Tooltip title="Passenger Management">
                <Button
                  color="inherit"
                  onClick={() => navigate("/passengers")}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    py: 0.25,
                    fontSize: '0.7rem',
                    fontWeight: isActive("/passengers") ? 700 : 400,
                    background: isActive("/passengers") ? "rgba(255, 255, 255, 0.2)" : "transparent",
                    borderRadius: 0.5,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.15)",
                    }
                  }}
                >
                  PASSENGER
                </Button>
              </Tooltip>

              <Tooltip title="Check-in Details">
                <Button
                  color="inherit"
                  onClick={() => navigate("/checks")}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    py: 0.25,
                    fontSize: '0.7rem',
                    fontWeight: isActive("/checks") ? 700 : 400,
                    background: isActive("/checks") ? "rgba(255, 255, 255, 0.2)" : "transparent",
                    borderRadius: 0.5,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.15)",
                    }
                  }}
                >
                  CHECK-IN
                </Button>
              </Tooltip>

              <Tooltip title="Secure Payments">
                <Badge badgeContent={3} color="error" size="small">
                  <Button
                    color="inherit"
                    onClick={() => navigate("/payments")}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.7rem',
                      fontWeight: isActive("/payments") ? 700 : 400,
                      background: isActive("/payments") ? "rgba(255, 255, 255, 0.2)" : "transparent",
                      borderRadius: 0.5,
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.15)",
                      }
                    }}
                  >
                    PAYMENTS
                  </Button>
                </Badge>
              </Tooltip>

              <Tooltip title="Our Airline Staff">
                <Badge badgeContent={28} color="info" size="small">
                  <Button
                    color="inherit"
                    onClick={() => navigate("/staffs")}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.7rem',
                      fontWeight: isActive("/staffs") ? 700 : 400,
                      background: isActive("/staffs") ? "rgba(255, 255, 255, 0.2)" : "transparent",
                      borderRadius: 0.5,
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.15)",
                      }
                    }}
                  >
                    STAFF
                  </Button>
                </Badge>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Right Section - Search, User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          {/* Search Bar */}
          <SearchBar>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search flights..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchBar>

          {/* Action Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            <Tooltip title="Language">
              <IconButton color="inherit" size="small">
                <Language />
              </IconButton>
            </Tooltip>

            <Tooltip title="Help">
              <IconButton color="inherit" size="small">
                <HelpOutline />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit" size="small">
                <Badge badgeContent={5} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Register Button */}
          <Tooltip title="Register as a new user">
            <Button
              color="inherit"
              startIcon={<PersonAdd />}
              onClick={() => navigate("/registers")}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: isActive("/registers") ? 700 : 500,
                background: isActive("/registers") ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
                borderRadius: 1,
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.2)",
                },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              REGISTER
            </Button>
          </Tooltip>

          {/* User Profile */}
          <Tooltip title="Account">
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{
                background: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.2)",
                }
              }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            onClick={handleMobileMenuOpen}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 4.5,
            background: 'linear-gradient(135deg, #1a2a6c 0%, #2b59c3 100%)',
            color: 'white',
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>My Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My Bookings</MenuItem>
        <Divider sx={{ background: 'rgba(255, 255, 255, 0.2)' }} />
        <MenuItem onClick={handleMenuClose}>Sign Out</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;