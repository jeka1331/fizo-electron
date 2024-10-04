import {
  Admin,
  Resource,
} from "react-admin";
import { PersonList, PersonEdit, PersonCreate } from "./resources/persons";
import { ZvanieList, ZvanieEdit, ZvanieCreate } from "./resources/zvaniya";
import { UprazhnenieTypeCreate, UprazhnenieTypeEdit, UprazhnenieTypeList } from "./resources/uprazhneniya-types";
import { CategoryCreate, CategoryList, CategoryEdit, CategoryIcon } from "./resources/categories";
import { dataProvider } from "./dataProvider";
import { ru } from "./i18n/ru";
import { kz } from "./i18n/kz";
import polyglotI18nProvider from "ra-i18n-polyglot";

import {
  PodrazdelenieCreate,
  PodrazdelenieEdit,
  PodrazdelenieList,
} from "./resources/podrazdeleniya";

import {
  DocumentsList,
  DocumentsIcon
} from "./resources/documents";
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';// import { authProvider } from "./authProvider";
import { UprazhnenieCreate, UprazhnenieEdit, UprazhnenieIcon, UprazhnenieList } from "./resources/uprazhneniya";
import { UprazhnenieStandardCreate, UprazhnenieStandardEdit, UprazhnenieStandardIcon, UprazhnenieStandardList } from "./resources/uprazhneniya-standards";
import { UprazhnenieResultCreate, UprazhnenieResultEdit, UprazhnenieResultIcon, UprazhnenieResultList } from "./resources/uprazhneniya-results";
import { EfficiencyPreferenceCreate, EfficiencyPreferenceEdit, EfficiencyPreferenceIcon, EfficiencyPreferenceList } from "./resources/efficiencyPreferences";
import { FixedUprCreate, FixedUprEdit, FixedUprIcon, FixedUprList } from "./resources/fixed-uprs";
import { passingInMonthList, passingInMonthIcon } from "./resources/passingInMonth";


const translations = { ru, kz };


const i18nProvider = polyglotI18nProvider(
  (locale) => translations[locale],
  'kz',
  [{ locale: 'ru', name: 'Русский' }, { locale: 'kz', name: 'Қазақша' }]
)

export const App = () => (
  <Admin
    dataProvider={dataProvider}
    // theme={nanoDarkTheme}
    i18nProvider={i18nProvider}
  >
    <Resource
      name="persons"
      list={PersonList}
      edit={PersonEdit}
      create={PersonCreate}

      icon={PersonIcon}
    // show={ShowGuesser}
    />
    <Resource
      name="uprazhnenieRealValuesTypes"
      list={UprazhnenieTypeList}
      edit={UprazhnenieTypeEdit}
      create={UprazhnenieTypeCreate}


    // icon={bookI}
    // show={ShowGuesser}
    />
    <Resource
      name="podrazdeleniya"
      list={PodrazdelenieList}
      edit={PodrazdelenieEdit}
      create={PodrazdelenieCreate}

      icon={GroupsIcon}

    />
    <Resource
      name="zvaniya"
      list={ZvanieList}
      create={ZvanieCreate}
      edit={ZvanieEdit}

      icon={StarIcon}
    // edit={PersonEdit}
    // show={ShowGuesser}
    />
    <Resource
      name="categories"
      list={CategoryList}
      edit={CategoryEdit}
      create={CategoryCreate}
      icon={CategoryIcon}

    />
    <Resource
      name="uprazhneniya"
      list={UprazhnenieList}
      edit={UprazhnenieEdit}
      create={UprazhnenieCreate}
      icon={UprazhnenieIcon}

    />
    <Resource
      name="efficiencyPreferences"
      list={EfficiencyPreferenceList}
      edit={EfficiencyPreferenceEdit}
      create={EfficiencyPreferenceCreate}
      icon={EfficiencyPreferenceIcon}

    />
    <Resource
      name="uprazhnenieStandards"
      list={UprazhnenieStandardList}
      edit={UprazhnenieStandardEdit}
      create={UprazhnenieStandardCreate}
      icon={UprazhnenieStandardIcon}

    />
    <Resource
      name="uprazhnenieResults" 
      list={UprazhnenieResultList} 
      edit={UprazhnenieResultEdit} 
      create={UprazhnenieResultCreate} 
      icon={UprazhnenieResultIcon} 
    />

    <Resource 
      name="fixedUpr" 
      list={FixedUprList} 
      edit={FixedUprEdit} 
      create={FixedUprCreate} 
      icon={FixedUprIcon} 
    />
    
    <Resource
      name="passingInMonth"
      list={passingInMonthList}
      icon={passingInMonthIcon}

    />

    <Resource
      name="Documents"
      list={DocumentsList}
      icon={DocumentsIcon}

    />
    
    {/* <LanguagePicker /> */}
  </Admin>
);
