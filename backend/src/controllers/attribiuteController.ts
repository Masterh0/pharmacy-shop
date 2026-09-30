import { Request, Response, NextFunction } from "express";
import { attributeService } from "../services/attributeService";
import { createAttributeSchema } from "../dto/Createattribute";
import { updateAttributeSchema } from "../dto/Updateattribute";
import { createAttributeValueSchema } from "../dto/CreateAttributeValue";
import { updateAttributeValueSchema } from "../dto/Updateattributevalue";
import { asyncHandler } from "../utils/asyncHandler";

export const attributeController = {
  async getAttributes(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await attributeService.getAttributes({
        page,
        limit,
        search,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getAttributeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const attribute = await attributeService.getAttributeById(id);

      res.status(200).json(attribute);
    } catch (error) {
      next(error);
    }
  },

  async createAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createAttributeSchema.parse(req.body);
      const attribute = await attributeService.createAttribute(dto);

      res.status(201).json(attribute);
    } catch (error) {
      next(error);
    }
  },

  async updateAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dto = updateAttributeSchema.parse(req.body);
      const attribute = await attributeService.updateAttribute(id, dto);

      res.status(200).json(attribute);
    } catch (error) {
      next(error);
    }
  },

  async deleteAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await attributeService.deleteAttribute(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getAttributeValues(req: Request, res: Response, next: NextFunction) {
    try {
      const attributeId = Number(req.params.id);
      const values = await attributeService.getAttributeValues(attributeId);

      res.status(200).json(values);
    } catch (error) {
      next(error);
    }
  },

  async createAttributeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const attributeId = Number(req.params.id);
      const dto = createAttributeValueSchema.parse(req.body);
      const value = await attributeService.createAttributeValue(
        attributeId,
        dto,
      );

      res.status(201).json(value);
    } catch (error) {
      next(error);
    }
  },

  async updateAttributeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dto = updateAttributeValueSchema.parse(req.body);
      const value = await attributeService.updateAttributeValue(id, dto);

      res.status(200).json(value);
    } catch (error) {
      next(error);
    }
  },

  async deleteAttributeValue(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await attributeService.deleteAttributeValue(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  async getVariationAttributes(req, res) {
    const data = await attributeService.getVariationAttributes();

    res.json(data);
  },
  getProductAttributes: asyncHandler(async (req, res) => {
    const data = await attributeService.getProductAttributes();

    res.json(data);
  }),
};
