import * as React from "react";
import {
  List,
  Datagrid,
  Edit,
  Create,
  SimpleForm,
  DateField,
  TextField,
  EditButton,
  TextInput,
  DateInput,
  useRecordContext,
  BooleanField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
export const PersonIcon = BookIcon;

export const PersonList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="lName" />
      <TextField source="fName" />
      <TextField source="sName" />
      <DateField source="dob" />
      {/* <ReferenceField source="zvanieId"  reference="zvaniya"/> */}
      <ReferenceField source="zvanieId" reference="zvaniya">
          <TextField source="name" />
      </ReferenceField>
      <BooleanField source="isMale" />
      <BooleanField source="isV" />
      <TextField source="rating" />
      <BooleanField source="isFree" />
      <DateField source="otpuskFrom" />
      <DateField source="otpuskTo" />
      <TextField source="comment" />
      <EditButton />
    </Datagrid>
  </List>
);

const PersonTitle = () => {
  const record = useRecordContext();
  return <span>Person {record ? `"${record.title}"` : ""}</span>;
};

export const PersonEdit = () => (
  <Edit title={<PersonTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="lName" />
      <TextInput source="fName" />
      <TextInput source="sName" />
      <DateInput source="dob" />
      {/* <ReferenceInput source="zvanieId" reference="zvaniya" /> */}
      <ReferenceInput source="zvanieId" reference="zvaniya">
        <SelectInput source="name" reference="zvaniya"/>
      </ReferenceInput>
      <BooleanField source="isMale" />
      <BooleanField source="isV" />
      <BooleanField source="isFree" />
      <DateInput source="otpuskFrom" />
      <DateInput source="otpuskTo" />
      <TextInput source="comment" options={{ multiline: true }} />
    </SimpleForm>
  </Edit>
);

export const PersonCreate = () => (
  <Create title="Create a Person">
    <SimpleForm>
      {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
      <TextInput source="lName" />
      <TextInput source="fName" />
      <TextInput source="sName" />
      <DateInput source="dob" />
      <ReferenceArrayField source="zvanie" />
      <BooleanField source="isMale" label="Мужчина"/>
      <BooleanField source="isV" label="Военнослужащий"/>
      <BooleanField source="isFree" label="Освобожден"/>
      <DateInput source="otpuskFrom" />
      <DateInput source="otpuskTo" />
      <TextInput source="comment" options={{ multiline: true }} />
    </SimpleForm>
  </Create>
);
