import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuApi } from '../../api/menu';
import { MenuCard } from '../../components/menu/MenuCard';
import { CategoryFilter } from '../../components/menu/CategoryFilter';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { Button } from '../../components/common/Button';
import { useCart } from '../../context/CartContext';

const categoryMapping = {
  'all': null,
  'biryani': 'Rice',
  'bbq': 'BBQ',
  'karahi': 'Karahi',
  'rolls': 'Rolls',
  'chaat': 'Desserts',
  'breads': 'Desserts',
  'beverages': 'Drinks',
};

export function HomePage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const { addItem } = useCart();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await menuApi.getMenu();
      const itemsWithImages = items.map(item => ({
        ...item,
        image: getImageForItem(item.name, item.category),
        description: getDescriptionForItem(item.name, item.category),
      }));
      setMenuItems(itemsWithImages);
      setFilteredItems(itemsWithImages);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = menuItems;

    if (activeCategory !== 'all') {
      const category = categoryMapping[activeCategory];
      if (category) {
        result = result.filter(item => item.category === category);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (dietaryFilter !== 'all') {
      result = result.filter(item => {
        const tags = item.tags || [];
        switch (dietaryFilter) {
          case 'spicy':
            return tags.includes('spicy');
          case 'mild':
            return tags.includes('mild');
          case 'vegetarian':
            return tags.includes('veg');
          case 'chef-special':
            return item.name.includes('Special') || item.name.includes('Chef');
          default:
            return true;
        }
      });
    }

    setFilteredItems(result);
  }, [menuItems, activeCategory, searchQuery, dietaryFilter]);

  const handleAddToCart = (item) => {
    addItem(item, 1);
  };

  const featuredItems = menuItems.slice(0, 4);

  if (loading) {
    return (
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-space-md">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-body-lg text-body-lg text-on-surface-variant">Loading menu...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
        <div className="flex flex-col w-full">
          <section className="relative w-full bg-surface-container-low px-margin-md lg:px-margin-lg pt-space-xl pb-space-lg overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 -left-20 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-[1360px] mx-auto relative z-10 flex flex-col gap-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
                  <Link className="hover:text-primary transition-colors" to="/">Home</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-semibold">Culinary Menu</span>
                </div>
                <div className="inline-flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-md py-1 rounded-full font-label-sm text-label-sm shadow-sm">
                  <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  100% Hand-Slaughtered Zabiha Halal
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
                <div className="max-w-2xl">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Burns Road Tradition • Tandoori Heat</span>
                  <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight mt-space-xs mb-space-xs">
                    Our Authentic Karachi Menu
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Crafted fresh daily with whole spices, charcoal fire, and culinary tradition passed down through generations.
                  </p>
                </div>
                <div className="hidden xl:flex items-center gap-space-md bg-surface p-space-sm rounded-xl shadow-sm">
                  <div className="flex items-center gap-space-xs px-space-sm py-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">local_fire_department</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Smoky Charcoal</span>
                      <span className="font-label-md text-label-md text-on-surface font-bold">Lava Rock Pit</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-surface-variant"></div>
                  <div className="flex items-center gap-space-xs px-space-sm py-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Avg Prep Time</span>
                      <span className="font-label-md text-label-md text-on-surface font-bold">18-22 Mins</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-md pt-space-xs">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">search</span>
                  </div>
                  <input
                    aria-label="Search dishes"
                    className="w-full pl-12 pr-28 py-space-md py-4 bg-surface rounded-xl text-on-surface placeholder:text-outline font-body-lg text-body-lg shadow-sm focus:outline-none focus:shadow-md transition-shadow"
                    id="dish-search-input"
                    placeholder="Search biryani, karahi, rolls, kebabs..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs shadow-sm" type="button">
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                      <span className="hidden sm:inline">Filters</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs no-scrollbar">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold shrink-0 mr-space-xs">Preferences:</span>
                  <button
                    className={`bg-primary text-on-primary px-space-md py-1.5 rounded-full font-label-md text-label-md shadow-sm shrink-0 flex items-center gap-1 ${dietaryFilter === 'all' ? '' : 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
                    onClick={() => setDietaryFilter('all')}
                  >
                    <span>All Dishes</span>
                  </button>
                  <button
                    className={`bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shrink-0 flex items-center gap-1 shadow-sm ${dietaryFilter === 'spicy' ? 'bg-primary text-on-primary' : ''}`}
                    onClick={() => setDietaryFilter('spicy')}
                  >
                    <span className="material-symbols-outlined text-secondary text-[16px]">local_fire_department</span>
                    <span>Spicy</span>
                  </button>
                  <button
                    className={`bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shrink-0 flex items-center gap-1 shadow-sm ${dietaryFilter === 'mild' ? 'bg-tertiary text-on-tertiary' : ''}`}
                    onClick={() => setDietaryFilter('mild')}
                  >
                    <span className="material-symbols-outlined text-tertiary text-[16px]">eco</span>
                    <span>Mild & Savory</span>
                  </button>
                  <button
                    className={`bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shrink-0 flex items-center gap-1 shadow-sm ${dietaryFilter === 'chef-special' ? 'bg-primary text-on-primary' : ''}`}
                    onClick={() => setDietaryFilter('chef-special')}
                  >
                    <span className="material-symbols-outlined text-primary text-[16px]">award_star</span>
                    <span>Chef's Special</span>
                  </button>
                  <button
                    className={`bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shrink-0 flex items-center gap-1 shadow-sm ${dietaryFilter === 'vegetarian' ? 'bg-tertiary text-on-tertiary' : ''}`}
                    onClick={() => setDietaryFilter('vegetarian')}
                  >
                    <span className="material-symbols-outlined text-tertiary text-[16px]">nature</span>
                    <span>Vegetarian</span>
                  </button>
                  <button className="bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shrink-0 flex items-center gap-1 shadow-sm">
                    <span>Gluten-Free Options</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <section className="max-w-[1360px] mx-auto w-full px-margin-md lg:px-margin-lg py-space-xl">
            <div className="flex items-center justify-between mb-space-lg">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Featured Dishes</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Our most popular authentic Karachi delicacies</p>
              </div>
              <Link to="/menu" className="hidden sm:inline-flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold hover:underline">
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
              {featuredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>

          <section className="max-w-[1360px] mx-auto w-full px-margin-md lg:px-margin-lg py-space-xl flex flex-col gap-space-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Main Catalog</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Showing {filteredItems.length} hand-curated delicacies prepared live in our open charcoal kitchen
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-space-md py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                Kitchen Open • Taking Fresh Orders
              </div>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-space-xl text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-space-md block">search_off</span>
                <p className="font-body-lg text-body-lg">No dishes found matching your criteria</p>
                <p className="font-body-sm text-body-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </section>

          <section className="w-full bg-surface-container-low py-space-xl mt-space-lg">
            <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-lg">
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">100% Certified Zabiha</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Our chicken and beef are strictly hand-slaughtered and verified by local Halal supervisory bodies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Lava Rock Charcoal</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Authentic deep smokiness infused without artificial liquid smoke or pre-cooked freeze techniques.</p>
                  </div>
                </div>
                <div className="flex items-start gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">moped</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Thermal-Sealed Delivery</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Every dum handi and crisp paratha roll is packed in food-grade steam-vented insulation to maintain warmth.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <CartDrawer />
        </div>
      </main>
    </>
  );
}

function getImageForItem(name, category) {
  const imageMap = {
    'Chicken Malai Boti': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6tUg8XMqbQu4inoUSqeGwPhcVbs7QRdCgwM8bLjB4Jk4K0q5FhqEloe2EH6Awd91-UOYD9sXfhKLQuYrQiQe0vT62pglnHw382LP8qEur43Xs9dvtBBW-C90JJX9sbK8QSca0o89IvWlpoQD03pvfqHpVNGIdff1HMuUQZIir5xL2tUuAttWNHv3rRIE60FId9PUoMkjdQjPnpW3QoUod411v_8NquMW7Gw0aqxAv',
    'Beef Seekh Kebab': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6tUg8XMqbQu4inoUSqeGwPhcVbs7QRdCgwM8bLjB4Jk4K0q5FhqEloe2EH6Awd91-UOYD9sXfhKLQuYrQiQe0vT62pglnHw382LP8qEur43Xs9dvtBBW-C90JJX9sbK8QSca0o89IvWlpoQD03pvfqHpVNGIdff1HMuUQZIir5xL2tUuAttWNHv3rRIE60FId9PUoMkjdQjPnpW3QoUod411v_8NquMW7Gw0aqxAv',
    'Mutton Karahi (half)': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPCR8mceh8CNbxN6AuQFTUEakjxsqpYLUr1R22POgnD_w3vC1ruCy56eOHEeKYDFS7C1zvt9Fn-OZjB6C8dEs9U-UX7cQxHFI8CqyCeFl-7-qY1GDoLZ5iEdMPCa8BHalMVK-IFG1F4dRkuQzsGhtz9MdTF6kjB6agr83LdUJU3S3pFqXS3jACRV_2GbJ6Q3xtZWvogumXqZrbZ1irVL-nb32vCTlDbBwM-2Ett7gV',
    'Chicken Karahi (half)': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPCR8mceh8CNbxN6AuQFTUEakjxsqpYLUr1R22POgnD_w3vC1ruCy56eOHEeKYDFS7C1zvt9Fn-OZjB6C8dEs9U-UX7cQxHFI8CqyCeFl-7-qY1GDoLZ5iEdMPCa8BHalMVK-IFG1F4dRkuQzsGhtz9MdTF6kjB6agr83LdUJU3S3pFqXS3jACRV_2GbJ6Q3xtZWvogumXqZrbZ1irVL-nb32vCTlDbBwM-2Ett7gV',
    'Chicken Biryani': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvPxLhuM3Hgq3GoyfpEbexJjkYp3PWv83FAOLBDxkUj5czqvnzWD6khhPlFMBLbv5eb0wg-dU4zbcox3ltyV975u9JCEHxaUDIRB9j_83GzMlMRusVsWRZP64oTkItrj-_wLw4wzXGIAaSjjdn3c-Xv8PmeoTb3WUu9cTAkOnWURa90R40-qU0PnsTRlpI0A4in88osika2sBpxC3k6EpXWqgvNe88uAEAwm14G4ie',
    'Vegetable Pulao': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvPxLhuM3Hgq3GoyfpEbexJjkYp3PWv83FAOLBDxkUj5czqvnzWD6khhPlFMBLbv5eb0wg-dU4zbcox3ltyV975u9JCEHxaUDIRB9j_83GzMlMRusVsWRZP64oTkItrj-_wLw4wzXGIAaSjjdn3c-Xv8PmeoTb3WUu9cTAkOnWURa90R40-qU0PnsTRlpI0A4in88osika2sBpxC3k6EpXWqgvNe88uAEAwm14G4ie',
    'Zinger Paratha Roll': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHZw9OZjcGKg2Y35KhU7aiDtlIPk8ZnMqDR6ah5wG1kUssU0D_dtJZALFbnzWZ9QURbTpkj1WL20n2OfAa0GDZH7ogFHXebfAQjMnZuSH9wqM4qRSCuxsN07ulIkZMdLkLDehk7nMxsjgna8lCFCuD_FAsqjKDj8fb91tA1z4Oz5mf1xFKtBooKVXFAtmHZ7881HtRGWXdQp263poiJf1mGMrWymqZqA1FFHe9LHVC',
    'Paneer Tikka Roll': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHZw9OZjcGKg2Y35KhU7aiDtlIPk8ZnMqDR6ah5wG1kUssU0D_dtJZALFbnzWZ9QURbTpkj1WL20n2OfAa0GDZH7ogFHXebfAQjMnZuSH9wqM4qRSCuxsN07ulIkZMdLkLDehk7nMxsjgna8lCFCuD_FAsqjKDj8fb91tA1z4Oz5mf1xFKtBooKVXFAtmHZ7881HtRGWXdQp263poiJf1mGMrWymqZqA1FFHe9LHVC',
    'Mint Margarita': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtB2Y-dxb1eaAksssN2tuahHtJA3Hhm7hMVTnlIPMAo_AcGDemY3K8h-QlK4H7T7eGM8my7hrdq2Krps7rVNV1uRBTUJ1DYwPF61iB6xSCjoUiJAtRRZJqqGFAkv5Rm0hEW3h773kLopcJFJMU2n_KrKqtHSEbZ4nTsucd1JNlFLzUVhB-Z5Nfyeafe_ogQfa_eXtufinl7d5hC7fdwCM21Ps6OjgwwsmKo3s67jV6',
    'Doodh Patti Chai': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtB2Y-dxb1eaAksssN2tuahHtJA3Hhm7hMVTnlIPMAo_AcGDemY3K8h-QlK4H7T7eGM8my7hrdq2Krps7rVNV1uRBTUJ1DYwPF61iB6xSCjoUiJAtRRZJqqGFAkv5Rm0hEW3h773kLopcJFJMU2n_KrKqtHSEbZ4nTsucd1JNlFLzUVhB-Z5Nfyeafe_ogQfa_eXtufinl7d5hC7fdwCM21Ps6OjgwwsmKo3s67jV6',
    'Gulab Jamun (2 pcs)': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDencoUb-BOI6FovzZcqYbUuOikPvbaHf32ziJjkGksOXAx-gzIlDNh3LHHgnpdRBqgxhbtz6JriQrYr3YcdEwVZh2LPqhVjfHls2d5k2OMc11sYUB86ab9dM73pZnn2YjicBnzwmqMNuW_8m5QKRW6CO4tLcR0b-KWTFE5iiplcEI8dE6dAaTVnkQ-FdWHW5Owz1JTudy1HlacbAIyKycGcsA7KWw7Ivm5_RRYLkwJ',
    'Kheer': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDencoUb-BOI6FovzZcqYbUuOikPvbaHf32ziJjkGksOXAx-gzIlDNh3LHHgnpdRBqgxhbtz6JriQrYr3YcdEwVZh2LPqhVjfHls2d5k2OMc11sYUB86ab9dM73pZnn2YjicBnzwmqMNuW_8m5QKRW6CO4tLcR0b-KWTFE5iiplcEI8dE6dAaTVnkQ-FdWHW5Owz1JTudy1HlacbAIyKycGcsA7KWw7Ivm5_RRYLkwJ',
  };
  return imageMap[name] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvPxLhuM3Hgq3GoyfpEbexJjkYp3PWv83FAOLBDxkUj5czqvnzWD6khhPlFMBLbv5eb0wg-dU4zbcox3ltyV975u9JCEHxaUDIRB9j_83GzMlMRusVsWRZP64oTkItrj-_wLw4wzXGIAaSjjdn3c-Xv8PmeoTb3WUu9cTAkOnWURa90R40-qU0PnsTRlpI0A4in88osika2sBpxC3k6EpXWqgvNe88uAEAwm14G4ie';
}

function getDescriptionForItem(name, category) {
  const descriptions = {
    'Chicken Malai Boti': 'Tender chicken pieces marinated in rich cream, yogurt, and aromatic spices, grilled to perfection over charcoal.',
    'Beef Seekh Kebab': 'Minced beef skewers infused with green chilies, coriander, raw papaya marinade, charred over open charcoal coals.',
    'Mutton Karahi (half)': 'Fresh wok-tossed mutton cooked strictly in juicy tomatoes, ginger slivers, and black pepper in pure butter.',
    'Chicken Karahi (half)': 'Fresh wok-tossed chicken cooked strictly in juicy tomatoes, ginger slivers, and black pepper in pure butter.',
    'Chicken Biryani': 'Aged long-grain basmati cooked with saffron, tender farm chicken, and authentic spiced aloo (potatoes).',
    'Vegetable Pulao': 'Fragrant basmati rice cooked with seasonal vegetables, whole spices, and herbs.',
    'Zinger Paratha Roll': 'Crispy flaky paratha filled with spicy chicken zinger, fresh vegetables, and signature sauces.',
    'Paneer Tikka Roll': 'Grilled paneer tikka wrapped in flaky paratha with mint chutney and pickled onions.',
    'Mint Margarita': 'Refreshing mint lemonade with a hint of spices, served chilled.',
    'Doodh Patti Chai': 'Authentic slow-brewed black tea leaves cooked with crushed green cardamom, whole milk, and subtle jaggery.',
    'Gulab Jamun (2 pcs)': 'Soft milk-solid dumplings soaked in rose-saffron cardamom syrup.',
    'Kheer': 'Traditional rice pudding slow-cooked with milk, cardamom, and nuts.',
  };
  return descriptions[name] || 'Delicious authentic Karachi dish prepared with traditional spices and fresh ingredients.';
}