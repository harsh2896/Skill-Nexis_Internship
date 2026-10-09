import { useEffect, useState } from "react";

// Shows the product image, or a letter placeholder when there is no image or it fails to load
function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return <div className="img-placeholder" role="img" aria-label={name}>{name.charAt(0).toUpperCase()}</div>;
  return <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />;
}
export default ProductImage;
