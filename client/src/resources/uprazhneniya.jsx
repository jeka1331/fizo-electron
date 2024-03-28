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
  NumberField,
  NumberInput,
  required
  // BooleanField,
  // ReferenceArrayField,
  
} from "react-admin";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
export const UprazhnenieIcon = DirectionsRunIcon;

export const UprazhnenieList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="shortName" />

      <ReferenceField source="uprazhnenieRealValuesTypeId" reference="uprazhnenieRealValuesTypes">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="EfficiencyPreferenceId" reference="efficiencyPreferences">
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="step" />
      <NumberField source="valueToAddAfterMaxResult" />
      
      <EditButton />

    </Datagrid>
  </List>
);


export const UprazhnenieEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
      <TextInput source="shortName" />
      <ReferenceInput source="uprazhnenieRealValuesTypeId" reference="uprazhnenieRealValuesTypes">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="EfficiencyPreferenceId" reference="efficiencyPreferences">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="step" validate={[required()]} />
      <NumberInput source="valueToAddAfterMaxResult" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const UprazhnenieCreate = () => (
  <Create>
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
      <TextInput source="shortName" />
      <ReferenceInput source="uprazhnenieRealValuesTypeId" reference="uprazhnenieRealValuesTypes">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput source="EfficiencyPreferenceId" reference="efficiencyPreferences">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="step" validate={[required()]} />
      <NumberInput source="valueToAddAfterMaxResult" validate={[required()]} />
    </SimpleForm>
  </Create>
);
