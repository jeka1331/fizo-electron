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
  DateInput,
  useRecordContext,
  BooleanField,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  BooleanInput,
  AutocompleteInput,
  // Button,
} from "react-admin";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
// import { PersonExportPostButton } from "../components/PersonExportPostButton";
const categoryFilterToQuery = (searchText) => ({ name: `%${searchText}%` });
const categoryOptionText = (record) =>
  `[${record.shortName}] => ${record.name}`;

const personFilters = [
  // eslint-disable-next-line react/jsx-key
  <TextInput source="lName" />,
  // eslint-disable-next-line react/jsx-key
  <ReferenceInput source="ZvanieId" reference="zvaniya">
    <AutocompleteInput optionText="name" />
  </ReferenceInput>,
];

export const PersonList = () => (
  <List filters={personFilters}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="lName" />
      <TextField source="fName" />
      <TextField source="sName" />
      {/* <DateField source="dob" /> */}
      {/* <ReferenceField source="ZvanieId"  reference="zvaniya"/> */}
      <ReferenceField
        source="ZvanieId"
        reference="zvaniya"
        emptyText="Служащий ВС РК"
      >
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="PodrazdelenieId" reference="podrazdeleniya">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="CategoryId" reference="categories">
        <TextField source="name" />
      </ReferenceField>
      <BooleanField
        source="isMale"
        valueLabelTrue="Мужчина"
        valueLabelFalse="Женщина"
        TrueIcon={MaleIcon}
        FalseIcon={FemaleIcon}
        label="Пол"
      />
      <BooleanField source="isV" />
      {/* <TextField source="rating" /> */}
      <BooleanField source="isFree" />
      {/* <DateField source="otpuskFrom" /> */}
      {/* <DateField source="otpuskTo" /> */}
      {/* <TextField source="comment" /> */}
      <EditButton />
      {/* <Button
        label="Ведомость"
        onClick={() => {
          fetch(`>${backendUrl}/reports/person`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              console.log("Response Data:", data);
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        }}
      /> */}
      {/* <PersonExportPostButton label='Ведомость' /> */}
    </Datagrid>
  </List>
);

const PersonTitle = () => {
  const record = useRecordContext();

  return (
    <span>
      {" "}
      {record
        ? `${record.lName} ${record.fName} ${record.sName} ${
            record.isV ? "(Военнослужащий)" : "(Служащий ВС РК)"
          }`
        : ""}
    </span>
  );
};

export const PersonEdit = () => (
  <Edit title={<PersonTitle />}>
    <SimpleForm>
      <TextInput source="id" InputProps={{ disabled: true }} />
      <TextInput source="lName" fullWidth />
      <TextInput source="fName" fullWidth />
      <TextInput source="sName" fullWidth />
      <DateInput source="dob" fullWidth />
      {/* <ReferenceInput source="ZvanieId" reference="zvaniya" /> */}
      <ReferenceInput source="ZvanieId" reference="zvaniya">
        <SelectInput optionText="name" fullWidth />
      </ReferenceInput>
      <ReferenceInput source="PodrazdelenieId" reference="podrazdeleniya">
        <SelectInput optionText="name" fullWidth />
      </ReferenceInput>
      <ReferenceInput source="CategoryId" reference="categories">
        <AutocompleteInput
          optionText={categoryOptionText}
          filterToQuery={categoryFilterToQuery}
            fullWidth
        />
      </ReferenceInput>
      <BooleanInput
        source="isMale"
        valueLabelTrue={MaleIcon}
        valueLabelFalse={FemaleIcon}
        defaultValue={true}
        fullWidth
      />
      <BooleanInput source="isV" />
      <BooleanInput source="isFree" />
      <DateInput source="otpuskFrom" />
      <DateInput source="otpuskTo" />
      <TextInput source="comment" fullWidth options={{ multiline: true }} />
    </SimpleForm>
  </Edit>
);

export const PersonCreate = () => {
  return (
    <Create>
      <SimpleForm>
        {/* <TextInput source="id" InputProps={{ disabled: true }} /> */}
        <TextInput source="lName" required={true} />
        <TextInput source="fName" required={true} />
        <TextInput source="sName" />
        <DateInput source="dob" required={true} />
        <ReferenceInput source="ZvanieId" reference="zvaniya" required={true}>
          <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput source="PodrazdelenieId" reference="podrazdeleniya">
          <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput source="CategoryId" reference="categories">
          <AutocompleteInput
            optionText={categoryOptionText}
            filterToQuery={categoryFilterToQuery}
          />
        </ReferenceInput>
        <BooleanInput
          source="isMale"
          valueLabelTrue={MaleIcon}
          valueLabelFalse={FemaleIcon}
          defaultValue={true}
        />
        <BooleanInput source="isV" label="Военнослужащий" />
        <BooleanInput source="isFree" label="Освобожден" />
        <DateInput source="otpuskFrom" />
        <DateInput source="otpuskTo" />
        <TextInput source="comment" options={{ multiline: true }} />
      </SimpleForm>
    </Create>
  );
};
