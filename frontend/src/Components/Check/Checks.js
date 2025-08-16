import { Box } from "@mui/material";
import CheckForm from "./CheckForm";
import ChecksTable from "./ChecksTable";
import Axios from "axios";
import { useEffect, useState } from "react";

const Checks = () => {
  const [checks, setChecks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    getChecks();
  }, []);

  const getChecks = () => {
    Axios.get("http://localhost:3001/api/checks")
      .then((response) => {
        setChecks(response.data?.response || []);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const addCheck = (data) => {
    setSubmitted(true);

    const payload = {
      checkId: data.checkId,
      passengerName: data.passengerName,
      passportNumber: data.passportNumber,
      nationality: data.nationality,
      flightNumber: data.flightNumber,
      departure: data.departure,
      destination: data.destination,
      seatNumber: data.seatNumber,
      gateNumber: data.gateNumber,
      boardingTime: data.boardingTime,
      baggageCount: data.baggageCount,
      baggageWeight: data.baggageWeight,
      mealPreference: data.mealPreference,
      status: data.status,
    };

    Axios.post("http://localhost:3001/api/createcheck", payload)
      .then(() => {
        getChecks(); // Refresh list
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const updateCheck = (data) => {
    setSubmitted(true);

    const payload = {
      checkId: data.checkId,
      passengerName: data.passengerName,
      passportNumber: data.passportNumber,
      nationality: data.nationality,
      flightNumber: data.flightNumber,
      departure: data.departure,
      destination: data.destination,
      seatNumber: data.seatNumber,
      gateNumber: data.gateNumber,
      boardingTime: data.boardingTime,
      baggageCount: data.baggageCount,
      baggageWeight: data.baggageWeight,
      mealPreference: data.mealPreference,
      status: data.status,
    };

    Axios.post("http://localhost:3001/api/updatecheck", payload)
      .then(() => {
        getChecks(); // Refresh list
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const deleteCheck = (data) => {
    Axios.post("http://localhost:3001/api/deletecheck", data)
      .then(() => {
        getChecks(); // Refresh list
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
      <CheckForm
        addCheck={addCheck}
        updateCheck={updateCheck}
        submitted={submitted}
        data={selectedCheck}
        isEdit={isEdit}
      />

      <ChecksTable
        rows={checks}
        selectedCheck={(data) => {
          setSelectedCheck(data);
          setIsEdit(true);
        }}
        deleteCheck={(data) =>
          window.confirm("Are you sure?") && deleteCheck(data)
        }
      />
    </Box>
  );
};

export default Checks;
