import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface mt-margin-lg">
      <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-margin-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-lg">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img
                alt="Karachi Bites Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMs2FQFJpjV8sX5eH8uk_0LEI5PPLj1AlhY7HHE9FdvpLqNZogxytBXcswA01hGb1y9YiyGuRnC8DcdHZx8Wrxqa-5YRM5A4tNPq96LdA0J5mhom4DvkRcqgWvXsViQe5hbtlidlrK2jf4hqlI6kVTyWEXpX4CmVTTVOSGtcqbdMEppHl2k3Ep2viWMdy4tnVchc0v0Kw1BMEXL--hDe8269__HTOTaTUMs29yM6xl"
              />
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Karachi Bites</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Bringing the rich culinary heritage, sizzling charcoal grills, and aromatic street flavors of Burns Road and Karachi's night food markets directly to your table.
            </p>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <span className="flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-space-xs rounded font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>100% Certified Halal Meat
              </span>
            </div>
            <div className="flex items-center gap-space-md pt-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">public</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">photo_camera</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">smart_display</span>
              <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">chat</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Quick Links</span>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/">Home</Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/menu">Menu</Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/about">About Us</Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/special-offers">Special Offers</Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/contact">Contact Us</Link>
          </div>

          {/* Cuisines */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Cuisines</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Biryani & Rice</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Karahi & Handi</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Seekh Kebabs</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Paratha Rolls</span>
            <span className="font-body-md text-body-md text-on-surface-variant">Chaat & Street Snacks</span>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-space-md">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Get 15% Off</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Subscribe to our club for exclusive deals, secret dishes, and 15% off your very first delivery order.
            </p>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center bg-surface rounded-lg p-space-xs shadow-sm">
                <input
                  className="w-full bg-transparent px-space-sm py-space-xs font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                  placeholder="Enter your email"
                  type="email"
                />
                <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-xs rounded transition-colors" type="button">
                  Join
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
              <span className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>Downtown Branch, 404 Spices Blvd
              </span>
              <span className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>11:30 AM - 11:00 PM Daily
              </span>
            </div>
          </div>
        </div>

        <div className="mt-margin-md pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <p>© 2025 Karachi Bites Culinary Group. All rights reserved.</p>
          <div className="flex items-center gap-space-md">
            <Link className="hover:text-on-surface transition-colors" href="#">Privacy Policy</Link>
            <Link className="hover:text-on-surface transition-colors" href="#">Terms of Service</Link>
            <Link className="hover:text-on-surface transition-colors" href="#">Halal Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}