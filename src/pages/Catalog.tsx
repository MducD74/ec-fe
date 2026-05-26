import { useEffect, useState } from "react";
import CategorySidebar from "../components/CategorySidebar";
import Pagination from "../components/Pagination";
import ProductCard, { type Product } from "../components/ProductCard";
import apiClient from "../lib/api-client";

interface ProductsResponse {
  data?: Product[];
  products?: Product[];
  recommendations?: Product[];
  recommended_products?: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function extractProducts(response: ProductsResponse) {
  return response.data ?? response.products ?? response.recommendations ?? response.recommended_products ?? [];
}

function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

    async function loadProducts() {
      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const response = await apiClient.get<ProductsResponse>("/products", {
          params: {
            page: currentPage,
            limit,
            ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
          },
        });

        if (!isMounted) {
          return;
        }

        const pagination = response.data.pagination;

        setProducts(extractProducts(response.data));
        setTotalProducts(pagination?.total ?? 0);
        setTotalPages(pagination?.totalPages ?? 0);
      } catch {
        if (isMounted) {
          setProductsError("Chưa thể tải danh sách sản phẩm.");
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
  }, [selectedCategoryId, currentPage, limit]);

  const selectCategory = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
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
            Lọc theo danh mục lồng nhau và duyệt sản phẩm với trải nghiệm tối giản, rõ ràng.
          </p>
        </div>
        <div className="rounded-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          <span className="font-semibold text-slate-950">{totalProducts}</span> sản phẩm
        </div>
      </div>

      {(isRecommendLoading || recommendedProducts.length > 0) && (
        <section className="mb-8 rounded-lg border border-slate-100 bg-white px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                Mua sắm AI
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                ✨ Gợi ý dành riêng cho bạn
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
        <CategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={selectCategory}
        />

        <section className="min-w-0 space-y-5">
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Danh sách sản phẩm</h2>
              <p className="mt-1 text-sm text-slate-500">
                Trang {currentPage} với {limit} sản phẩm mỗi trang
              </p>
            </div>
            {selectedCategoryId && (
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                onClick={() => selectCategory(null)}
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
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {productsError}
            </p>
          )}

          {!isLoadingProducts && !productsError && products.length === 0 && (
            <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Chưa có sản phẩm nào trong danh mục này.
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
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </div>
  );
}

export default Catalog;
