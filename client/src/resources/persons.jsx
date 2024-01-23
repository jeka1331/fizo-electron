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
  BooleanInput,
} from "react-admin";
import BookIcon from "@mui/icons-material/Book";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import { dataProvider } from "../dataProvider";




export const PersonList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="lName" />
      <TextField source="fName" />
      <TextField source="sName" />
      <DateField source="dob" />
      {/* <ReferenceField source="zvanieId"  reference="zvaniya"/> */}
      <ReferenceField source="zvanieId" reference="zvaniya" emptyText="Служащий ВС РК">
          <TextField source="name"/>
      </ReferenceField>
      <ReferenceField source="podrazdelenieId" reference="podrazdeleniya">
          <TextField source="name" />
      </ReferenceField>
      <BooleanField source="isMale" valueLabelTrue="Мужчина" valueLabelFalse="Женщина" TrueIcon={MaleIcon} FalseIcon={FemaleIcon} label="Пол"/>
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
  

  return <span> {record ? `${record.lName} ${record.fName} ${record.sName} ${record.isV ? "(Военнослужащий)" : "(Служащий ВС РК)"}` : ""}</span>;
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
        <SelectInput optionText="name"/>
      </ReferenceInput>
      <ReferenceInput source="podrazdelenieId" reference="podrazdeleniya">
        <SelectInput optionText="name"/>
      </ReferenceInput>
      <BooleanInput source="isMale" valueLabelTrue={MaleIcon} valueLabelFalse={FemaleIcon}  defaultValue={true} />
      <BooleanInput source="isV" label="Военнослужащий"/>
      <BooleanInput source="isFree"  label="Освобожден"/>
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
      <TextInput source="lName" required={true} />
      <TextInput source="fName"  required={true}/>
      <TextInput source="sName" />
      <DateInput source="dob"  required={true}/>
      <ReferenceInput source="zvanieId" reference="zvaniya" required={ true}>
        <SelectInput optionText="name"/>
      </ReferenceInput>
      <ReferenceInput source="podrazdelenieId" reference="podrazdeleniya">
        <SelectInput optionText="name"/>
      </ReferenceInput>
      <BooleanInput source="isMale" valueLabelTrue={MaleIcon} valueLabelFalse={FemaleIcon}  defaultValue={true} />
      <BooleanInput source="isV" label="Военнослужащий"/>
      <BooleanInput source="isFree" label="Освобожден"/>
      <DateInput source="otpuskFrom" />
      <DateInput source="otpuskTo" />
      <TextInput source="comment" options={{ multiline: true }} />
    </SimpleForm>
  </Create>
);
