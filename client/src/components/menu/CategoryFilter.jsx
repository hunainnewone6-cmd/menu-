import { useState, useEffect } from 'react';

const categories = [
  { id: 'all', label: 'All Dishes', icon: 'restaurant' },
  { id: 'biryani', label: 'Biryani & Rice', icon: 'rice_bowl' },
  { id: 'bbq', label: 'Charcoal BBQ', icon: 'skillet' },
  { id: 'karahi', label: 'Karahi & Curries', icon: 'soup_kitchen' },
  { id: 'rolls', label: 'Paratha Rolls', icon: 'wrap_text' },
  { id: 'chaat', label: 'Appetizers & Chaat', icon: 'tapas' },
  { id: 'breads', label: 'Fresh Tandoor Breads', icon: 'bakery_dining' },
  { id: 'beverages', label: 'Beverages & Chai', icon: 'emoji_food_beverage' },
];

export function CategoryFilter({ activeCategory, onCategoryChange }) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryClick = (category) => {
    onCategoryChange(category.id);
    scrollToCategory(category.id);
  };

  return (
    <nav className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg">
        <div className="flex items-center gap-space-sm overflow-x-auto py-space-sm no-scrollbar"
             onScroll={(e) => setScrollPosition(e.target.scrollLeft)}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`shrink-0 flex items-center gap-space-xs px-space-md py-2 rounded-lg font-label-md text-label-md transition-all ${
                activeCategory === category.id
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              aria-pressed={activeCategory === category.id}
            >
              <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}