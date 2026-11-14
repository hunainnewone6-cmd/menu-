import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const navItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/menu', label: 'Menu', icon: 'restaurant' },
  { path: '/about', label: 'About Us', icon: 'info' },
  { path: '/special-offers', label: 'Special Offers', icon: 'local_offer' },
  { path: '/contact', label: 'Contact Us', icon: 'contact_mail' },
];

const topBarItems = [
  { icon: 'schedule', text: 'Mon-Sun: 11:30 AM - 11:00 PM' },
  { icon: 'verified', text: '100% Halal Certified', badge: true },
  { icon: 'call', text: '+1 (555) 345-6789' },
];

export function Header() {
  const location = useLocation();
  const { itemCount, total, isCartOpen, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      {/* Top Bar */}
      <div className="bg-surface-container-low px-margin-md lg:px-margin-lg py-space-xs hidden md:block">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-space-lg">
            {topBarItems.map((item, index) => (
              <span key={index} className="flex items-center gap-space-xs">
                {item.badge && (
                  <span className="flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-0.5 rounded">
                    <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                    {item.text}
                  </span>
                )}
                {!item.badge && (
                  <>
                    <span className="material-symbols-outlined text-[14px] text-primary">{item.icon}</span>
                    {item.text}
                  </>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-space-xs cursor-pointer hover:text-on-surface">
            <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
            <span>Delivery to:</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Karachi / Downtown branch</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="h-20 max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg flex items-center justify-between gap-space-md">
        {/* Logo */}
        <div className="flex items-center gap-space-md">
          <Link to="/" className="flex items-center gap-space-sm" data-path="home">
            <img
              alt="Karachi Bites Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMs2FQFJpjV8sX5eH8uk_0LEI5PPLj1AlhY7HHE9FdvpLqNZogxytBXcswA01hGb1y9YiyGuRnC8DcdHZx8Wrxqa-5YRM5A4tNPq96LdA0J5mhom4DvkRcqgWvXsViQe5hbtlidlrK2jf4hqlI6kVTyWEXpX4CmVTTVOSGtcqbdMEppHl2k3Ep2viWMdy4tnVchc0v0Kw1BMEXL--hDe8269__HTOTaTUMs29yM6xl"
            />
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">Karachi Bites</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-space-md" data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg px-space-md py-space-sm">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors px-space-md py-space-sm ${
                location.pathname === item.path
                  ? 'bg-primary-container text-on-primary-container font-semibold rounded-lg'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              data-path={item.label.toLowerCase().replace(' ', '-')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-space-md">
          {/* Search Button */}
          <button
            aria-label="Search menu"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          {/* Cart Button */}
          <button
            aria-label="Shopping Cart"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex items-center gap-space-xs bg-surface-container-low hover:bg-surface-container-high px-space-md py-space-sm rounded-full transition-colors"
            type="button"
          >
            <span className="relative flex items-center">
              <span className="material-symbols-outlined text-[20px] text-primary">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-secondary text-on-secondary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline font-label-md text-label-md text-on-surface font-semibold ml-space-xs">
              {itemCount} item{itemCount !== 1 ? 's' : ''} • ${(total / 100).toFixed(2)}
            </span>
          </button>

          {/* Order Online Button */}
          <Link
            to="/checkout"
            className="hidden sm:inline-flex items-center justify-center bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg transition-colors shadow-sm"
            data-path="order-online"
          >
            Order Online
          </Link>

          {/* Profile */}
          <div className="flex items-center pl-space-xs">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_kpftDU903AdecLCa7p2Gcf8aqpDa2JZ50pr0ouFTI3lOpAOnio6j8ZSC49Dgq4AL4eUQJ8HMJ3i-20TaALWJRY8p08VkHWflvObEOuC9U1OItfRyzP9iBXMlXKX_RHDAfzGhTU91c_BE5Kkls4XJ_pY7--s_JzRTJ3XKjjI78rEXSVWhRnhokxz9rb5GoD1sjf_uAeGgBigyFBd5dH7CodG9XXTOHyYqZbdKnh5Z"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-outline-variant px-margin-md py-space-md">
          <nav className="flex flex-col gap-space-xs">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <Link
              to="/checkout"
              className="mt-space-sm inline-flex items-center justify-center bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg transition-colors shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Order Online
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}