"use client";

import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useState, useMemo, useEffect } from "react";
import { useCategorySearchQuery } from "@/lib/hooks/queries/useCategorySearchQuery";
import { useCategoriesQuery } from "@/lib/hooks/queries/useCategoriesQuery";
import { useCategorySearchStore } from "@/lib/stores/useCategorySearchStore";
import type { Category } from "@/lib/types/category";

/**
 * Utility: فلت کردن درخت دسته‌بندی‌ها
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
 * ✅ CategorySelectSearch — نسخه‌ی سالم و نهایی
 */
export function CategorySelectSearch() {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // گرفتن همه دسته‌ها
  const { data: allCategoriesTree = [], isFetching: fetchingAll } =
    useCategoriesQuery();

  // فلت‌کردن آرایه درختی
  const allCategories = useMemo(
    () => flattenCategories(allCategoriesTree),
    [allCategoriesTree]
  );

  // وضعیت سرچ
  const isSearching = inputValue.trim().length >= 2;
  const { data: searchResults = [], isFetching: fetchingSearch } =
    useCategorySearchQuery(isSearching ? inputValue.trim() : "");

  const { selectedCategory, setSelectedCategory } = useCategorySearchStore();
  const optionsData = isSearching ? searchResults : allCategories;

  return (
    <Controller
      name="categoryId"
      control={control}
      render={({ field }) => {
        const currentValue =
          optionsData.find((c) => c.id === field.value) ||
          selectedCategory ||
          null;

        // هر وقت مقدار فرم تغییر کنه، selectedCategory به‌روز میشه
        useEffect(() => {
          if (field.value && allCategories.length > 0) {
            const found = allCategories.find((c) => c.id === field.value);
            if (found) setSelectedCategory(found);
          }
        }, [field.value, allCategories, setSelectedCategory]);

        return (
          <Autocomplete
            disablePortal
            autoHighlight
            includeInputInList
            filterOptions={(x) => x}
            open={open}
            onOpen={() => {
              setOpen(true);
              if (!inputValue.trim()) setInputValue(""); // نمایش همه
            }}
            onClose={() => setOpen(false)}
            options={optionsData}
            value={currentValue}
            getOptionLabel={(option) => option?.name || ""}
            isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
            loading={isSearching ? fetchingSearch : fetchingAll}
            onChange={(_, newValue) => {
              field.onChange(newValue ? newValue.id : undefined);
              setSelectedCategory(newValue || null);
            }}
            onInputChange={(_, newInputValue, reason) => {
              if (reason === "input") setInputValue(newInputValue);
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "Vazirmatn",
                color: "#434343",
                backgroundColor: "#FFFFFF",
                "& fieldset": { borderColor: "#D6D6D6" },
                "&:hover fieldset": { borderColor: "#0077B6" },
                "&.Mui-focused fieldset": {
                  borderColor: "#00B4D8",
                  borderWidth: "1.6px",
                },
              },
              "& .MuiFormLabel-root": {
                fontSize: "14px",
                fontFamily: "Vazirmatn",
                color: "#656565",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="دسته‌بندی"
                placeholder="انتخاب یا جست‌وجو..."
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {(fetchingAll || fetchingSearch) && (
                        <CircularProgress size={18} sx={{ color: "#00B4D8" }} />
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        );
      }}
    />
  );
}
