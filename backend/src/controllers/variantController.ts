import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { variantService } from "../services/variantService";
import { CreateVariantDTO, UpdateVariantDTO } from "../../dto/variantDto";

export const getAll = async (req: Request, res: Response) => {
  const result = await variantService.getAll();
  res.json(result);
};

export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await variantService.getById(id);
  res.json(result);
};

export const create = async (req: Request, res: Response) => {
  const result = await variantService.create(req.body);
  res.status(201).json(result);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await variantService.update(id, req.body);
  res.json(result);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await variantService.delete(id);
  res.status(204).send();
};
