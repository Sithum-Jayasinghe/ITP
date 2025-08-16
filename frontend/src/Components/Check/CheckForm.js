import { Button, Grid, Input, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const CheckForm = ({ addCheck, updateCheck, submitted, data, isEdit }) => {
  const [checkId, setCheckId] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [boardingTime, setBoardingTime] = useState('');
  const [baggageCount, setBaggageCount] = useState('');
  const [baggageWeight, setBaggageWeight] = useState('');
  const [mealPreference, setMealPreference] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!submitted) {
      setCheckId('');
      setPassengerName('');
      setPassportNumber('');
      setNationality('');
      setFlightNumber('');
      setDeparture('');
      setDestination('');
      setSeatNumber('');
      setGateNumber('');
      setBoardingTime('');
      setBaggageCount('');
      setBaggageWeight('');
      setMealPreference('');
      setStatus('');
    }
  }, [submitted]);

  useEffect(() => {
    if (data && data.checkId) {
      setCheckId(data.checkId);
      setPassengerName(data.passengerName);
      setPassportNumber(data.passportNumber);
      setNationality(data.nationality);
      setFlightNumber(data.flightNumber);
      setDeparture(data.departure);
      setDestination(data.destination);
      setSeatNumber(data.seatNumber);
      setGateNumber(data.gateNumber);
      setBoardingTime(data.boardingTime);
      setBaggageCount(data.baggageCount);
      setBaggageWeight(data.baggageWeight);
      setMealPreference(data.mealPreference);
      setStatus(data.status);
    }
  }, [data]);

  const formField = (label, id, value, onChange, type = "text") => (
    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        component={'label'}
        htmlFor={id}
        sx={{ color: '#000', marginRight: '20px', fontSize: '16px', width: '180px', display: 'block' }}
      >
        {label}
      </Typography>
      <Input
        type={type}
        id={id}
        name={id}
        sx={{ width: '400px' }}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </Grid>
  );

  return (
    <Grid container spacing={2} sx={{ backgroundColor: '#fff', marginBottom: '30px', display: 'block', padding: '20px' }}>
      <Grid item xs={12}>
        <Typography component={'h1'} sx={{ color: '#000', marginBottom: '15px' }}>Check Form</Typography>
      </Grid>

      {formField("Check ID", "checkId", checkId, setCheckId, "number")}
      {formField("Passenger Name", "passengerName", passengerName, setPassengerName)}
      {formField("Passport Number", "passportNumber", passportNumber, setPassportNumber)}
      {formField("Nationality", "nationality", nationality, setNationality)}
      {formField("Flight Number", "flightNumber", flightNumber, setFlightNumber)}
      {formField("Departure Airport", "departure", departure, setDeparture)}
      {formField("Destination Airport", "destination", destination, setDestination)}
      {formField("Seat Number", "seatNumber", seatNumber, setSeatNumber)}
      {formField("Gate Number", "gateNumber", gateNumber, setGateNumber)}
      {formField("Boarding Time", "boardingTime", boardingTime, setBoardingTime, "time")}
      {formField("Baggage Count", "baggageCount", baggageCount, setBaggageCount, "number")}
      {formField("Baggage Weight (kg)", "baggageWeight", baggageWeight, setBaggageWeight, "number")}
      {formField("Meal Preference", "mealPreference", mealPreference, setMealPreference)}
      {formField("Status", "status", status, setStatus)}

      <Button
        sx={{
          margin: 'auto',
          marginBottom: '20px',
          backgroundColor: '#00c6e6',
          color: '#000',
          marginLeft: '15px',
          marginTop: '20px',
          '&:hover': { opacity: 0.7 }
        }}
        onClick={() =>
          isEdit
            ? updateCheck({
                checkId,
                passengerName,
                passportNumber,
                nationality,
                flightNumber,
                departure,
                destination,
                seatNumber,
                gateNumber,
                boardingTime,
                baggageCount,
                baggageWeight,
                mealPreference,
                status,
              })
            : addCheck({
                checkId,
                passengerName,
                passportNumber,
                nationality,
                flightNumber,
                departure,
                destination,
                seatNumber,
                gateNumber,
                boardingTime,
                baggageCount,
                baggageWeight,
                mealPreference,
                status,
              })
        }
      >
        {isEdit ? 'Update' : 'Add'}
      </Button>
    </Grid>
  );
};

export default CheckForm;
