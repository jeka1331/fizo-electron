import { useState } from "react";
import { Button, useTranslate } from "react-admin";
import {AllVedomostReportModal} from "./VedomostDialog";

export const DocumentsAllVedomostButton = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const translate = useTranslate(); // returns the i18nProvider.translate() method


  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async ({ startDate, endDate }) => {
    // Здесь можно отправить данные на сервер для генерации отчета
    // Или выполнить другие действия по вашему усмотрению
    console.log('Generating report for dates:', startDate, endDate);
  };

  return (
    <>
    <Button onClick={handleOpenModal} label={translate('documents.allVedomost.print')} />
    <AllVedomostReportModal isOpen={isModalOpen} handleClose={handleCloseModal} handleSubmit={handleSubmit} />
    </>
  )
};
