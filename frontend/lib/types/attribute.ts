export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;

  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: number;

  name: string;
  slug: string;

  variation: boolean;
  filterable: boolean;
  visible: boolean;

  createdAt: string;
  updatedAt: string;

  values?: AttributeValue[];
}

export interface AttributeListResponse {
  data: Attribute[];
  total: number;
  page: number;
  limit: number;
}