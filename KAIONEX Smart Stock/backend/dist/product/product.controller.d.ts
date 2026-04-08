import { ProductService } from './product.service';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    getProduct(): Promise<{
        id: any;
        code: string;
        name: string;
        price: number;
        totalStock: number;
        availableStock: number;
    }>;
}
