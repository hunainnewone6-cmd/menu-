import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/Home/HomePage';
import { MenuPage } from './pages/Menu/MenuPage';
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmation/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTracking/OrderTrackingPage';
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import './App.css';

// ─── Missing pages (built from website-pages/ design specs) ────────────────

function AboutPage() {
  return (
    <div className="w-full">
      <section className="relative bg-surface-container-low py-margin-lg">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg relative z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Our Story</span>
          <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight mt-space-xs mb-space-md">Karachi Bites</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Born on the bustling streets of Burns Road, Karachi Bites brings the authentic flavors of Karachi&#x2019;s legendary night markets straight to your table. Every dish tells a story &#x2014; of charcoal-fired seekh kebabs sizzling over live flame, of hand-pounded biryani rice layered with tender meat and whole spices, of recipes passed down through generations of street food artisans.
          </p>
        </div>
      </section>

      <section className="bg-surface py-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-lg">Our Three Culinary Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-margin-md">
            {[
              { icon: 'fireplace', title: 'Fire &amp; Coal Tradition', desc: 'Every BBQ item is grilled over natural charcoal in our traditional tandoor pits, locking in smoky flavor that gas grills simply cannot replicate.' },
              { icon: 'verified', title: '100% Zabiha Halal Certified', desc: 'We source only certified halal meats, hand-slaughtered according to Islamic tradition. Every ingredient meets the highest standards of purity.' },
              { icon: 'menu_book', title: 'Generational Recipes', desc: 'Our recipes come from the original Burns Road food stalls, preserved and perfected across three generations of Karachi chefs.' },
            ].map((pillar, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_4px_20px_-2px_rgba(28,25,23,0.06)]">
                <span className="material-symbols-outlined text-4xl text-primary mb-space-md">{pillar.icon}</span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-sm">{pillar.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container py-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-md">Three Locations, One Standard</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-lg">
            Whether you visit us in Clifton, Gulshan-e-Iqbal, or North Nazimabad, every dish meets the same uncompromising standard of quality, freshness, and authenticity.
          </p>
          <div className="flex flex-wrap justify-center gap-space-lg">
            {['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'].map(branch => (
              <span key={branch} className="bg-surface text-on-surface font-label-lg text-label-lg font-semibold px-space-lg py-space-sm rounded-lg shadow-sm">
                {branch}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-lg">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-margin-md">
            {[
              { icon: 'local_fire_department', title: 'Lava Rock Pit Grilling', desc: 'Our BBQ items are cooked over lava rocks and natural charcoal, not gas flames &#x2014; producing the authentic Burns Road char.' },
              { icon: 'restaurant', title: 'Handmade Every Day', desc: 'Our dough, sauces, and spice blends are prepared fresh daily in small batches &#x2014; no mass production, no shortcuts.' },
              { icon: 'eco', title: 'Locally Sourced Ingredients', desc: 'We work with local farms and suppliers across Karachi to source the freshest produce, meats, and spices.' },
              { icon: 'security', title: 'Halal Integrity Promise', desc: 'From farm to table, our halal certification chain is fully traceable and audited by recognized certifying bodies.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <span className="material-symbols-outlined text-3xl text-primary flex-shrink-0 mt-1">{item.icon}</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">{item.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Backend has no dedicated contact endpoint — logs locally for manual processing
    console.log('Contact form submitted:', formState);
    setSubmitted(true);
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <div className="w-full">
      <section className="relative bg-surface-container-low py-margin-lg">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg relative z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Get In Touch</span>
          <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight mt-space-xs mb-space-md">Contact Us</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Have a question, feedback, or want to book a private catering event? Reach out &#x2014; our team responds within 24 hours.
          </p>
        </div>
      </section>

      <section className="bg-surface py-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-margin-lg">
            {/* Info Cards */}
            <div className="flex flex-col gap-margin-md">
              {[
                { icon: 'call', title: 'Call Our Kitchen', lines: ['+92 21 3456 7890', '+92 300 123 4567 (WhatsApp)'] },
                { icon: 'mail', title: 'Email &amp; Inquiries', lines: ['hello@karachibites.pk', 'catering@karachibites.pk'] },
                { icon: 'location_on', title: 'Visit Our Restaurant', lines: ['Downtown Branch: 404 Spices Blvd, Karachi', 'Open Daily 11:30 AM &#x2013; 11:00 PM'] },
              ].map((card, i) => (
                <div key={i} className="flex gap-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                  <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0 mt-0.5">{card.icon}</span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">{card.title}</h3>
                    {card.lines.map(l => (
                      <p key={l} className="font-body-md text-body-md text-on-surface-variant">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-space-md">Send Us a Message</h2>
              {submitted ? (
                <div className="text-center py-margin-md">
                  <span className="material-symbols-outlined text-5xl text-tertiary mb-space-md">check_circle</span>
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold mb-space-xs">Message Sent!</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">We&#x2019;ll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-space-md text-primary hover:text-on-surface font-label-md text-label-md underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                  <div>
                    <label htmlFor="contact-name" className="font-label-md text-label-md text-on-surface">Your Name</label>
                    <input id="contact-name" type="text" required value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))} className="w-full mt-space-xs bg-surface-container-low rounded-lg px-space-md py-space-sm font-body-md text-body-md text-on-surface border border-outline-variant focus:outline-none focus:border-primary transition-colors" placeholder="Ali Khan" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="font-label-md text-label-md text-on-surface">Email Address</label>
                    <input id="contact-email" type="email" required value={formState.email} onChange={e => setFormState(s => ({ ...s, email: e.target.value }))} className="w-full mt-space-xs bg-surface-container-low rounded-lg px-space-md py-space-sm font-body-md text-body-md text-on-surface border border-outline-variant focus:outline-none focus:border-primary transition-colors" placeholder="ali@example.com" />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="font-label-md text-label-md text-on-surface">Message</label>
                    <textarea id="contact-message" rows={5} required value={formState.message} onChange={e => setFormState(s => ({ ...s, message: e.target.value }))} className="w-full mt-space-xs bg-surface-container-low rounded-lg px-space-md py-space-sm font-body-md text-body-md text-on-surface border border-outline-variant focus:outline-none focus:border-primary transition-colors resize-y" placeholder="Tell us how we can help..." />
                  </div>
                  <button type="submit" className="self-start bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold px-space-lg py-space-sm rounded-lg transition-colors shadow-sm">
                    Send Message
                  </button>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Note: We do not currently have a server-side contact endpoint. Your message is logged locally and will be processed manually.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container py-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-lg">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-margin-md">
            {[
              { q: 'Do you deliver to my area?', a: 'Yes &#x2014; we deliver across Karachi including Clifton, Gulshan, North Nazimabad, DHA, and Bahria Town. Delivery charges apply based on distance.' },
              { q: 'Are your foods 100% Halal?', a: 'Absolutely. All our meats are Zabiha Halal certified and sourced from approved vendors. We maintain full traceability from farm to plate.' },
              { q: 'Can I order for a large event?', a: 'Yes! We offer catering for events of all sizes. Contact us at catering@karachibites.pk or call +92 21 3456 7890 to discuss your requirements.' },
              { q: 'How do I track my order?', a: 'After placing an order, you receive an order ID via SMS. Use that ID plus your mobile number at /track to follow your order in real time.' },
            ].map((faq, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl p-space-md">
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface mb-space-xs">
                  <span className="text-primary mr-space-xs">{String(i + 1).padStart(2, '0')}.</span>{faq.q}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant ml-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SpecialOffersPage() {
  // No offers API endpoint exists — statically configured per assignment spec.
  const offers = [
    { badge: 'COMING SOON', title: 'Grand Ramadan Iftar Box', desc: 'A curated iftar platter featuring dates, samosas, seeks, and our signature biryani &#x2014; perfect for breaking fast with family.', price: null, available: false },
    { badge: 'NEW', title: 'Weekend Family Feast', desc: 'Feed the whole family with our combo: 2 Karahi halves, 1kg Biryani, 6 Seekh Kebabs, Raita, and Naan &#x2014; enough for 4&#x2013;6 people.', price: 3499, available: true },
    { badge: 'WEEKDAY DEAL', title: 'Express Lunch Box', desc: 'Quick weekday lunch: your choice of Karahi or Biryani, raita, naan, and a drink &#x2014; served in under 20 minutes.', price: 650, available: true },
    { badge: 'MIDNIGHT CRAVINGS', title: 'Midnight Roll Duo', desc: 'Two paratha rolls of your choice &#x2014; perfect for late-night hunger. Available 10 PM &#x2013; 1 AM at select branches.', price: 750, available: true },
    { badge: 'STUDENT SPECIAL', title: 'Study Night Combo', desc: 'Affordable meal deal: Chicken Malai Boti plate, chai, and gulab jamun &#x2014; designed for students on a budget.', price: 550, available: true },
    { badge: 'FIRST ORDER', title: 'Welcome Discount', desc: 'New customer? Get 15% off your first order when you sign up for our newsletter. Terms apply.', price: null, available: false },
  ];

  return (
    <div className="w-full">
      <section className="relative bg-surface-container-low py-margin-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg relative z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Limited-Time Deals</span>
          <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight mt-space-xs mb-space-md">Special Offers</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            From weekday lunch deals to weekend family feasts &#x2014; discover savings that make authentic Karachi cuisine even more accessible.
          </p>
        </div>
      </section>

      <section className="bg-surface py-margin-lg">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-margin-md">
            {offers.map((offer, i) => (
              <div
                key={i}
                className={`bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(28,25,23,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(141,75,0,0.12)] transition-all duration-300 flex flex-col ${!offer.available ? 'opacity-70' : ''}`}
              >
                <div className="h-48 bg-surface-container flex items-center justify-center relative overflow-hidden">
                  {!offer.available && (
                    <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="font-headline-md text-headline-md font-bold text-on-surface bg-surface-container px-space-md py-space-xs rounded-lg">Not Yet Available</span>
                    </div>
                  )}
                  <img
                    src={`https://images.unsplash.com/photo-${offer.badge === 'COMING SOON' ? '156555762983Z-12805a33e7db' : offer.badge === 'NEW' ? '1567627537203-fe8dd3699702' : offer.price ? '1626804475341-d13d354c420a' : '1555939598-53c728a94b45'}?auto=format&fit=crop&w=600&q=80`}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-space-sm left-space-sm font-label-sm text-label-sm font-bold px-space-sm py-space-xs rounded-full ${offer.available ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'}`}>
                    {offer.badge}
                  </span>
                </div>
                <div className="p-space-md flex flex-col flex-1">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-xs">{offer.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant flex-1">{offer.desc}</p>
                  {offer.price !== null && (
                    <div className="mt-space-md flex items-center justify-between">
                      <span className="font-headline-lg text-headline-lg font-bold text-primary">Rs. {offer.price.toLocaleString()}</span>
                      {offer.available && (
                        <a href="/cart" className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold px-space-md py-space-sm rounded-lg transition-colors">
                          Add to Cart
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-margin-lg bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg font-bold mb-space-xs">Never Miss a Deal</h2>
              <p className="font-body-md text-body-md opacity-90">Subscribe to our newsletter for exclusive offers delivered to your inbox.</p>
            </div>
            <div className="flex gap-space-sm w-full md:w-auto">
              <input type="email" placeholder="Enter your email" className="bg-white/20 border border-white/30 rounded-lg px-space-md py-space-sm font-body-md text-on-tertiary-fixed placeholder:text-on-tertiary-fixed/60 flex-1 md:max-w-xs focus:outline-none focus:border-white" />
              <button className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md font-bold px-space-md py-space-sm rounded-lg transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-margin-md">
      <span className="material-symbols-outlined text-8xl text-outline mb-space-md">error_outline</span>
      <h1 className="font-display-lg text-display-lg-mobile text-on-surface font-bold mb-space-sm">404</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
        The page you&#x2019;re looking for doesn&#x2019;t exist. It may have been moved or removed.
      </p>
      <a href="/" className="mt-space-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold px-space-lg py-space-md rounded-lg transition-colors shadow-sm">
        Back to Home
      </a>
    </div>
  );
}

// Guard component: redirect to admin login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = __USE_NAVIGATE_PLACEHOLDER__;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.hash = '/admin/login';
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">refresh</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return children;
}

function AppContent() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-surface text-on-surface">
            <Header />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/special-offers" element={<SpecialOffersPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
