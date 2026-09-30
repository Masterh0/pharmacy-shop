// src/api/attributeApi.ts

import api from "@/lib/axios";

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

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  createdAt: string;
}

export const attributeApi = {
  // ============================
  // Attribute
  // ============================

  async list(params?: { page?: number; limit?: number; search?: string }) {
    const { data } = await api.get("/attributes", {
      params,
    });

    return data.items;
  },

  async get(id: number): Promise<Attribute> {
    const { data } = await api.get(`/attributes/${id}`);
    return data;
  },

  async create(payload: {
    name: string;
    slug?: string;
    variation?: boolean;
    filterable?: boolean;
    visible?: boolean;
  }): Promise<Attribute> {
    const { data } = await api.post("/attributes", payload);

    return data;
  },

  async update(
    id: number,
    payload: Partial<{
      name: string;
      slug: string;
      variation: boolean;
      filterable: boolean;
      visible: boolean;
    }>,
  ): Promise<Attribute> {
    const { data } = await api.patch(`/attributes/${id}`, payload);

    return data;
  },

  async remove(id: number) {
    const { data } = await api.delete(`/attributes/${id}`);

    return data;
  },

  // ============================
  // Attribute Values
  // ============================

  async listValues(attributeId: number): Promise<AttributeValue[]> {
    const { data } = await api.get(`/attributes/${attributeId}/values`);

    return data;
  },

  async createValue(
    attributeId: number,
    payload: {
      value: string;
    },
  ): Promise<AttributeValue> {
    const { data } = await api.post(
      `/attributes/${attributeId}/values`,
      payload,
    );

    return data;
  },

  async updateValue(
    id: number,
    payload: {
      value: string;
    },
  ): Promise<AttributeValue> {
    const { data } = await api.patch(`/attribute-values/${id}`, payload);

    return data;
  },

  async removeValue(id: number) {
    const { data } = await api.delete(`/attributes/values/${id}`);

    return data;
  },
  async listVariation() {
    const { data } = await api.get("/attributes/variation");
    return data;
  },
  async listProduct() {
    const { data } = await api.get("/attributes/product");

    return data;
  },
};
