import { Box } from "@mui/material";
import StaffForm from "./StaffForm";
import StaffsTable from "./StaffsTable";
import Axios from "axios";
import { useEffect, useState } from "react";

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  // Load staff list on mount
  useEffect(() => {
    getStaffs();
  }, []);

  const getStaffs = () => {
    Axios.get("http://localhost:3001/api/staffs")
      .then((response) => {
        setStaffs(response.data?.response || []);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const addStaff = (data) => {
    setSubmitted(true);

    const payload = {
      id: data.id,
      name: data.name,
      role: data.role,
      num: data.num,
      email: data.email,
      certificate: data.certificate,
      schedule: data.schedule,
      status: data.status,
    };

    Axios.post("http://localhost:3001/api/createstaff", payload)
      .then(() => {
        getStaffs();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const updateStaff = (data) => {
    setSubmitted(true);

    const payload = {
      id: data.id,
      name: data.name,
      role: data.role,
      num: data.num,
      email: data.email,
      certificate: data.certificate,
      schedule: data.schedule,
      status: data.status,
    };

    Axios.post("http://localhost:3001/api/updatestaff", payload)
      .then(() => {
        getStaffs();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const deleteStaff = (data) => {
    Axios.post("http://localhost:3001/api/deletestaff", data)
      .then(() => {
        getStaffs();
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
      <StaffForm
        addStaff={addStaff}
        updateStaff={updateStaff}
        submitted={submitted}
        data={selectedStaff}
        isEdit={isEdit}
      />

      <StaffsTable
        rows={staffs}
        selectedStaff={(data) => {
          setSelectedStaff(data);
          setIsEdit(true);
        }}
        deleteStaff={(data) =>
          window.confirm("Are you sure you want to delete this staff member?") &&
          deleteStaff(data)
        }
      />
    </Box>
  );
};

export default Staffs;
