import { Button, Grid, Input, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const PassengerForm = ({ addPassenger, updatePassenger, submitted, data, isEdit }) => {

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [baggage, setBaggage] = useState('');
  const [baggagePrice, setBaggagePrice] = useState('');
  const [meal, setMeal] = useState('');
  const [mealPrice, setMealPrice] = useState('');

  useEffect(() => {
    if (!submitted) {
      setId('');
      setName('');
      setDetails('');
      setBaggage('');
      setBaggagePrice('');
      setMeal('');
      setMealPrice('');
    }
  }, [submitted]);

  useEffect(() => {
    if (data && data.id && data.id !== 0) {
      setId(data.id);
      setName(data.name);
      setDetails(data.details || '');
      setBaggage(data.baggage || '');
      setBaggagePrice(data.baggagePrice || '');
      setMeal(data.meal || '');
      setMealPrice(data.mealPrice || '');
    }
  }, [data]);

  return (
    <Grid container spacing={2} sx={{ backgroundColor: '#fff', marginBottom: '30px', display: 'block', padding: '20px' }}>
      
      <Grid item xs={12}>
        <Typography component={'h1'} sx={{ color: '#000' }}>Passenger Form</Typography>
      </Grid>

      {/* Passenger ID */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="id" sx={labelStyle}>
          ID
        </Typography>
        <Input
          type="number"
          id="id"
          name="id"
          sx={{ width: '400px' }}
          value={id}
          onChange={e => setId(e.target.value)}
        />
      </Grid>

      {/* Passenger Name */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="name" sx={labelStyle}>
          Name
        </Typography>
        <Input
          type="text"
          id="name"
          name="name"
          sx={{ width: '400px' }}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </Grid>

      {/* Passenger Details */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="details" sx={labelStyle}>
          Details
        </Typography>
        <Input
          type="text"
          id="details"
          name="details"
          placeholder="Age, Passport No..."
          sx={{ width: '400px' }}
          value={details}
          onChange={e => setDetails(e.target.value)}
        />
      </Grid>

      {/* Baggage */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="baggage" sx={labelStyle}>
          Baggage
        </Typography>
        <Input
          type="text"
          id="baggage"
          name="baggage"
          placeholder="e.g. 20kg"
          sx={{ width: '400px' }}
          value={baggage}
          onChange={e => setBaggage(e.target.value)}
        />
      </Grid>

      {/* Baggage Price */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="baggagePrice" sx={labelStyle}>
          Baggage Price
        </Typography>
        <Input
          type="number"
          id="baggagePrice"
          name="baggagePrice"
          placeholder="LKR"
          sx={{ width: '400px' }}
          value={baggagePrice}
          onChange={e => setBaggagePrice(e.target.value)}
        />
      </Grid>

      {/* Meal */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="meal" sx={labelStyle}>
          Meal
        </Typography>
        <Input
          type="text"
          id="meal"
          name="meal"
          placeholder="e.g. Veg / Non-Veg"
          sx={{ width: '400px' }}
          value={meal}
          onChange={e => setMeal(e.target.value)}
        />
      </Grid>

      {/* Meal Price */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="mealPrice" sx={labelStyle}>
          Meal Price
        </Typography>
        <Input
          type="number"
          id="mealPrice"
          name="mealPrice"
          placeholder="LKR"
          sx={{ width: '400px' }}
          value={mealPrice}
          onChange={e => setMealPrice(e.target.value)}
        />
      </Grid>

      {/* Submit Button */}
      <Button
        sx={buttonStyle}
        onClick={() =>
          isEdit
            ? updatePassenger({ id, name, details, baggage, baggagePrice, meal, mealPrice })
            : addPassenger({ id, name, details, baggage, baggagePrice, meal, mealPrice })
        }
      >
        {isEdit ? 'Update' : 'Add'}
      </Button>
    </Grid>
  );
};

const labelStyle = { color: '#000', marginRight: '20px', fontSize: '16px', width: '150px', display: 'block' };
const buttonStyle = { margin: 'auto', marginBottom: '20px', backgroundColor: '#00c6e6', color: '#000', marginLeft: '15px', marginTop: '20px', '&:hover': { opacity: 0.7 } };

export default PassengerForm;
