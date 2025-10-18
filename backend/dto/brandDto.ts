export interface CreateBrandDto {
  name: string;
  slug?: string; // اگر داده شد از خودش استفاده کنیم، وگرنه بسازیم
}

export interface UpdateBrandDto {
  name?: string;
  slug?: string;
}
