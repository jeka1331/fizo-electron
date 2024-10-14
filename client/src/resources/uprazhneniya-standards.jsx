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
  NumberField
  // BooleanField,
  // ReferenceArrayField,
  
} from "react-admin";
import SsidChartIcon from '@mui/icons-material/SsidChart';
export const UprazhnenieStandardIcon = SsidChartIcon;

export const UprazhnenieStandardList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      
      <ReferenceField source="UprazhnenieId" reference="uprazhneniya">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="CategoryId" reference="categories">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="value" />
      <NumberField source="result" />
      <EditButton />

    </Datagrid>
  </List>
);



export const UprazhnenieStandardEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <ReferenceInput source="UprazhnenieId" reference="uprazhneniya">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="CategoryId" reference="categories">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="value" validate={[required()]} />
      <NumberInput source="result" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const UprazhnenieStandardCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="UprazhnenieId" reference="uprazhneniya">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="CategoryId" reference="categories">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="value" validate={[required()]} />
      <NumberInput source="result" validate={[required()]} />
    </SimpleForm>
  </Create>
);
