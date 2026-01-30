// Product Types (Example)
export interface ICategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: string; // Keeping price as string to match sample data
  stock: number;
  images: string; // Keeping images as string to match sample data
  status: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category: ICategory;
}
  
  export interface ICreateProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
  }
  
  export interface IUpdateProductRequest extends Partial<ICreateProductRequest> {
    id: string;
  }