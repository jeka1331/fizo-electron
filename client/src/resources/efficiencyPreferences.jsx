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
  // ReferenceArrayField,
} from "react-admin";
import _EfficiencyPreferenceIcon from '@mui/icons-material/Category';
export const EfficiencyPreferenceIcon = _EfficiencyPreferenceIcon;

export const EfficiencyPreferenceList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />

      <EditButton />
    </Datagrid>
  </List>
);


export const EfficiencyPreferenceEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="name" />

    </SimpleForm>
  </Edit>
);

export const EfficiencyPreferenceCreate = () => (
  <Create>
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);
