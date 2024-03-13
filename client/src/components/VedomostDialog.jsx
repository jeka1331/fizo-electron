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
import { SelectInput ,useTranslate} from "react-admin";

const ReportModal = ({ isOpen, handleClose, handleSubmit, podr}) => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const translate = useTranslate(); // returns the i18nProvider.translate() method

  // console.log(podr)
  const exportFunction = async (data) => {
    try {
      // console.log(data)
      if (!data.year || !data.month || !podr.id) {
        throw new Error("Неправильные параметры");
      }
      const response = await fetch(
        `http://localhost:3333/uprazhnenieResults/vedomost?year=${data.year}&month=${data.month}&podrId=${podr.id}`
      );

      if (response.ok) {
        // console.log(await response.json());
        let rjson = await response.json()
        rjson = JSON.stringify(rjson)
        const repResponce = await fetch(
          "http://localhost:3333/reports/podrtest",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: rjson,
          }
        );
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>{translate('dialogs.exportPodrazdelenie.title')}</DialogTitle>
      <DialogContent>
        <TextField
          label={translate('dialogs.exportPodrazdelenie.year')}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <TextField
          label={translate('dialogs.exportPodrazdelenie.month')}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
        {translate('ra.action.cancel')}
        </Button>
        <Button
          onClick={() => {
            exportFunction({ year: year, month: month, ...podr});
          }}
          color="primary"
        >
          {translate('ra.action.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportModal;
