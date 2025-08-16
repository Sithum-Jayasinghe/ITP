import { Box } from "@mui/material";
import PassengerForm from "./PassengerForm";
import PassengersTable from "./PassengersTable";
import Axios from "axios";
import { useEffect, useState } from "react";

const Passengers = () => {
  const [passengers, setPassengers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    getPassengers();
  }, []);

  const getPassengers = () => {
    Axios.get("http://localhost:3001/api/passengers")
      .then((response) => {
        setPassengers(response.data?.response || []);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const addPassenger = (data) => {
    setSubmitted(true);

    const payload = {
      id: data.id,
      name: data.name,
      details: data.details,
      baggage: data.baggage,
      baggagePrice: data.baggagePrice,
      meal: data.meal,
      mealPrice: data.mealPrice,
    };

    Axios.post("http://localhost:3001/api/createpassenger", payload)
      .then(() => {
        getPassengers();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const updatePassenger = (data) => {
    setSubmitted(true);

    const payload = {
      id: data.id,
      name: data.name,
      details: data.details,
      baggage: data.baggage,
      baggagePrice: data.baggagePrice,
      meal: data.meal,
      mealPrice: data.mealPrice,
    };

    Axios.post("http://localhost:3001/api/updatepassenger", payload)
      .then(() => {
        getPassengers();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const deletePassenger = (data) => {
    Axios.post("http://localhost:3001/api/deletepassenger", data)
      .then(() => {
        getPassengers();
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  return (
    <Box
      sx={{
        width: "calc(100% - 100px)",
        margin: "auto",
        marginTop: "100px",
      }}
    >
      <PassengerForm
        addPassenger={addPassenger}
        updatePassenger={updatePassenger}
        submitted={submitted}
        data={selectedPassenger}
        isEdit={isEdit}
      />

      <PassengersTable
        rows={passengers}
        selectedPassenger={(data) => {
          setSelectedPassenger(data);
          setIsEdit(true);
        }}
        deletePassenger={(data) =>
          window.confirm("Are you sure you want to delete this passenger?") &&
          deletePassenger(data)
        }
      />
    </Box>
  );
};

export default Passengers;
