import { useEffect, useState } from "react";
import CategorySidebar from "../components/CategorySidebar";
import Pagination from "../components/Pagination";
import ProductCard, { type PaginationMeta, type Product } from "../components/ProductCard";
import apiClient, { fetchProducts } from "../lib/api-client";

interface ProductsResponse {
  data?: Product[];
  products?: Product[];
  recommendations?: Product[];
  recommended_products?: Product[];
  meta?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Brand {
  id: number;
  name: string;
  logoUrl?: string | null;
}

interface BrandsResponse {
  data?: Brand[];
  brands?: Brand[];
}

function extractProducts(response: ProductsResponse) {
  return response.data ?? response.products ?? response.recommendations ?? response.recommended_products ?? [];
}

function extractBrands(response: BrandsResponse) {
  return response.data ?? response.brands ?? [];
}

function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isRecommendLoading, setIsRecommendLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      setIsRecommendLoading(true);

      try {
        const response = await apiClient.get<ProductsResponse>("/products/recommendations");

        if (isMounted) {
          setRecommendedProducts(extractProducts(response.data));
        }
      } catch {
        if (isMounted) {
          setRecommendedProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsRecommendLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBrands() {
      try {
        const response = await apiClient.get<BrandsResponse>("/brands");

        if (isMounted) {
          setBrands(extractBrands(response.data));
        }
      } catch {
        if (isMounted) {
          setBrands([]);
        }
      }
    }

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const response = await fetchProducts({
          page: currentPage,
          limit,
          categoryId: selectedCategoryId,
          brandId: selectedBrandId,
        });

        if (!isMounted) {
          return;
        }

        setProducts(response.data);
        setMeta(response.meta);
      } catch {
        if (isMounted) {
          setProductsError("Chưa thể tải danh sách sản phẩm.");
          setMeta(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId, selectedBrandId, currentPage, limit]);

  const selectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const selectBrand = (brandId: number | null) => {
    setSelectedBrandId(brandId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setCurrentPage(1);
  };

  return (
    <div className="py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Danh mục DUT Shop
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            Tất cả sản phẩm
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Lọc theo danh mục, thương hiệu và duyệt sản phẩm với trải nghiệm tối giản, rõ ràng.
          </p>
        </div>
        <div className="rounded-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          <span className="font-semibold text-slate-950">{meta?.totalItems ?? 0}</span> sản phẩm
        </div>
      </div>

      <section className="mb-8 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Thương hiệu</h2>
            <p className="mt-1 text-xs text-slate-500">Lọc theo hãng sản xuất</p>
          </div>
        </div>

        <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-none snap-x snap-mandatory gap-3 py-2">
          <button
            type="button"
            className={`h-10 flex-shrink-0 snap-start rounded-md border px-3 text-sm font-semibold transition-colors ${
              selectedBrandId === null
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary-500 hover:text-primary-600"
            }`}
            onClick={() => selectBrand(null)}
          >
            Tất cả
          </button>

          {brands.map((brand) => {
            const isSelected = selectedBrandId === brand.id;

            return (
              <button
                key={brand.id}
                type="button"
                className={`flex h-10 flex-shrink-0 snap-start items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary-500 hover:text-primary-600"
                }`}
                onClick={() => selectBrand(brand.id)}
              >
                {brand.logoUrl && (
                  <img
                    src={brand.logoUrl}
                    alt=""
                    className="h-5 w-5 rounded object-contain"
                  />
                )}
                <span className="truncate">{brand.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {(isRecommendLoading || recommendedProducts.length > 0) && (
        <section className="mb-8 rounded-lg border border-slate-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                Mua sắm AI
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                Gợi ý dành riêng cho bạn
              </h2>
            </div>
          </div>

          <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
            {isRecommendLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-72 w-[240px] shrink-0 snap-start animate-pulse rounded-md border border-slate-100 bg-slate-50 sm:w-[260px]"
                  />
                ))
              : recommendedProducts.map((product) => (
                  <div key={product.id} className="w-[240px] shrink-0 snap-start sm:w-[260px]">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-5">
          <CategorySidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={selectCategory}
          />
        </div>

        <section className="min-w-0 space-y-5">
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Danh sách sản phẩm</h2>
              <p className="mt-1 text-sm text-slate-500">
                Trang {currentPage} với {limit} sản phẩm mỗi trang
              </p>
            </div>
            {(selectedCategoryId || selectedBrandId) && (
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-500 hover:text-primary-600"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {isLoadingProducts && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: limit }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-md border border-slate-100 bg-slate-50"
                />
              ))}
            </div>
          )}

          {!isLoadingProducts && productsError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-primary-700">
              {productsError}
            </p>
          )}

          {!isLoadingProducts && !productsError && products.length === 0 && (
            <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại.
            </p>
          )}

          {!isLoadingProducts && products.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={meta?.totalPages ?? 1}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </div>
  );
}

export default Catalog;



