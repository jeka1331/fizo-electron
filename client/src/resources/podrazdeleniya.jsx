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
  // BooleanField,
  // ReferenceArrayField,
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
export const PodrazdelenieIcon = BookIcon;
import { GeneratePodrReportButton } from "../components/GeneratePodrReportButton";




export const PodrazdelenieList = () => {
  const filters = [
    // eslint-disable-next-line react/jsx-key
    <TextInput source="name" />,

  ];
  const filter = () => {
    
  }
  return (
  <List filters={filters}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />

      <EditButton />
      <GeneratePodrReportButton />
      {/* <PodrazdelenieExportPostButton label='Ведомость' /> */}

    </Datagrid>
  </List>
)};

export const PodrazdelenieEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export const PodrazdelenieCreate = () => (
  <Create>
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);
