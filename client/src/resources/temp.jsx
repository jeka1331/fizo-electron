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
  useRecordContext,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  NumberInput,
  required,
  NumberField,
  DateInput,
  DateField,
  useDataProvider,
  useNotify,
  useRedirect,

  // BooleanField,
  // ReferenceArrayField,
} from "react-admin";
import DoneAllIcon from "@mui/icons-material/DoneAll";
export const UprazhnenieResultIcon = DoneAllIcon;

export const UprazhnenieResultList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />

      <ReferenceField source="UprazhnenieId" reference="uprazhneniya">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="PersonId" reference="persons">
        <TextField source="lName" />
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


const modifyData = async (dataProvider ,data) => {
  console.log(data)
  const upr = await dataProvider.getOne('uprazhneniya', {id : data.UprazhnenieId})
  console.log(upr)
  const uprType = await dataProvider.getOne('uprazhnenieRealValuesTypes', {id : upr.data.uprazhnenieRealValuesTypeId})
  console.log(uprType)
  // let result = data
  // return result
}



export const UprazhnenieResultEdit = () => {
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const redirect = useRedirect();

  const handleSubmit = async (values) => {
    console.log(await modifyData(dataProvider, values));
    // Модифицируем значение перед отправкой
    values.result = values.result * 2; // Умножим значение на 2
    try {
      const result = await dataProvider.update("uprazhnenieResults", {
        data: values,
      });
      notify("ra.notification.updated", {
        type: "info",
        messageArgs: { resource: "uprazhnenieResults" },
      });
      console.log(result);
      redirect(`/uprazhnenieResults/${result.data.id}`);
    } catch (error) {
      notify(`This is an error`, { type: "error" });
      console.error("Error:", error);
    }
  };
  return (
    <Edit>
      <SimpleForm onSubmit={handleSubmit}>
        <TextInput source="id" InputProps={{ disabled: true }} />
        <ReferenceInput
          source="UprazhnenieId"
          reference="uprazhneniya"
          validate={[required()]}
        >
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput
          source="PersonId"
          reference="persons"
          validate={[required()]}
        >
          <SelectInput optionText="lName" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput
          source="CategoryId"
          reference="categories"
          validate={[required()]}
        >
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>

        <NumberInput source="result" validate={[required()]} />
        <DateInput source="date" validate={[required()]} />
      </SimpleForm>
    </Edit>
  );
};

export const UprazhnenieResultCreate = () => {
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const redirect = useRedirect();

  const handleSubmit = async (values) => {
    console.log(values);
    // Модифицируем значение перед отправкой
    values.result = values.result * 2; // Умножим значение на 2
    try {
      const result = await dataProvider.create("uprazhnenieResults", {
        data: values,
      });
      notify("ra.notification.created", {
        type: "info",
        messageArgs: { resource: "uprazhnenieResults" },
      });
      console.log(result);
      redirect(`/uprazhnenieResults/${result.data.id}`);
    } catch (error) {
      notify(`This is an error`, { type: "error" });
      console.error("Error:", error);
    }
  };

  return (
    <Create title="Добавление результата">
      <SimpleForm onSubmit={handleSubmit}>
        <ReferenceInput
          source="UprazhnenieId"
          reference="uprazhneniya"
          validate={[required()]}
        >
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput
          source="PersonId"
          reference="persons"
          validate={[required()]}
        >
          <SelectInput optionText="lName" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput
          source="CategoryId"
          reference="categories"
          validate={[required()]}
        >
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>
        <NumberInput source="result" validate={[required()]} />
        <DateInput source="date" validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};
