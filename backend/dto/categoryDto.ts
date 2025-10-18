// dto/category.dto.ts
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  parentId?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug: string;
  parentId?: number;
}
