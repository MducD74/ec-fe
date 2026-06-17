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

interface RecommendedVoucher {
  id: number;
  code: string;
  discount_type?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value?: number;
  discountValue?: number;
  min_order_value?: number;
  minOrderValue?: number;
  is_upsell?: boolean;
  isUpsell?: boolean;
}

interface RecommendedVouchersResponse {
  data?: RecommendedVoucher[];
  vouchers?: RecommendedVoucher[];
  recommended_vouchers?: RecommendedVoucher[];
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

function getRecommendedVouchers(response: RecommendedVouchersResponse) {
  return response.recommended_vouchers ?? response.data ?? response.vouchers ?? [];
}

function getAvailableCount(product: Product) {
  const inventories = product.productInventories ?? product.inventory;

  return inventories?.filter((item) => item.status !== "SOLD").length;
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
  const [recommendedVouchers, setRecommendedVouchers] = useState<RecommendedVoucher[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendedVouchers() {
      try {
        const response = await apiClient.get<RecommendedVouchersResponse>(
          `/vouchers/recommend/${product.id}`,
        );

        if (isMounted) {
          setRecommendedVouchers(getRecommendedVouchers(response.data).slice(0, 3));
        }
      } catch {
        if (isMounted) {
          setRecommendedVouchers([]);
        }
      }
    }

    void loadRecommendedVouchers();

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const handleAddToCart = async () => {
    try {
      await apiClient.post("/cart/items", {
        productId: product.id,
        quantity: 1,
      });

      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng.");
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Đã sao chép mã giảm giá!");
    } catch {
      toast.error("Không thể sao chép mã giảm giá.");
    }
  };

  const getVoucherDiscountText = (voucher: RecommendedVoucher) => {
    const discountType = voucher.discount_type ?? voucher.discountType;
    const discountValue = voucher.discount_value ?? voucher.discountValue ?? 0;

    if (discountType === "PERCENTAGE") {
      return `-${discountValue}%`;
    }

    return `-${formatPrice(discountValue)}`;
  };

  const getUpsellAmount = (voucher: RecommendedVoucher) => {
    const minOrderValue = voucher.min_order_value ?? voucher.minOrderValue ?? 0;
    const productPrice = Number(product.price);

    if (!Number.isFinite(productPrice)) {
      return 0;
    }

    return Math.max(minOrderValue - productPrice, 0);
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

      {recommendedVouchers.length > 0 && (
        <div className="mt-4 rounded-lg border border-orange-100 bg-orange-50/50 px-4 py-3">
          <p className="text-sm font-bold text-slate-950">Mã giảm giá cực hời</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recommendedVouchers.map((voucher) => {
              const isUpsell = Boolean(voucher.is_upsell ?? voucher.isUpsell);
              const upsellAmount = getUpsellAmount(voucher);

              return (
                <button
                  key={voucher.id}
                  type="button"
                  onClick={() => handleCopyCode(voucher.code)}
                  className="rounded-full bg-gradient-to-r from-orange-100 to-rose-100 px-3 py-2 text-left text-sm font-bold text-rose-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow"
                  title="Bấm để sao chép mã"
                >
                  <span>{voucher.code}</span>
                  <span className="ml-2 text-rose-900">{getVoucherDiscountText(voucher)}</span>
                  {isUpsell && upsellAmount > 0 && (
                    <span className="mt-1 block text-xs font-semibold text-primary-600">
                      Mua thêm {formatPrice(upsellAmount)} để áp dụng
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
          <PackageCheck className="h-5 w-5 text-slate-950" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Tình trạng kho
            </p>
            <p className="text-sm font-semibold text-slate-950">
              {typeof availableCount === "number" ? `Còn ${availableCount} sản phẩm` : "Sẵn sàng giao"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-slate-950" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Bảo hành
            </p>
            <p className="text-sm font-semibold text-slate-950">Chính hãng 12 tháng</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-4 w-4" />
        Thêm vào giỏ hàng
      </button>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-slate-950" />
          Giao nhanh
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-slate-950" />
          Đổi trả 7 ngày
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-slate-950" />
          Gợi ý bởi AI
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
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Chi tiết
          </p>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
            Thông số kỹ thuật
          </h2>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-md border border-slate-100 px-4 py-3 text-sm text-slate-500">
          Chưa có thông số kỹ thuật cho sản phẩm này.
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
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingSimilarProducts, setIsLoadingSimilarProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoadingProduct(true);
      setProductError(null);

      try {
        const response = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
        const loadedProduct = getProduct(response.data);

        if (isMounted) {
          setProduct(loadedProduct);
        }

        if (loadedProduct) {
          try {
            await apiClient.post("/interactions", {
              productId: loadedProduct.id,
              actionType: "VIEW",
            });
          } catch (error) {
            console.warn("Unable to log product view interaction:", error);
          }
        }
      } catch {
        if (isMounted) {
          setProductError("Không thể tải thông tin sản phẩm.");
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

    async function loadSimilarProducts() {
      setIsLoadingSimilarProducts(true);
      setSimilarProducts([]);

      try {
        const response = await apiClient.get<ProductsResponse>(`/products/similar/${id}`);
        const currentProductId = Number(id);

        if (isMounted) {
          setSimilarProducts(getProducts(response.data).filter((item) => item.id !== currentProductId).slice(0, 5));
        }
      } catch {
        if (isMounted) {
          setSimilarProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSimilarProducts(false);
        }
      }
    }

    if (id) {
      void loadSimilarProducts();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

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
          Quay lại danh mục
        </Link>
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-primary-700">
          {productError ?? "Không tìm thấy sản phẩm."}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-12 py-8">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh mục
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
              Mua sắm AI
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              Sản phẩm tương tự
            </h2>
          </div>
        </div>

        {isLoadingSimilarProducts && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-md border border-slate-100 bg-slate-50" />
            ))}
          </div>
        )}

        {!isLoadingSimilarProducts && similarProducts.length === 0 && (
          <p className="rounded-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">
            Chưa có gợi ý phù hợp.
          </p>
        )}

        {similarProducts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductDetail;



