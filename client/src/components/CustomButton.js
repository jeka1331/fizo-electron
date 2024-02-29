import { Button, useRecordContext } from 'react-admin';

export const TestButton = (props) => {
   const record = useRecordContext();
   const exportFunction = async (data) => {
    try {
      const response = await fetch('http://localhost:3333/reports/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
   return <Button  onClick={exportFunction(record)} {...props} />;
};