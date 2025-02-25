import { sampleProducts } from "@/data/sample-products";
import { redirect } from "next/navigation";
import ProductClient from "./ProductClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  
  // Temporary: Get product from sample data
  const product = sampleProducts.find((p) => p.id === resolvedParams.id);

  if (!product) {
    redirect("/products"); // Redirect to products list if product not found
  }

  return <ProductClient product={product} />;
}
