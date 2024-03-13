import { useState } from "react";
import { Button, useRecordContext, useTranslate } from "react-admin";
import ReportModal from "./VedomostDialog";

export const GeneratePodrReportButton = (props) => {
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
  const record = useRecordContext();

  return (
    <>
    <Button onClick={handleOpenModal} label={translate('resources.podrazdeleniya.export.vedomost')} />
    <ReportModal isOpen={isModalOpen} handleClose={handleCloseModal} handleSubmit={handleSubmit} podr={record} />
    </>
  )
};
