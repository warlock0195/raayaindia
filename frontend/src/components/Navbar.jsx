import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navItems = [
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/shop?category=ethnic" },
  { label: "About", to: "/about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-raayaIvory/95 backdrop-blur-md">
      <div className="section-container flex h-20 items-center justify-between">
        <button className="lg:hidden" onClick={() => setOpen((prev) => !prev)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="font-serif text-2xl tracking-[0.12em]">
          RAAYA INDIA
        </Link>

        <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.2em] lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors duration-300 ${isActive ? "text-raayaGold" : "text-raayaBlack hover:text-raayaGold"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="hidden md:block">
            <Search size={18} />
          </button>
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingBag size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-raayaGold px-1 text-[10px] font-semibold text-raayaBlack">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link to="/auth" aria-label="User">
            <User size={18} className={isAuthenticated ? "text-raayaGold" : ""} />
          </Link>
        </div>
      </div>

      {open ? (
        <div className="border-t border-black/10 bg-raayaIvory px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
