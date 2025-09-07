import { Button, Grid, Input, Typography, MenuItem, TextField, Box } from '@mui/material';
import { useEffect, useState } from 'react';

const baggageOptions = ["10kg", "15kg", "20kg", "25kg", "30kg"];
const mealOptions = ["Veg", "Non-Veg"];
const seatNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

const PassengerForm = ({ addPassenger, updatePassenger, submitted, data, isEdit, showAlert }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [baggage, setBaggage] = useState('');
  const [baggagePrice, setBaggagePrice] = useState(0);
  const [meal, setMeal] = useState('');
  const [mealPrice, setMealPrice] = useState(0);
  const [seat, setSeat] = useState(null);
  const [seatClass, setSeatClass] = useState('');

  useEffect(() => { if (!submitted) resetForm(); }, [submitted]);

  useEffect(() => {
    if (data && data.id) {
      setId(data.id);
      setName(data.name);
      setDetails(data.details || '');
      setBaggage(data.baggage || '');
      setMeal(data.meal || '');
      setSeat(data.seat || null);
      if (data.seat) setSeatClass(data.seat <= 20 ? "First Class" : "Economy");
    }
  }, [data]);

  useEffect(() => {
    setBaggagePrice(baggage ? parseInt(baggage.replace("kg","")) * 100 : 0);
  }, [baggage]);

  useEffect(() => {
    setMealPrice(meal === "Veg" ? 500 : meal === "Non-Veg" ? 700 : 0);
  }, [meal]);

  const resetForm = () => {
    setId(''); setName(''); setDetails(''); setBaggage(''); setBaggagePrice(0);
    setMeal(''); setMealPrice(0); setSeat(null); setSeatClass('');
  };

  const handleSeatClick = (num) => {
    setSeat(num);
    setSeatClass(num <= 20 ? "First Class" : "Economy");
  };

  const handleSubmit = () => {
    const passengerData = { id, name, details, baggage, baggagePrice, meal, mealPrice, seat };
    if (isEdit) {
      updatePassenger(passengerData);
      showAlert("Passenger Updated Successfully", "success");
    } else {
      addPassenger(passengerData);
      showAlert("Passenger Added Successfully", "success");
    }
  };

  return (
    <Grid container spacing={2} sx={{ backgroundColor: '#fff', marginBottom: '30px', padding: '20px', borderRadius: 2, boxShadow: 3 }}>
      <Grid item xs={12}><Typography variant="h5">Passenger Form</Typography></Grid>

      <Grid item xs={12} sm={6}>
        <Typography>ID</Typography>
        <Input type="number" fullWidth value={id} onChange={e => setId(e.target.value)} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography>Name</Typography>
        <Input type="text" fullWidth value={name} onChange={e => setName(e.target.value)} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography>Details</Typography>
        <Input placeholder="Age, Passport No..." fullWidth value={details} onChange={e => setDetails(e.target.value)} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField select label="Baggage" fullWidth value={baggage} onChange={e => setBaggage(e.target.value)}>
          {baggageOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
        <Typography sx={{ mt: 1 }}>Price: LKR {baggagePrice}</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField select label="Meal" fullWidth value={meal} onChange={e => setMeal(e.target.value)}>
          {mealOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </TextField>
        <Typography sx={{ mt: 1 }}>Price: LKR {mealPrice}</Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography>Select Seat:</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {seatNumbers.map(num => (
            <Button
              key={num}
              variant="contained"
              sx={{
                width: 50,
                height: 50,
                backgroundColor: seat === num ? "#00c6e6" : num <= 20 ? "#FFD700" : "#90CAF9",
                "&:hover": { opacity: 0.8 }
              }}
              onClick={() => handleSeatClick(num)}
            >
              {num}
            </Button>
          ))}
        </Box>
        {seat && <Typography mt={1}>Selected Seat: {seat} ({seatClass})</Typography>}
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          sx={{ boxShadow: 2 }}
          onClick={handleSubmit}
        >
          {isEdit ? "Update Passenger" : "Add Passenger"}
        </Button>
      </Grid>
    </Grid>
  );
};

export default PassengerForm;