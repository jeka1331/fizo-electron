// import * as React from "react";
import { useState } from "react";
import {
  List,
  Datagrid,
  Edit,
  Create,
  SimpleForm,
  // DateField,
  TextField,
  EditButton,
  TextInput,
  Button,
  // DateInput,
  useRecordContext,
  // BooleanField,
  // ReferenceArrayField,
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
import { PodrazdelenieExportPostButton } from "../components/PodrazdelenieExportPostButton";
export const PodrazdelenieIcon = BookIcon;
import ReportModal from "../components/VedomostDialog";




export const PodrazdelenieList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />

      <EditButton />
      <Button onClick={handleOpenModal} label="Generate Report" />
      <ReportModal isOpen={isModalOpen} handleClose={handleCloseModal} handleSubmit={handleSubmit} />
      <PodrazdelenieExportPostButton label='Ведомость' />

    </Datagrid>
  </List>
)};

const PodrazdelenieTitle = () => {
  const record = useRecordContext();
  return <span>Podrazdelenie {record ? `"${record.title}"` : ""}</span>;
};

export const PodrazdelenieEdit = () => (
  <Edit title={<PodrazdelenieTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export const PodrazdelenieCreate = () => (
  <Create title="Создание подразделения">
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);
