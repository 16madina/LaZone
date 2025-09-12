import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AutocompleteProps {
  value?: string;
  onValueChange: (value: string) => void;
  options?: string[];
  suggestions?: Array<{ label: string; value: string; type?: string }>;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Autocomplete({
  value,
  onValueChange,
  options = [],
  suggestions = [],
  placeholder = "Sélectionner...",
  emptyText = "Aucun résultat trouvé.",
  searchPlaceholder = "Rechercher...",
  className,
  disabled = false,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Use suggestions if provided, otherwise use options
  const allOptions = React.useMemo(() => {
    if (suggestions.length > 0) {
      return suggestions.map(s => s.label);
    }
    return options;
  }, [options, suggestions]);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return allOptions;
    return allOptions.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [allOptions, searchValue]);

  const handleSelect = (selectedValue: string) => {
    const option = allOptions.find(
      (option) => option.toLowerCase() === selectedValue.toLowerCase()
    );
    if (option) {
      onValueChange(option);
    }
    setOpen(false);
    setSearchValue("");
  };

  const displayValue = value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className={cn(
            "truncate",
            !value && "text-muted-foreground"
          )}>
            {displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}