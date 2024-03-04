import { Button, useRecordContext } from 'react-admin';

export const PodrazdelenieExportPostButton = (props) => {
   const record = useRecordContext();
   const exportFunction = (data) => {
    try {
      const response = fetch('http://localhost:3333/reports/podrazdelenie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
   return <Button  onClick={()=>(exportFunction(record))} {...props} />;
};