# Wishlist Feature Guide

## Overview
A wishlist feature has been added to allow customers to suggest items or flavors they'd like to see in three specific categories:
- **Lactating Mothers & Kids (6 months+)**
- **Gym Enthusiasts**
- **MashedKe Lovers (General Audience)**

## Setup Instructions

### 1. Database Setup
Run the SQL script in Supabase SQL Editor to create the wishlist table:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `wishlist_setup.sql`
4. Click "Run" to execute the script

This will create:
- `category_wishlist` table
- Required indexes for performance
- Row Level Security (RLS) policies

### 2. Features

#### For Customers:
- **Add Items**: Click "Suggest an Item" button on the category page to add items/flavors to the wishlist
- **View Wishlist**: Click "View Wishlist" to see all suggested items for a category
- **Works Without Account**: Customers can suggest items even without logging in (items stored with `user_id = NULL`)
- **Authenticated Users**: Can view and delete their own wishlist items

#### For Admins:
- All wishlist items are visible (for admin review)
- Items include:
  - Item/Flavor name
  - Optional description
  - Date suggested
  - User ID (if authenticated)

## Files Created

### Database
- `wishlist_setup.sql` - SQL script to create the wishlist table

### Services
- `src/services/wishlistService.ts` - Service for all wishlist database operations:
  - `addWishlistItem()` - Add a new item to wishlist
  - `getWishlistItems()` - Get all items for a category
  - `getUserWishlistItems()` - Get user's wishlist items
  - `deleteWishlistItem()` - Delete an item from wishlist

### Components
- `src/components/WishlistButton.tsx` - Button component for adding items
- `src/components/WishlistModal.tsx` - Modal component for viewing/managing wishlist

### Pages
- `src/pages/CategoryPage.tsx` - Updated to include wishlist feature for "mashedke-delight" category

## How It Works

1. **Category Page**: When viewing the "MashedKe Delight" category page, a wishlist section appears at the top
2. **Three Subcategories**: The section shows cards for each of the three wishlist-enabled subcategories
3. **Add Items**: Each card has a "Suggest an Item" button that opens a form
4. **View Wishlist**: Users can view all suggested items for each subcategory
5. **Data Storage**: All items are stored in Supabase `category_wishlist` table

## Database Schema

```sql
category_wishlist
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key to auth.users, nullable)
├── category_id (TEXT) - e.g., "lactating-mothers-kids"
├── item_name (TEXT)
├── item_description (TEXT, nullable)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Security

- **RLS Enabled**: Row Level Security is enabled on the table
- **Authenticated Users**: Can only view/delete their own items
- **Public Access**: Anyone can view all items (for transparency) and add items (even without account)

## Usage Example

1. Navigate to `/category/mashedke-delight`
2. Scroll to the "Wishlist Feature" section
3. Click "Suggest an Item" on any of the three category cards
4. Fill in the item name (required) and description (optional)
5. Click "Add to Wishlist"
6. View all suggestions by clicking "View Wishlist"

## Notes

- Items are unique per user per category (prevents duplicates)
- Unauthenticated users can still suggest items
- All suggestions are visible to everyone (for community feedback)
- Authenticated users can only delete their own suggestions

