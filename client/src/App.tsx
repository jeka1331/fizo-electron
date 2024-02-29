import {
  Admin,
  Resource,
} from "react-admin";
import { PersonList, PersonEdit, PersonCreate } from "./resources/persons";
import { ZvanieList, ZvanieEdit, ZvanieCreate } from "./resources/zvaniya";
import { UprazhnenieTypeCreate, UprazhnenieTypeEdit, UprazhnenieTypeList } from "./resources/uprazhneniya-types";
import { CategoryCreate, CategoryList, CategoryEdit } from "./resources/categories";
import { dataProvider } from "./dataProvider";
import { ru } from "./i18n/ru";
import polyglotI18nProvider from "ra-i18n-polyglot";
import {
  PodrazdelenieCreate,
  PodrazdelenieEdit,
  PodrazdelenieList,
} from "./resources/podrazdeleniya";
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';// import { authProvider } from "./authProvider";

const i18nProvider = polyglotI18nProvider(
  () => ru,
  "ru" // Default locale
);

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
      name="uprazhnenieTypes"
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
    />
  </Admin>
);
