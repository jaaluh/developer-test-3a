import { useEffect, useState } from 'react';
import './App.scss';
import axios from 'axios';
import { Product } from './types';
import { ProductCard } from './ProductCard';


const fetchProducts = async (lang: string, currencyCode: string, setProducts: React.Dispatch<React.SetStateAction<Product[]>>) => {
  try {
    const res = await axios.get(`/api/products?lang=${lang}&currencyCode=${currencyCode}`);
    setProducts(res.data.products);
  }
  catch (err) {
    console.log('error at fetchProducts', err);
  }
};


function App() {
  const [currencyCode, setCurrencyCode] = useState('EUR');
  const [lang, setLang] = useState('en');
  const [products, setProducts] = useState<Product[]>([]);

  const importProductData = async () => {
    await axios.post('/api/products/import');
    await fetchProducts(lang, currencyCode, setProducts);
  };

  const resetDb = async () => {
    await axios.delete('/api/products/reset');
    await fetchProducts(lang, currencyCode, setProducts);
  }

  useEffect(() => {
    fetchProducts(lang, currencyCode, setProducts);
  }, [lang, currencyCode]);

  return (
    <>
      <div className="controls">
        <button onClick={importProductData}>Import data from product API to local SQL database</button>

        <button className='danger-btn' onClick={resetDb}>Clear SQL database</button>

        <div className='language-select'>
          <label htmlFor='languageSelect'>Language: </label>
          <select id='languageSelect' onChange={e => setLang(e.target.value)}>
            <option value='en'>English</option>
            <option value='fi'>Suomi</option>
          </select>
        </div>

        <div className='currency-select'>
          <label htmlFor='currencySelect'>Currency: </label>
          <select id='currencySelect' onChange={e => setCurrencyCode(e.target.value)}>
            <option value='EUR'>EUR</option>
            <option value='USD'>USD</option>
          </select>
        </div>
      </div>

      <h1>Products from SQL database</h1>
      <div className="products">

        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

export default App;
