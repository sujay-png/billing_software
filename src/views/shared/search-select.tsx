"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type SearchOption = {
  value: string;
  label: string;
  description?: string;
};

export function SearchSelect({
  value,
  placeholder,
  options,
  emptyLabel = "Nothing matches",
  onSelect,
  allowCustom = false,
  customLabel = "Use",
}: {
  value: string;
  placeholder: string;
  options: SearchOption[];
  emptyLabel?: string;
  onSelect: (option: SearchOption | null, query: string) => void;
  allowCustom?: boolean;
  customLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const hasExact = options.some((option) => option.label.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-full justify-between bg-white px-2.5 font-normal",
        )}
      >
        <span className={value ? "truncate" : "truncate text-muted-foreground"}>{value || placeholder}</span>
        <ChevronsUpDown className="size-3.5 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] min-w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}`} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {allowCustom && trimmed && !hasExact ? (
                <CommandItem
                  value={`custom-${trimmed}`}
                  onSelect={() => {
                    onSelect(null, trimmed);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {customLabel} “{trimmed}”
                </CommandItem>
              ) : null}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.description ?? ""} ${option.value}`}
                  onSelect={() => {
                    onSelect(option, option.label);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{option.label}</span>
                    {option.description ? (
                      <span className="truncate text-xs text-muted-foreground">{option.description}</span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
