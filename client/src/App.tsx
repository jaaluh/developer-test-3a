import './App.scss'
import axios from 'axios';

function App() {
  const importProductData = async () => {
    const res = await axios.post('/api/products/import')
    console.log(res.data)
  }

  const fetchProductData = async () => {
    const res = await axios.get('/api/products')
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
