import axios from 'axios';
import { ProductApiResponse } from '../types';
const apiUrl = 'https://raw.githubusercontent.com/Exove/developer-test/main/material/products.json';

const getProducts = async () : Promise<ProductApiResponse|null> => {
  try {
    const res = await axios.get(apiUrl);
    return res.data; 
  }
  catch(err) {
    console.log(`error at getProductDataFromApi`, err);
    return null;
  }
}

export default {
  getProducts
}