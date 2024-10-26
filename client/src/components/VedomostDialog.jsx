// ReportModal.js
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useTranslate } from "react-admin";
import { backendUrl } from "../dataProvider";



const ReportModal = ({ isOpen, handleClose, handleSubmit, podr }) => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const translate = useTranslate(); // returns the i18nProvider.translate() method

  // console.log(podr)
  const exportFunction = async (data) => {
    try {
      if (!podr) {
        throw new Error("Отстутствует подразделение в пропсах")
      }
      // console.log(data)
      if (!data.year || !data.month || !podr.id) {
        throw new Error("Неправильные параметры");
      }
      const response = await fetch(
        `${backendUrl}/uprazhnenieResults/vedomost?year=${data.year}&month=${data.month}&podrId=${podr.id}`
      );

      if (response.ok) {
        // console.log(await response.json());
        let rjson = await response.json()
        rjson = JSON.stringify(rjson)
        const repResponce = await fetch(
          `${backendUrl}/reports/podrtest`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: rjson,
          }
        );
        return (await repResponce.text());
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handlePrint = async () => {
    const htmlContent = await exportFunction({ year: year, month: month, ...podr });
    const newTab = window.open();
    newTab.document.body.innerHTML = htmlContent;

    newTab.print()
    newTab.close();
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
          onClick={async () => {
            await handlePrint()
          }}
          color="primary"
        >
          {translate('ra.action.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AllVedomostReportModal = ({ isOpen, handleClose, handleSubmit }) => {
  const [year, setYear] = useState(((new Date()).getFullYear()));
  const [month, setMonth] = useState(((new Date()).getMonth() + 1));
  const translate = useTranslate(); // returns the i18nProvider.translate() method
  const handlePrint = async () => {
    const htmlContent = await exportFunction({ year: year, month: month });
    const newTab = window.open();
    newTab.document.body.innerHTML = htmlContent;

    newTab.print()
    newTab.close();
  };
  const exportFunction = async (data) => {
    try {

      // console.log(data)
      if (!data.year || !data.month) {
        throw new Error("Неправильные параметры");
      }
      const response = await fetch(
        `${backendUrl}/uprazhnenieResults/allVedomost?year=${data.year}&month=${data.month}`
      );

      if (response.ok) {
        // console.log(await response.json());
        let rjson = await response.json()
        rjson = JSON.stringify(rjson)
        const repResponce = await fetch(
          `${backendUrl}/reports/allVedomost`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: rjson,
          }
        );
        return (await repResponce.text());

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
          value={year ? year : null}
          onChange={(e) => setYear(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <TextField
          label={translate('dialogs.exportPodrazdelenie.month')}
          value={month ? month : null}
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
          onClick={async () => {
            await handlePrint()
          }}
          color="primary"
        >
          {translate('ra.action.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { AllVedomostReportModal }

export default ReportModal;
