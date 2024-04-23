import simpleRestProvider from "ra-data-simple-rest";
export const backendUrl = 'http://localhost:3333'

export const dataProvider = simpleRestProvider(
  backendUrl
);
