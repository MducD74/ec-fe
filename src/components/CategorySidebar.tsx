import { ChevronDown, ChevronRight, FolderTree, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../lib/api-client";

export interface CategoryNode {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryNode[];
}

interface CategoriesResponse {
  success?: boolean;
  data?: CategoryNode[];
  categories?: CategoryNode[];
}

interface CategorySidebarProps {
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

function getCategories(response: CategoriesResponse) {
  return response.data ?? response.categories ?? [];
}

function CategoryTreeItem({
  category,
  depth,
  expandedIds,
  selectedCategoryId,
  onToggle,
  onSelectCategory,
}: {
  category: CategoryNode;
  depth: number;
  expandedIds: Set<number>;
  selectedCategoryId: number | null;
  onToggle: (categoryId: number) => void;
  onSelectCategory: (categoryId: number) => void;
}) {
  const hasChildren = category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedCategoryId === category.id;

  return (
    <li>
      <div
        className={`flex items-center gap-1 rounded-md pr-2 transition-colors ${
          isSelected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md disabled:opacity-0"
          onClick={() => onToggle(category.id)}
          disabled={!hasChildren}
          aria-label={isExpanded ? `Thu gọn ${category.name}` : `Mở rộng ${category.name}`}
          title={isExpanded ? "Thu gọn" : "Mở rộng"}
        >
          {hasChildren &&
            (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 truncate py-2 text-left text-sm font-medium"
          onClick={() => {
            onSelectCategory(category.id);
            if (hasChildren) {
              onToggle(category.id);
            }
          }}
        >
          {category.name}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedCategoryId={selectedCategoryId}
              onToggle={onToggle}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function CategorySidebar({ selectedCategoryId, onSelectCategory }: CategorySidebarProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const response = await apiClient.get<CategoriesResponse>("/categories");

        if (isMounted) {
          const nextCategories = getCategories(response.data);
          setCategories(nextCategories);
          setExpandedIds(new Set(nextCategories.map((category) => category.id)));
        }
      } catch {
        if (isMounted) {
          setError("Chưa thể tải danh mục.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCategory = (categoryId: number) => {
    setExpandedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(categoryId)) {
        nextIds.delete(categoryId);
      } else {
        nextIds.add(categoryId);
      }

      return nextIds;
    });
  };

  return (
    <aside className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
          <FolderTree className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Danh mục</h2>
          <p className="text-xs text-slate-500">Lọc theo bộ sưu tập</p>
        </div>
      </div>

      <button
        type="button"
        className={`mb-3 flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors ${
          selectedCategoryId === null ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
        }`}
        onClick={() => onSelectCategory(null)}
      >
        Tất cả sản phẩm
      </button>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-md border border-slate-100 px-3 py-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải danh mục...
        </div>
      )}

      {!isLoading && error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
          {error}
        </p>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <p className="rounded-md border border-slate-100 px-3 py-3 text-sm text-slate-500">
          Chưa có danh mục.
        </p>
      )}

      {categories.length > 0 && (
        <ul className="space-y-1">
          {categories.map((category) => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              depth={0}
              expandedIds={expandedIds}
              selectedCategoryId={selectedCategoryId}
              onToggle={toggleCategory}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

export default CategorySidebar;
