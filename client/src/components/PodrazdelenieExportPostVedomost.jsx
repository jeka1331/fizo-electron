import { Button, useRecordContext } from 'react-admin';
import { backendUrl } from '../dataProvider';

export const PodrazdelenieExportPostVedomost = (props) => {
   const record = useRecordContext();
   const exportFunction = (data) => {
    try {
      const response = fetch(`${backendUrl}/reports/podrazdelenie`, {
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