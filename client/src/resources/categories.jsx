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
  // ReferenceArrayField,
} from "react-admin";
import _CategoryIcon from '@mui/icons-material/Category';
export const CategoryIcon = _CategoryIcon;

export const CategoryList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="shortName" />

      <EditButton />
    </Datagrid>
  </List>
);

const CategoryTitle = () => {
  const record = useRecordContext();
  return <span>Category {record ? `"${record.title}"` : ""}</span>;
};

export const CategoryEdit = () => (
  <Edit title={<CategoryTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
      <TextInput source="shortName" />

    </SimpleForm>
  </Edit>
);

export const CategoryCreate = () => (
  <Create>
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
      <TextInput source="shortName" />

    </SimpleForm>
  </Create>
);
