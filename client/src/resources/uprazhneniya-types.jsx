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
export const UprazhneniieTypeIcon = BookIcon;

export const UprazhnenieTypeList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="shortName" />

      <EditButton />
    </Datagrid>
  </List>
);

const UprazhnenieTypeTitle = () => {
  const record = useRecordContext();
  return <span>Тип упражнения {record ? `"${record.title}"` : ""}</span>;
};

export const UprazhnenieTypeEdit = () => (
  <Edit title={<UprazhnenieTypeTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
      <TextInput source="shortName" />

    </SimpleForm>
  </Edit>
);

export const UprazhnenieTypeCreate = () => (
  <Create title="Создание типа упражнения">
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
      <TextInput source="shortName" />
    </SimpleForm>
  </Create>
);
