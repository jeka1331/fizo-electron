// import * as React from "react";
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
  // DateInput,
  useRecordContext,
  // BooleanField,
  // ReferenceArrayField,
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
import { PodrazdelenieExportPostButton } from "../components/PodrazdelenieExportPostButton";
export const PodrazdelenieIcon = BookIcon;

export const PodrazdelenieList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />

      <EditButton />
      <PodrazdelenieExportPostButton label='Ведомость' />

    </Datagrid>
  </List>
);

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
