import { Button, useRecordContext } from 'react-admin';
import { EditBase, SelectInput, SimpleForm, TextInput, Title } from "react-admin";
import { Card, CardContent, Container } from "@mui/material";

export const PassingInMonthResultLabel = (props) => {
  const record = useRecordContext();
  const result = 10


  return (
    <EditBase>
      <SimpleForm>
        <TextInput source="title" />
      </SimpleForm>
    </EditBase>
  )
};