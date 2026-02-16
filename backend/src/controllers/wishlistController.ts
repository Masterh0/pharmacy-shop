// backend/src/controllers/wishlistController.ts

import { Request, Response } from 'express';
import { wishlistService } from '../services/wishlistService';

// Type برای Request با user احراز هویت شده


export const wishlistController = {
  /**
   * POST /api/wishlist/add
   * افزودن محصول به لیست علاقه‌مندی‌ها
   */
  async addToWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;

      if (!productId || isNaN(Number(productId))) {
        return res.status(400).json({
          success: false,
          message: 'شناسه محصول الزامی است',
        });
      }

      const wishlistItem = await wishlistService.addToWishlist(
        userId,
        Number(productId)
      );

      return res.status(201).json({
        success: true,
        message: 'محصول به لیست علاقه‌مندی‌ها اضافه شد',
        data: wishlistItem,
      });
    } catch (error: any) {
      console.error('Add to wishlist error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'خطا در افزودن به لیست علاقه‌مندی‌ها',
      });
    }
  },

  /**
   * DELETE /api/wishlist/remove/:productId
   * حذف محصول از لیست علاقه‌مندی‌ها
   */
  async removeFromWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      if (!productId || isNaN(Number(productId))) {
        return res.status(400).json({
          success: false,
          message: 'شناسه محصول نامعتبر است',
        });
      }

      const result = await wishlistService.removeFromWishlist(
        userId,
        Number(productId)
      );

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('Remove from wishlist error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'خطا در حذف از لیست علاقه‌مندی‌ها',
      });
    }
  },

  /**
   * GET /api/wishlist
   * دریافت لیست علاقه‌مندی‌های کاربر
   */
  async getWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const validSortBy = ['createdAt', 'price', 'soldCount'].includes(
        sortBy as string
      )
        ? (sortBy as 'createdAt' | 'price' | 'soldCount')
        : 'createdAt';

      const validSortOrder = ['asc', 'desc'].includes(sortOrder as string)
        ? (sortOrder as 'asc' | 'desc')
        : 'desc';

      const result = await wishlistService.getUserWishlist(userId, {
        page: Number(page),
        limit: Number(limit),
        sortBy: validSortBy,
        sortOrder: validSortOrder,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Get wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست علاقه‌مندی‌ها',
      });
    }
  },

  /**
   * GET /api/wishlist/check/:productId
   * بررسی اینکه آیا محصول در لیست علاقه‌مندی‌ها هست یا نه
   */
  async checkProduct(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      if (!productId || isNaN(Number(productId))) {
        return res.status(400).json({
          success: false,
          message: 'شناسه محصول نامعتبر است',
        });
      }

      const isInWishlist = await wishlistService.isInWishlist(
        userId,
        Number(productId)
      );

      return res.json({
        success: true,
        data: {
          productId: Number(productId),
          isInWishlist,
        },
      });
    } catch (error: any) {
      console.error('Check wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در بررسی وضعیت محصول',
      });
    }
  },

  /**
   * POST /api/wishlist/check-multiple
   * بررسی چند محصول یکجا
   */
  async checkMultiple(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { productIds } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'لیست شناسه محصولات الزامی است',
        });
      }

      const validProductIds = productIds.filter(
        (id) => !isNaN(Number(id))
      ).map(Number);

      if (validProductIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'شناسه‌های محصول نامعتبر هستند',
        });
      }

      const result = await wishlistService.checkMultipleProducts(
        userId,
        validProductIds
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Check multiple wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در بررسی وضعیت محصولات',
      });
    }
  },

  /**
   * GET /api/wishlist/count
   * دریافت تعداد آیتم‌های wishlist
   */
  async getCount(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const count = await wishlistService.getWishlistCount(userId);

      return res.json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      console.error('Get wishlist count error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در دریافت تعداد آیتم‌ها',
      });
    }
  },

  /**
   * DELETE /api/wishlist/clear
   * پاک کردن همه لیست علاقه‌مندی‌ها
   */
  async clearWishlist(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await wishlistService.clearWishlist(userId);

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('Clear wishlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطا در پاک کردن لیست علاقه‌مندی‌ها',
      });
    }
  },
};
