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
  ReferenceField,
  ReferenceInput,
  SelectInput,
  NumberInput,
  required,
  NumberField,
  DateInput,
  DateField
  // BooleanField,
  // ReferenceArrayField,
  
} from "react-admin";
import DoneAllIcon from '@mui/icons-material/DoneAll';
export const UprazhnenieResultIcon = DoneAllIcon;

export const UprazhnenieResultList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      
      <ReferenceField source="uprazhnenieId" reference="uprazhneniya">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="personId" reference="persons">
        <TextField source="lName" />
      </ReferenceField>
      <ReferenceField source="categoryId" reference="categories">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="result" />
      <DateField source="date" />
      <EditButton />

    </Datagrid>
  </List>
);

const UprazhnenieResultTitle = () => {
  const record = useRecordContext();
  return <span>UprazhnenieResult {record ? `"${record.title}"` : ""}</span>;
};



export const UprazhnenieResultEdit = () => (
  <Edit title={<UprazhnenieResultTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <ReferenceInput source="uprazhnenieId" reference="uprazhneniya" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="personId" reference="persons" validate={[required()]}>
        <SelectInput optionText="lName" />
      </ReferenceInput>
      <ReferenceInput source="categoryId" reference="categories" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      
      
      <NumberInput source="result" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const UprazhnenieResultCreate = () => (
  <Create title="Добавление результата">
    <SimpleForm>
    <ReferenceInput source="uprazhnenieId" reference="uprazhneniya" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="personId" reference="persons" validate={[required()]}>
        <SelectInput optionText="lName" />
      </ReferenceInput>
      <ReferenceInput source="categoryId" reference="categories" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="result" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
    </SimpleForm>
  </Create>
);
