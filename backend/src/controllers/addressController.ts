import { Request, Response } from "express";
import { ZodError } from "zod";
import { AddressService } from "../services/addressService";
import { createAddressSchema, updateAddressSchema } from "../dto/address.dto";
import "../types";

const service = new AddressService();

export class AddressController {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const body = createAddressSchema.parse(req.body);
      const userId = req.user.id;

      const address = await service.createAddress(userId, body);
      return res.status(201).json(address);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.issues });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user.id;
      const addresses = await service.getAddresses(userId);

      return res.json(addresses);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  async get(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user.id;
      const id = Number(req.params.id);

      const address = await service.getAddressById(userId, id);
      return res.json(address);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const body = updateAddressSchema.parse(req.body);
      const userId = req.user.id;
      const id = Number(req.params.id);

      const updated = await service.updateAddress(userId, id, body);
      return res.json(updated);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.issues });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user.id;
      const id = Number(req.params.id);

      await service.deleteAddress(userId, id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  async setDefault(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user.id;
      const id = Number(req.params.id);

      const address = await service.setDefaultAddress(userId, id);
      return res.json(address);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }
}
