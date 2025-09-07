import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
  options: string[];
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustomInput?: boolean;
  onAddCustomValue?: (value: string) => void;
  customAddText?: string;
}

export function Autocomplete({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner...",
  emptyText = "Aucun résultat trouvé.",
  searchPlaceholder = "Rechercher...",
  className,
  disabled = false,
  allowCustomInput = false,
  onAddCustomValue,
  customAddText = "Ajouter",
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  const handleSelect = (selectedValue: string) => {
    const option = options.find(
      (option) => option.toLowerCase() === selectedValue.toLowerCase()
    );
    if (option) {
      onValueChange(option);
    }
    setOpen(false);
    setSearchValue("");
  };

  const handleAddCustom = () => {
    if (searchValue.trim() && onAddCustomValue) {
      onAddCustomValue(searchValue.trim());
      onValueChange(searchValue.trim());
      setOpen(false);
      setSearchValue("");
    }
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
      <PopoverContent className="w-full p-0 bg-background border z-50" align="start">
        <Command shouldFilter={false} className="max-h-[300px]">
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredOptions.length === 0 ? (
              <div className="p-2">
                <div className="text-sm text-muted-foreground py-2">{emptyText}</div>
                {allowCustomInput && searchValue.trim() && (
                  <CommandItem
                    onSelect={handleAddCustom}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {customAddText} "{searchValue}"
                  </CommandItem>
                )}
              </div>
            ) : (
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
                {allowCustomInput && searchValue.trim() && !filteredOptions.some(
                  option => option.toLowerCase() === searchValue.toLowerCase()
                ) && (
                  <CommandItem
                    onSelect={handleAddCustom}
                    className="cursor-pointer border-t"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {customAddText} "{searchValue}"
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}