import { useState } from 'react';
import './App.scss'
import axios from 'axios';

function App() {
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [lang, setLang] = useState('en');

  const importProductData = async () => {
    const res = await axios.post('/api/products/import')
    console.log(res.data)
  }

  const fetchProductData = async () => {
    const res = await axios.get(`/api/products?lang=${lang}&currencyCode=${currencyCode}`)
    console.log(res.data)
  }


  return (
    <>
      <button onClick={importProductData}>Import data from product API to local SQL database</button>

      <button onClick={fetchProductData}>Fetch data from local SQL database</button>
    </>
  )
}

export default App
