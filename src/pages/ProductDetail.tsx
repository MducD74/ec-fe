import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  ListChecks,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import ProductCard, { type Product } from "../components/ProductCard";
import apiClient from "../lib/api-client";

interface ProductDetailResponse {
  data?: Product;
  product?: Product;
}

interface ProductsResponse {
  data?: Product[];
  products?: Product[];
  recommendations?: Product[];
  recommended_products?: Product[];
}

function formatPrice(price: string | number) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

function getProduct(response: ProductDetailResponse) {
  return response.data ?? response.product ?? null;
}

function getProducts(response: ProductsResponse) {
  return response.data ?? response.products ?? response.recommendations ?? response.recommended_products ?? [];
}

function getAvailableCount(product: Product) {
  return product.inventory?.filter((item) => item.status !== "SOLD").length;
}

function getGalleryImages(product: Product) {
  const imageUrl = product.imageUrl;

  if (!imageUrl) {
    return [];
  }

  return [imageUrl, imageUrl, imageUrl];
}

function ImageGallery({ product }: { product: Product }) {
  const images = useMemo(() => getGalleryImages(product), [product]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0] ?? null;

  return (
    <section className="space-y-4">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <ImageIcon className="h-10 w-10" />
            <span className="text-sm font-medium">{product.sku ?? `SP-${product.id}`}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(images.length > 0 ? images : [null, null, null]).map((image, index) => (
          <button
            key={`${image ?? "placeholder"}-${index}`}
            type="button"
            className={`aspect-square overflow-hidden rounded-md border bg-slate-50 transition-colors ${
              image && index === selectedIndex ? "border-slate-950" : "border-slate-200 hover:border-slate-400"
            }`}
            onClick={() => image && setSelectedIndex(index)}
          >
            {image ? (
              <img
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                {product.sku ?? `SP-${product.id}`}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const availableCount = getAvailableCount(product);

  const handleAddToCart = async () => {
    try {
      await apiClient.post("/cart/items", {
        productId: product.id,
        quantity: 1,
      });

      toast.success("Da them vao gio hang!");
    } catch {
      toast.error("Khong the them vao gio hang.");
    }
  };

  return (
    <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {product.category?.name && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {product.category.name}
          </span>
        )}
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
          {product.sku ?? `SP-${product.id}`}
        </span>
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
        {product.name}
      </h1>

      {product.description && (
        <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>
      )}

      <p className="mt-6 text-3xl font-semibold text-slate-950">
        {formatPrice(product.price)}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
          <PackageCheck className="h-5 w-5 text-slate-950" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Tinh trang kho
            </p>
            <p className="text-sm font-semibold text-slate-950">
              {typeof availableCount === "number" ? `Con ${availableCount} san pham` : "San sang giao"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-slate-950" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Bao hanh
            </p>
            <p className="text-sm font-semibold text-slate-950">Chinh hang 12 thang</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-4 w-4" />
        Them vao gio hang
      </button>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-slate-950" />
          Giao nhanh
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-slate-950" />
          Doi tra 7 ngay
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-slate-950" />
          Goi y boi AI
        </div>
      </div>
    </section>
  );
}

function SpecificationTable({ specifications }: { specifications?: Product["specifications"] }) {
  const entries = Object.entries(specifications ?? {});

  return (
    <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Chi tiet
          </p>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            Thong so ky thuat
          </h2>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-md border border-slate-100 px-4 py-3 text-sm text-slate-500">
          Chua co thong so ky thuat cho san pham nay.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-slate-100">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {entries.map(([key, value]) => (
                <tr key={key} className="bg-white">
                  <th className="w-2/5 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                    {key}
                  </th>
                  <td className="px-4 py-3 text-slate-600">{String(value ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoadingProduct(true);
      setProductError(null);

      try {
        const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);

        if (isMounted) {
          setProduct(getProduct(response.data));
        }
      } catch {
        if (isMounted) {
          setProductError("Khong the tai thong tin san pham.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      }
    }

    if (id) {
      void loadProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      try {
        const response = await apiClient.get<ProductsResponse>("/products/recommendations");

        if (isMounted) {
          setRecommendations(getProducts(response.data).filter((item) => item.id !== product?.id).slice(0, 4));
        }
      } catch {
        if (isMounted) {
          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecommendations(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  if (isLoadingProduct) {
    return (
      <div className="space-y-6 py-8">
        <div className="h-8 w-36 animate-pulse rounded-md bg-slate-100" />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="aspect-square animate-pulse rounded-lg bg-slate-100" />
          <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <section className="py-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Quay lai danh muc
        </Link>
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {productError ?? "Khong tim thay san pham."}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-12 py-8">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lai danh muc
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <ImageGallery key={product.id} product={product} />
        <ProductInfo product={product} />
      </div>

      <SpecificationTable specifications={product.specifications} />

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              AI Shopping
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              San pham tuong tu
            </h2>
          </div>
        </div>

        {isLoadingRecommendations && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-md border border-slate-100 bg-slate-50" />
            ))}
          </div>
        )}

        {!isLoadingRecommendations && recommendations.length === 0 && (
          <p className="rounded-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">
            Chua co goi y phu hop.
          </p>
        )}

        {recommendations.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((recommendedProduct) => (
              <ProductCard key={recommendedProduct.id} product={recommendedProduct} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductDetail;
