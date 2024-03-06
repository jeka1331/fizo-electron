// ReportModal.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { SelectInput } from "react-admin";

const ReportModal = ({ isOpen, handleClose, handleSubmit }) => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const handleGenerateReport = () => {
    handleSubmit({ year, month });
    handleClose(); // Закрываем модальное окно после отправки формы
  };
  const exportFunction = (data) => {
    try {
      if (!data.year && !data.month) {
        throw new Error("Неправильные параметры")
      }
      const response = fetch(
        `http://localhost:3333/uprazhnenieResults/vedomost?year=${data.year}&month=${data.month}`,
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = response.json();
      console.log("Response data:", responseData);
      return responseData;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Generate Report</DialogTitle>
      <DialogContent>
        <TextField
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {exportFunction({ year: year, month: month })}}
          color="primary"
        >
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportModal;
