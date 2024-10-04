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
  AutocompleteInput,
  // BooleanField,
  // ReferenceArrayField,
} from "react-admin";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { backendUrl } from "../dataProvider";
export const passingInMonthIcon = DoneAllIcon;
import { useState, useEffect } from "react";

export const passingInMonthList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <ReferenceField source="podrazdelenieId" reference="podrazdeleniya">
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
      <ReferenceField source="UprazhnenieId" reference="uprazhneniya">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="date" />
      <TextField source="ball" />
      <EditButton />
    </Datagrid>
  </List>
);



