"use client";

import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useState, useMemo } from "react";
import { useCategorySearchQuery } from "@/lib/hooks/queries/useCategorySearchQuery";
import { useCategoriesQuery } from "@/lib/hooks/queries/useCategoriesQuery";
import { useCategorySearchStore } from "@/lib/stores/useCategorySearchStore";
import type { Category } from "@/lib/types/category";

/**
 * Utility: باز کردن درخت دسته‌ها به صورت فلت برای Autocomplete
 */
function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];

  const recurse = (list: Category[]) => {
    for (const cat of list) {
      result.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
      });
      if (cat.subCategories?.length) recurse(cat.subCategories);
    }
  };

  recurse(categories);
  return result;
}

/**
 * ✅ CategorySelectSearch
 * - نمایش تمام کتگوری‌ها در حالت عادی (getAllWithChildren)
 * - جستجوی زنده (search?q=)
 * - همگام با React Hook Form و Zustand
 */
export function CategorySelectSearch() {
  const { control, setValue, watch } = useFormContext();
  const selectedCategoryId = watch("categoryId");
  const [inputValue, setInputValue] = useState("");

  // لیست کامل همه کتگوری‌ها
  const { data: allCategoriesTree = [], isFetching: fetchingAll } =
    useCategoriesQuery();

  // جستجوی زنده
  const { data: searchResults = [], isFetching: fetchingSearch } =
    useCategorySearchQuery(inputValue);

  // تبدیل داده درختی به فلت فقط یکبار
  const allCategories = useMemo(
    () => flattenCategories(allCategoriesTree),
    [allCategoriesTree]
  );

  // منبع نهایی دیتا (بین حالت عادی و سرچ زنده)
  const isSearching = inputValue.trim().length >= 2;
  const results = isSearching ? searchResults : allCategories;

  // وضعیت انتخاب کتگوری در Zustand
  const { selectedCategory, setSelectedCategory } = useCategorySearchStore();

  // مقدار انتخاب‌شده‌ی فعلی از RHF یا Zustand
  const currentValue =
    results.find((c) => c.id === selectedCategoryId) ||
    selectedCategory ||
    null;

  return (
    <Controller
      control={control}
      name="categoryId"
      render={({ field }) => (
        <Autocomplete
          disablePortal
          autoHighlight
          includeInputInList
          filterOptions={(x) => x} // جلوگیری از فیلتر داخلی MUI
          sx={{ width: 320 }}
          options={results}
          value={currentValue}
          getOptionLabel={(option) => option?.name || ""}
          loading={isSearching ? fetchingSearch : fetchingAll}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={(_, newValue) => {
            field.onChange(newValue ? newValue.id : 0);
            setValue("categoryId", newValue ? newValue.id : 0);
            setSelectedCategory(newValue);
          }}
          onInputChange={(_, newInputValue, reason) => {
            if (reason === "input") setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="دسته‌بندی"
              placeholder="جست‌وجو..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {(fetchingAll || fetchingSearch) && (
                      <CircularProgress size={18} />
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    />
  );
}
