// // import * as React from "react";
// import {
//   List,
//   Datagrid,
//   Edit,
//   Create,
//   SimpleForm,
//   // DateField,
//   TextField,
//   EditButton,
//   TextInput,
//   // DateInput,
//   ReferenceField,
//   ReferenceInput,
//   SelectInput,
//   NumberInput,
//   required,
//   NumberField,
//   DateInput,
//   DateField,
//   AutocompleteInput,
//   // BooleanField,
//   // ReferenceArrayField,
// } from "react-admin";
// import DoneAllIcon from "@mui/icons-material/DoneAll";
// import { backendUrl } from "../dataProvider";
// export const passingInMonthIcon = DoneAllIcon;
// import { useState, useEffect } from "react";
// import { PassingInMonthAddOrChangeResultButton } from "../components/PassingInMonthAddOrChangeResultButton";
// import { PassingInMonthResultLabel } from "../components/PassingInMonthResultLabel";

// export const passingInMonthList = () => (
//   <List>
//     <Datagrid>
//       <TextField source="id" />
//       <ReferenceField source="PodrazdelenieId" reference="podrazdeleniya">
//         <TextField source="name" />
//       </ReferenceField>
//       <ReferenceField source="PersonId" reference="persons">
//         <TextField source="lName" />

//         <TextField source="fName" />
//         <TextField source="sName" />
//       </ReferenceField>
//       <ReferenceField source="CategoryId" reference="categories">
//         <TextField source="name" />
//       </ReferenceField>
//       <ReferenceField source="UprazhnenieId" reference="uprazhneniya">
//         <TextField source="name" />
//       </ReferenceField>
//       <DateField source="date" />
//       <PassingInMonthResultLabel  />
//       <PassingInMonthAddOrChangeResultButton label="Сдать"></PassingInMonthAddOrChangeResultButton>
//     </Datagrid>
//   </List>
// );

import React, { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  TextInput,
  SimpleForm,
  useNotify,
  useRefresh,
  useRedirect,
  ReferenceField,
  useRecordContext
} from 'react-admin';

import DoneAllIcon from "@mui/icons-material/DoneAll";
export const passingInMonthIcon = DoneAllIcon;

export const passingInMonthList = (props) => {
  const record = useRecordContext()
  const [editingId, setEditingId] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = async (data) => {
    // Ваш код для сохранения данных, например:
    // await dataProvider.update('your-resource', { id: editingId, data });
    notify('Запись обновлена');
    setEditingId(null);
    refresh();
  };

  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <ReferenceField source="PodrazdelenieId" reference="podrazdeleniya">
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
        <EditButton onClick={() => handleEdit(record.id)} />
        <TextField resource='uprazhnenieResults' r/>
      </Datagrid>
      
    </List>
  );
};




