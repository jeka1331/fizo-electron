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

import React, { useState } from "react";
import {
  List,
  Datagrid,
  TextField,
  useNotify,
  useRefresh,
  useRedirect,
  ReferenceField,
  useRecordContext,
  FunctionField,
  DateField,
} from "react-admin";
// import { PassingInMonthAddOrChangeResultButton } from "../components/PassingInMonthAddOrChangeResultButton";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
export const passingInMonthIcon = AccessAlarmIcon;
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import { dataProvider } from "../dataProvider";


export const passingInMonthList = (props) => {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const refresh = useRefresh();
  const record = useRecordContext();
  const [editingId, setEditingId] = useState(null);
  const notify = useNotify();
  const redirect = useRedirect();
  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = async (data) => {
    // Ваш код для сохранения данных, например:
    // await dataProvider.update('your-resource', { id: editingId, data });
    notify("Запись обновлена");
    setEditingId(null);
    refresh();
  };

  const createResult = async (data) => {
    console.log(record);
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
        <FunctionField
          source="UprazhnenieResultDate"
          render={(record) => {
            return <DateField source="UprazhnenieResultDate" />;
          }}
        />
        <FunctionField
          source="UprazhnenieResultResult"
          render={(record) => {
            return (
              <Input
                id="standard-adornment-weight"
                endAdornment={
                  <InputAdornment position="end">
                    {record.resultType}
                  </InputAdornment>
                }
                onChange={async (e) => {
                  const isNew = record.UprazhnenieResultResult ? false : true;
                  console.log({
                    ...record,
                    result: e.target.value,
                  });
                  if (isNew) {
                    const result = await dataProvider.create(
                      "uprazhnenieResults",
                      {
                        data: {
                          UprazhnenieId: record.UprazhnenieId,
                          PersonId: record.PersonId,
                          CategoryId: record.CategoryId,
                          result: parseFloat(e.target.value),
                          date: new Date().toISOString().split("T")[0],
                        },
                      }
                    );
                    refresh();
                  } else {
                    // await dataProvider.update("uprazhnenieResults", {
                    //   ...record,
                    //   result: e.target.value,
                    // });
                    if (record && record.UprazhnenieResultId) {
                      dataProvider.update("uprazhnenieResults", {
                        id: record.UprazhnenieResultId,
                        data: {
                          result: parseFloat(e.target.value),
                          date: new Date().toISOString().split("T")[0],
                        },
                        previousData: { id: record.UprazhnenieResultId },
                      });
                    }
                  }

                  // refresh();
                }}
                type="number"
                aria-describedby="standard-weight-helper-text"
                placeholder={parseFloat(record.UprazhnenieResultResult) || null}
              />
            );
          }}
        />

        {/* <PassingInMonthAddOrChangeResultButton data={record} /> */}
      </Datagrid>
    </List>
  );
};
