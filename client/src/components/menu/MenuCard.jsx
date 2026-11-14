import { useCart } from '../../context/CartContext';
import { QuantityStepper } from '../common/QuantityStepper';

export function MenuCard({ item }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
  };

  // Category icons mapping
  const categoryIcons = {
    'BBQ': 'skillet',
    'Karahi': 'soup_kitchen',
    'Rice': 'rice_bowl',
    'Rolls': 'wrap_text',
    'Drinks': 'emoji_food_beverage',
    'Desserts': 'icecream',
  };

  // Tag display
  const tagLabels = {
    'spicy': { label: 'Spicy', icon: 'local_fire_department', color: 'text-secondary' },
    'mild': { label: 'Mild', icon: 'local_fire_department', color: 'text-outline' },
    'veg': { label: 'Vegetarian', icon: 'eco', color: 'text-tertiary' },
  };

  const tags = item.tags || [];
  const primaryTag = tags[0];
  const tagInfo = primaryTag ? tagLabels[primaryTag] : null;

  // Price formatting
  const formatPrice = (price) => `Rs. ${price.toLocaleString()}`;

  return (
    <article className="card group">
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={item.image || `https://lh3.googleusercontent.com/aida-public/AB6AXuAvPxLhuM3Hgq3GoyfpEbexJjkYp3PWv83FAOLBDxkUj5czqvnzWD6khhPlFMBLbv5eb0wg-dU4zbcox3ltyV975u9JCEHxaUDIRB9j_83GzMlMRusVsWRZP64oTkItrj-_wLw4wzXGIAaSjjdn3c-Xv8PmeoTb3WUu9cTAkOnWURa90R40-qU0PnsTRlpI0A4in88osika2sBpxC3k6EpXWqgvNe88uAEAwm14G4ie`}
          alt={item.name}
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-space-sm left-space-sm flex flex-col gap-1">
          <span className="bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[12px] text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
            Halal
          </span>
        </div>
        <div className="absolute top-space-sm right-space-sm bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[13px] text-on-surface-variant">schedule</span>
          20 min
        </div>
        {/* Spice/Tag indicator */}
        {tagInfo && (
          <div className="absolute bottom-space-sm left-space-sm bg-surface/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[12px] {tagInfo.color}" style={{fontVariationSettings: "'FILL' 1"}}>{tagInfo.icon}</span>
            <span className="font-label-sm text-[10px] {tagInfo.color} font-bold ml-1">{tagInfo.label}</span>
          </div>
        )}
      </div>
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">{item.name}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
            {item.description || 'Delicious authentic Karachi dish prepared with traditional spices.'}
          </p>
        </div>
        <div className="pt-space-xs flex flex-col gap-space-sm">
          <div className="flex items-baseline justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Portion: Standard</span>
            <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight">{formatPrice(item.price)}</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <QuantityStepper
              value={1}
              min={1}
              max={50}
              onChange={() => {}}
              aria-label={`${item.name} quantity`}
            />
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary hover:bg-primary-container text-on-primary py-2 px-space-sm rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}