import * as React from "react";
import {
  List,
  Datagrid,
  Edit,
  Create,
  SimpleForm,
  DateField,
  TextField,
  EditButton,
  TextInput,
  DateInput,
  useRecordContext,
  BooleanField,
  ReferenceArrayField,
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
export const PodrazdelenieIcon = BookIcon;

export const PodrazdelenieList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="from" />
      <DateField source="to" />
      <BooleanField source="isMale" />
      <BooleanField source="isV" />

      <EditButton />
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
      <TextInput source="from" />
      <TextInput source="to" />
      <TextInput source="isMale" />
      <TextInput source="isV" />
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
