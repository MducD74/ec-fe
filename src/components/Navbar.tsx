import { LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const accessTokenKey = "access_token";

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(accessTokenKey);
}

function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  useEffect(() => {
    const syncToken = () => setToken(getAccessToken());

    window.addEventListener("storage", syncToken);
    window.addEventListener("auth-token-changed", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("auth-token-changed", syncToken);
    };
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem(accessTokenKey);
    window.dispatchEvent(new Event("auth-token-changed"));
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "text-sm font-medium transition-colors",
      isActive ? "text-slate-950" : "text-slate-500 hover:text-slate-900",
    ].join(" ");

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-normal text-slate-950">
          ShopAI
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            Catalog
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
            aria-label="Cart"
            title="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <UserRound className="h-4 w-4" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
