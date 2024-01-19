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
export const ZvanieIcon = BookIcon;

export const ZvanieList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />

      <EditButton />
    </Datagrid>
  </List>
);

const ZvanieTitle = () => {
  const record = useRecordContext();
  return <span>Zvanie {record ? `"${record.title}"` : ""}</span>;
};

export const ZvanieEdit = () => (
  <Edit title={<ZvanieTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export const ZvanieCreate = () => (
  <Create title="Create a Zvanie">
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);
