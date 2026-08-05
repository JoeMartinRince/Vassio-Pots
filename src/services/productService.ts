// Re-export shim — preserves backward compatibility for any import of productService.ts
// All logic lives in product.service.ts
export * from "./product.service";
import productService from "./product.service";
export default productService;
