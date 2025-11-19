import { Request, Response } from "express";
import { AddressService } from "../services/addressService";

const service = new AddressService();

export class AddressController {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.id; // نیاز به middleware احراز هویت
      const address = await service.createAddress(userId, req.body);
      res.json(address);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const addresses = await service.getAddresses(userId);
    res.json(addresses);
  }

  async get(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.id;
      const address = await service.getAddressById(
        userId,
        Number(req.params.id)
      );
      res.json(address);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.id;
      const address = await service.updateAddress(
        userId,
        Number(req.params.id),
        req.body
      );
      res.json(address);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.id;
      await service.deleteAddress(userId, Number(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async setDefault(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.id;
      const address = await service.setDefaultAddress(
        userId,
        Number(req.params.id)
      );
      res.json(address);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}
