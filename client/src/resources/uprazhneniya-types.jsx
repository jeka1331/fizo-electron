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


export const UprazhnenieTypeEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
      <TextInput source="shortName" />

    </SimpleForm>
  </Edit>
);

export const UprazhnenieTypeCreate = () => (
  <Create>
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
      <TextInput source="shortName" />
    </SimpleForm>
  </Create>
);
