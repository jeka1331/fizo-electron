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
      <NumberField source="maxResult" />
      <NumberField source="valueToAddAfterMaxResult" />
      
      <EditButton />

    </Datagrid>
  </List>
);

const UprazhnenieTitle = () => {
  const record = useRecordContext();
  return <span>Упражнение {record.name ? `"${record.name}"` : ""}</span>;
};

export const UprazhnenieEdit = () => (
  <Edit title={<UprazhnenieTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />
      <TextInput source="shortName" />
      <ReferenceInput source="uprazhnenieRealValuesTypeId" reference="uprazhnenieRealValuesTypes">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="maxResult" validate={[required()]} />
      <NumberInput source="valueToAddAfterMaxResult" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const UprazhnenieCreate = () => (
  <Create title="Создание упражнений">
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
      <TextInput source="shortName" />
      <ReferenceInput source="uprazhnenieRealValuesTypeId" reference="uprazhnenieRealValuesTypes">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <NumberInput source="maxResult" validate={[required()]} />
      <NumberInput source="valueToAddAfterMaxResult" validate={[required()]} />
    </SimpleForm>
  </Create>
);
