# General Wishlist Feature Guide

## Overview
A general wishlist feature has been added to allow customers to save products they're interested in across the entire app. This is separate from the category-specific wishlist feature.

## Features

### Floating Wishlist Button
- **Location**: Fixed floating button in the bottom-right corner of all pages
- **Icon**: Heart icon with a badge showing the number of items
- **Functionality**: Click to open the wishlist modal

### Product Cards
- **Wishlist Button**: Heart icon in the top-right corner of each product image
- **Visual Feedback**: 
  - Filled heart (red) = Product is in wishlist
  - Empty heart (gray) = Product is not in wishlist
- **Functionality**: Click to add/remove products from wishlist

### Wishlist Modal
- **View All Items**: See all products in your wishlist
- **Add to Cart**: Quick add to cart from wishlist
- **Remove Items**: Delete items from wishlist
- **Product Details**: Shows product image, name, variant, and price

## Setup Instructions

### 1. Database Setup
Run the SQL script in Supabase SQL Editor to create the general wishlist table:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `general_wishlist_setup.sql`
4. Click "Run" to execute the script

This will create:
- `general_wishlist` table
- Required indexes for performance
- Row Level Security (RLS) policies

### 2. Features

#### For Customers:
- **Add Products**: Click the heart icon on any product card to add it to your wishlist
- **View Wishlist**: Click the floating wishlist button to see all saved products
- **Quick Add to Cart**: Add products directly to cart from the wishlist
- **Remove Items**: Remove products you no longer want
- **Requires Login**: Must be logged in to use the wishlist feature

#### For Admins:
- All wishlist items are stored in the `general_wishlist` table
- Items include:
  - Product ID, name, price, image
  - Product variant (if applicable)
  - User ID
  - Created/updated timestamps

## Files Created

### Database
- `general_wishlist_setup.sql` - SQL script to create the general wishlist table

### Services
- `src/services/generalWishlistService.ts` - Service for all general wishlist operations:
  - `addToGeneralWishlist()` - Add a product to wishlist
  - `getGeneralWishlistItems()` - Get all wishlist items for current user
  - `isProductInWishlist()` - Check if a product is in wishlist
  - `removeFromGeneralWishlist()` - Remove by wishlist item ID
  - `removeFromGeneralWishlistByProduct()` - Remove by product ID and variant

### Components
- `src/components/FloatingWishlistButton.tsx` - Floating button component
- `src/components/GeneralWishlistModal.tsx` - Modal component for viewing/managing wishlist

### Updated Components
- `src/components/ProductCard.tsx` - Added wishlist heart button
- `src/App.tsx` - Added floating wishlist button to all pages

## How It Works

1. **Product Cards**: Each product card has a heart icon in the top-right corner
2. **Add to Wishlist**: Click the heart icon to add/remove products
3. **Floating Button**: Always visible in the bottom-right corner with item count
4. **Wishlist Modal**: Click the floating button to view and manage all wishlist items
5. **Data Storage**: All items are stored in Supabase `general_wishlist` table

## Database Schema

```sql
general_wishlist
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key to auth.users)
├── product_id (INTEGER)
├── product_name (TEXT)
├── product_price (DECIMAL)
├── product_image (TEXT)
├── product_variant (TEXT, nullable)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Security

- **RLS Enabled**: Row Level Security is enabled on the table
- **User-Specific**: Users can only view/manage their own wishlist items
- **Authentication Required**: Must be logged in to use the wishlist feature

## Usage Example

1. Browse products on any page
2. Click the heart icon on a product card to add it to your wishlist
3. The heart icon will fill in red to indicate it's saved
4. Click the floating wishlist button (bottom-right) to view all saved items
5. From the wishlist modal:
   - Add items to cart
   - Remove items from wishlist
   - View all saved products

## Notes

- Products are unique per user per variant (prevents duplicates)
- Must be logged in to use the wishlist feature
- Wishlist items persist across sessions
- The floating button shows a count badge when items are in the wishlist

