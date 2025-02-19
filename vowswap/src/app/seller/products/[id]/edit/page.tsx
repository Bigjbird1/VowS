import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/seller/ProductForm";
import { ProductFormData } from "@/types/product";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/seller/products");
  }

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    redirect("/seller/onboarding");
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    redirect("/seller/products");
  }

  // Verify product ownership
  if (product.sellerId !== seller.id) {
    redirect("/seller/products");
  }

  const formData: ProductFormData & { id: string } = {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    images: product.images,
    category: product.category,
    condition: product.condition,
    inventory: product.inventory,
    status: product.status,
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Edit Product
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <ProductForm
                mode="edit"
                initialData={formData}
                sellerId={seller.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
