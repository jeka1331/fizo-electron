
import {
  List,
  Datagrid,
  TextField,
  useRefresh,
  ReferenceField,
  FunctionField,
  DateField,
  NumberField,
} from "react-admin";
// import { PassingInMonthAddOrChangeResultButton } from "../components/PassingInMonthAddOrChangeResultButton";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
export const passingInMonthIcon = AccessAlarmIcon;
import InputAdornment from "@mui/material/InputAdornment";
import Input from "@mui/material/Input";
import { dataProvider } from "../dataProvider";


export const passingInMonthList = (props) => {
  const refresh = useRefresh();

  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <ReferenceField source="PodrazdelenieId" reference="podrazdeleniya">
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="PersonId" reference="persons">
          {/* <TextField source="lName" />

          <TextField source="fName" />  
          <TextField source="sName" /> */}
          <FunctionField
          source="fio"
          render={(record) => {
            return `${record.lName} ${record.fName} ${record.sName}`;
          }}
        />
        </ReferenceField>

        
        
        <ReferenceField source="CategoryId" reference="categories">
          <TextField source="shortName" />
        </ReferenceField>
        <ReferenceField source="UprazhnenieId" reference="uprazhneniya" textAlign="center">
          <TextField source="shortName" />
        </ReferenceField>
        <FunctionField
          source="UprazhnenieResultDate"
          render={() => {
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
                autoComplete="off"
                onBlur={async (e) => {
                  const isNew = record.UprazhnenieResultDate ? false : true;
                  console.log("isNew", isNew);
                  console.log("record", record);
                  if (isNew) {
                    await dataProvider.create(
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

                  refresh();
                }}
                type="number"
                aria-describedby="standard-weight-helper-text"
                placeholder={parseFloat(record.UprazhnenieResultResult) || null}
              />
            );
          }}
        />
        <NumberField source="UprazhnenieResultBallClassic" emptyText="-" textAlign="center"/>
        <NumberField source="UprazhnenieResultBallBolon" emptyText="-" textAlign="center"/>

        {/* <PassingInMonthAddOrChangeResultButton data={record} /> */}
      </Datagrid>
    </List>
  );
};
