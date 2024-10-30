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
  required,
  DateInput,
  DateField,
  AutocompleteInput,
  // BooleanField,
  // ReferenceArrayField,
} from "react-admin";
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { backendUrl } from "../dataProvider";
export const FixedUprIcon = EditCalendarIcon;
import { useState, useEffect } from "react";

export const FixedUprList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <ReferenceField source="CategoryId" reference="categories">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="UprazhnenieId" reference="uprazhneniya">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="date" />
      <EditButton />
    </Datagrid>
  </List>
);

export const FixedUprEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <ReferenceInput
        source="UprazhnenieId"
        reference="uprazhneniya"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput
        source="CategoryId"
        reference="categories"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <DateInput source="date" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const FixedUprCreate = () => {
  const [zvanieOptions, setZvanieOptions] = useState([]);

  useEffect(() => {
    const fetchZvaniya = async () => {
      try {
        const response = await fetch(`${backendUrl}/zvaniya`);
        const data = await response.json();
        setZvanieOptions(data);
      } catch (error) {
        console.error("Error fetching zvaniya:", error);
      }
    };

    fetchZvaniya();
  }, []);

  const filterToQuery = (searchText) => ({ lName: `%${searchText}%` });
  const uprFilterToQuery = (searchText) => ({ name: `%${searchText}%` });
  const categoryFilterToQuery = (searchText) => ({ name: `%${searchText}%` });
  const uprOptionText = (record) => `[${record.shortName}] => ${record.name}`;
  const categoryOptionText = (record) => `[${record.shortName}] => ${record.name}`;

  const personOptionText = (record) => {
    const zvanie = zvanieOptions.find((zv) => zv.id === record.ZvanieId);
    return `${zvanie ? zvanie.name : ""} ${record.lName} ${record.fName} ${
      record.sName
    }`;
  };

  return (
    <Create title="Добавление результата">
      <SimpleForm>
        <ReferenceInput
          source="UprazhnenieId"
          reference="uprazhneniya"
          validate={[required()]}
        >
          <AutocompleteInput
            optionText={uprOptionText}
            filterToQuery={uprFilterToQuery}
            fullWidth={true}
          />
        </ReferenceInput>
        
        <ReferenceInput
          source="CategoryId"
          reference="categories"
          validate={[required()]}
        >
          <AutocompleteInput
            optionText={categoryOptionText}
            filterToQuery={categoryFilterToQuery}
            fullWidth={true}
          />
        </ReferenceInput>
        <DateInput source="date" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};
