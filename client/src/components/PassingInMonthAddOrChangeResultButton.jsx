import { Button, useRecordContext } from 'react-admin';

export const PassingInMonthAddOrChangeResultButton = (props) => {
  const record = useRecordContext();
  const getResultDataFunction = async (data) => {
    try {
      const uprazhnenieResult = {
        "id": 1,
        "result": 12,
        "date": "2024-10-15T00:00:00.000Z",
        "PersonId": 93,
        "CategoryId": 18,
        "UprazhnenieId": 1
      }
      return uprazhnenieResult
      // if (!uprazhnenieResult.ok) {
      //   throw new Error('Network response was not ok');
      // }

      const result = await uprazhnenieResult.json();
      console.log('Response data:', result);
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  const setResultsFunction = async (data) => {
    try {
      const uprazhnenieResult = await fetch('http://localhost:3333/uprazhnenieResult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return uprazhnenieResult
      // if (!uprazhnenieResult.ok) {
      //   throw new Error('Network response was not ok');
      // }

      const result = await uprazhnenieResult.json();
      console.log('Response data:', result);
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  // let label
  // getResultDataFunction(record).then(ur => {
  //   console.log(ur)
  //   label = ur.result
  // }).catch(err => {
  //   console.log(err)
  // })
  return <Button onClick={async () => {
    console.log('Сдал упражнение')
    console.log(await getResultDataFunction(record))
  }} {...props} />;
};