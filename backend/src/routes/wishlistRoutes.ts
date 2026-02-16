// backend/src/routes/wishlistRoutes.ts

import { Router } from 'express';
import { wishlistController } from '../controllers/wishlistController';
import {  verifyRefreshToken} from '../middlewares/auth';

const router = Router();

// همه route‌ها نیاز به احراز هویت دارند
router.use(verifyRefreshToken);

/**
 * @route   POST /api/wishlist/add
 * @desc    افزودن محصول به لیست علاقه‌مندی‌ها
 * @access  Private
 * @body    { productId: number }
 */
router.post('/add', wishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist/remove/:productId
 * @desc    حذف محصول از لیست علاقه‌مندی‌ها
 * @access  Private
 */
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

/**
 * @route   GET /api/wishlist
 * @desc    دریافت لیست علاقه‌مندی‌های کاربر
 * @access  Private
 * @query   ?page=1&limit=20&sortBy=createdAt&sortOrder=desc
 */
router.get('/', wishlistController.getWishlist);

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    بررسی اینکه آیا محصول در لیست علاقه‌مندی‌ها هست یا نه
 * @access  Private
 */
router.get('/check/:productId', wishlistController.checkProduct);

/**
 * @route   POST /api/wishlist/check-multiple
 * @desc    بررسی چند محصول یکجا
 * @access  Private
 * @body    { productIds: number[] }
 */
router.post('/check-multiple', wishlistController.checkMultiple);

/**
 * @route   GET /api/wishlist/count
 * @desc    دریافت تعداد آیتم‌های wishlist
 * @access  Private
 */
router.get('/count', wishlistController.getCount);

/**
 * @route   DELETE /api/wishlist/clear
 * @desc    پاک کردن همه لیست علاقه‌مندی‌ها
 * @access  Private
 */
router.delete('/clear', wishlistController.clearWishlist);

export default router;
