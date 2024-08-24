import { Product } from './types';

interface Props {
  product: Product;
}

export const ProductCard = (p: Props) => {
  return (
    <div className='product-card'>
      <p>name: {p.product.name}</p>
      <p>description: {p.product.description}</p>
      <p>uuid: {p.product.uuid}</p>
      <p>
        variations: {p.product.variations.map((v, i) => (
          <span className='variations' key={`${p.product.id}_variation_${i}`}>
            {v.price ? <span className='variation'>price: {v.price}</span> : null}
            {v.size ? <span className='variation'>size: {v.size}</span> : null}
            {v['paper size'] ? <span className='variation'>paper size: {v['paper size']}</span> : null}
          </span>
        ))}
      </p>

      <p>
        categories: {p.product.categories.map(c => c.name).join(', ')}
      </p>
    </div>
  );
};