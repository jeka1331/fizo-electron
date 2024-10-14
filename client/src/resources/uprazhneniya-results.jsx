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
export const UprazhnenieResultIcon = DoneAllIcon;
import { useState, useEffect } from "react";

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
      <ReferenceInput
        source="UprazhnenieId"
        reference="uprazhneniya"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceInput
        source="PersonId"
        reference="persons"
        validate={[required()]}
      >
        <AutocompleteInput optionText="lName" />
      </ReferenceInput>
      <ReferenceInput
        source="CategoryId"
        reference="categories"
        validate={[required()]}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>

      <NumberInput source="result" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
    </SimpleForm>
  </Edit>
);

export const UprazhnenieResultCreate = () => {
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
          source="PersonId"
          reference="persons"
          validate={[required()]}
        >
          <AutocompleteInput
            optionText={personOptionText}
            filterToQuery={filterToQuery}
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
        <NumberInput source="result" validate={[required()]} />
        <DateInput source="date" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};
