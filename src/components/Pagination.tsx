import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:flex-row">
      <p className="text-sm text-slate-500">
        Trang <span className="font-semibold text-slate-950">{currentPage}</span> / {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </button>

        {pages[0] > 1 && (
          <button
            type="button"
            className="h-10 min-w-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
        )}

        {pages[0] > 2 && <span className="px-1 text-sm text-slate-400">...</span>}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`h-10 min-w-10 rounded-md border px-3 text-sm font-semibold transition-colors ${
              page === currentPage
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-950 hover:text-slate-950"
            }`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages - 1 && (
          <span className="px-1 text-sm text-slate-400">...</span>
        )}

        {pages[pages.length - 1] < totalPages && (
          <button
            type="button"
            className="h-10 min-w-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        )}

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
