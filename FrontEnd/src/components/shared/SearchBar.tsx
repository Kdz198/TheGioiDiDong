import { Input } from "@/components/ui/input";
import { DEBOUNCE_DELAY_MS } from "@/constants/app.const";
import type { Product } from "@/interfaces/product.types";
import { ROUTES } from "@/router/routes.const";
import { productService } from "@/services/productService";
import { formatVND } from "@/utils/formatPrice";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Tìm kiếm sản phẩm..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await productService.getProducts({ search: searchQuery, pageSize: 5 });
      setSuggestions(result.items);
      setIsOpen(result.items.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/products/${product.id}`);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pr-8 pl-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Xóa tìm kiếm">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-500">Đang tìm kiếm...</div>
          ) : (
            <ul>
              {suggestions.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleSuggestionClick(product)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50">
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{product.name}</p>
                      <p className="text-xs text-red-400">{formatVND(product.defaultPrice)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
