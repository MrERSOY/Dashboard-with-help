// components/ui/product-filter-sidebar.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";

// Bu bileşenin alacağı proplar için tip tanımı
type ProductFilterSidebarProps = {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  allCategories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  allBrands: string[];
  selectedBrands: string[];
  onBrandChange: (brand: string) => void;
  priceRange: number[];
  onPriceChange: (range: number[]) => void;
  maxPrice: number;
};

export function ProductFilterSidebar({
  searchTerm,
  onSearchTermChange,
  allCategories,
  selectedCategories,
  onCategoryChange,
  allBrands,
  selectedBrands,
  onBrandChange,
  priceRange,
  onPriceChange,
  maxPrice,
}: ProductFilterSidebarProps) {
  return (
    <aside className="w-full md:w-72 lg:w-80 flex-shrink-0 p-6 bg-white border-l h-full">
      <h3 className="text-xl font-semibold mb-6">Filtreler</h3>

      <div className="space-y-8">
        {/* Text ile Arama */}
        <div>
          <label className="text-sm font-medium mb-2 block">Ürün Ara</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ürün adı, kategorisi..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
        </div>

        {/* Kategori Filtresi */}
        <div>
          <h4 className="font-semibold mb-3">Kategori</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {allCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => onCategoryChange(category)}
                />
                <label
                  htmlFor={`cat-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Marka Filtresi */}
        <div>
          <h4 className="font-semibold mb-3">Marka</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {allBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => onBrandChange(brand)}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Fiyat Aralığı Filtresi */}
        <div>
          <h4 className="font-semibold mb-3">Fiyat Aralığı</h4>
          <Slider
            defaultValue={[0, maxPrice]}
            max={maxPrice}
            step={10}
            onValueChange={onPriceChange}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₺{priceRange[0]}</span>
            <span>₺{priceRange[1]}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
