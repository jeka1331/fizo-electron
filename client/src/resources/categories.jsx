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
  BooleanField,
  // ReferenceArrayField,
  BooleanInput,
  NumberInput,
  NumberField
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
export const CategoryIcon = BookIcon;

export const CategoryList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="from" step={1}/>
      <NumberField source="to" step={1}/>
      <BooleanField source="isMale" />
      <BooleanField source="isV" />

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
      <NumberInput source="from" step={1}/>
      <NumberInput source="to" step={1}/>
      <BooleanInput source="isMale" valueLabelTrue={MaleIcon} valueLabelFalse={FemaleIcon}  defaultValue={true} />
      <BooleanInput source="isV" label="Военнослужащий"/>
    </SimpleForm>
  </Edit>
);

export const CategoryCreate = () => (
  <Create>
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
      <NumberInput source="from" step={1}/>
      <NumberInput source="to" step={1}/>
      <BooleanInput source="isMale" valueLabelTrue={MaleIcon} valueLabelFalse={FemaleIcon}  defaultValue={true} />
      <BooleanInput source="isV" label="Военнослужащий"/>
    </SimpleForm>
  </Create>
);
