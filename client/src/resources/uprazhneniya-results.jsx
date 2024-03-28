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
  ReferenceField,
  ReferenceInput,
  SelectInput,
  NumberInput,
  required,
  NumberField,
  DateInput,
  DateField,
  AutocompleteInput
  // BooleanField,
  // ReferenceArrayField,
  
} from "react-admin";
import DoneAllIcon from '@mui/icons-material/DoneAll';
export const UprazhnenieResultIcon = DoneAllIcon;


export const UprazhnenieResultList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      
      <ReferenceField source="UprazhnenieId" reference="uprazhneniya">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="PersonId" reference="persons">
        <TextField source="lName" />
        
        <TextField source="fName" />
        <TextField source="sName" />
      </ReferenceField>
      <ReferenceField source="CategoryId" reference="categories">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="result" />
      <DateField source="date" />
      <EditButton />

    </Datagrid>
  </List>
);


export const UprazhnenieResultEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <ReferenceInput source="UprazhnenieId" reference="uprazhneniya" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="PersonId" reference="persons" validate={[required()]}>
        <AutocompleteInput optionText="lName" />
      </ReferenceInput>
      <ReferenceInput source="CategoryId" reference="categories" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      
      
      <NumberInput source="result" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const UprazhnenieResultCreate = () => {
  const filterToQuery = searchText => ({ lName: `%${searchText}%` });

  
  return (
  
  <Create title="Добавление результата">
    <SimpleForm>
    <ReferenceInput source="UprazhnenieId" reference="uprazhneniya" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="PersonId" reference="persons" validate={[required()]}>
      <AutocompleteInput optionText="lName" filterToQuery={filterToQuery}/>
      </ReferenceInput>
      <ReferenceInput source="CategoryId" reference="categories" validate={[required()]}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="result" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
    </SimpleForm>
  </Create>
)};
