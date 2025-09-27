import farmProduceImage from "@/assets/farm-produce.jpg";
import meatFishEggsImage from "@/assets/meat-fish-eggs.jpg";
import stewBaseSpicesImage from "@/assets/stew-base-spices.jpg";
import snacksFrozenImage from "@/assets/snacks-frozen.jpg";
import mashedkeDelightImage from "@/assets/mashedke-delight.jpg";
import householdEssentialsImage from "@/assets/household-essentials.jpg";

// New descriptive images
import freshProduceImage from "@/assets/fresh-produce.jpg";
import meatFishDisplayImage from "@/assets/meat-fish-display.jpg";
import softDrinksImage from "@/assets/soft-drinks.jpg";
import biscuitsDisplayImage from "@/assets/biscuits-display.jpg";
import lactatingSmoothiesImage from "@/assets/lactating-smoothies.jpg";
import gymSmoothiesImage from "@/assets/gym-smoothies.jpg";
import generalSmoothiesImage from "@/assets/general-smoothies.jpg";
import foodEssentialsImage from "@/assets/food-essentials.jpg";
import personalCareImage from "@/assets/personal-care.jpg";
import stewSpicesImage from "@/assets/stew-spices.jpg";

// Variant images
import milo100g from "@/assets/variants/milo-100g.jpg";
import milo200g from "@/assets/variants/milo-200g.jpg";
import milo400g from "@/assets/variants/milo-400g.jpg";
import milo1kg from "@/assets/variants/milo-1kg.jpg";
import whiteSugar500g from "@/assets/variants/white-sugar-500g.jpg";
import whiteSugar1kg from "@/assets/variants/white-sugar-1kg.jpg";
import whiteSugar5kg from "@/assets/variants/white-sugar-5kg.jpg";
import brownSugar500g from "@/assets/variants/brown-sugar-500g.jpg";
import brownSugar1kg from "@/assets/variants/brown-sugar-1kg.jpg";
import brownSugar5kg from "@/assets/variants/brown-sugar-5kg.jpg";
import idealMilk170g from "@/assets/variants/ideal-milk-170g.jpg";
import idealMilk385g from "@/assets/variants/ideal-milk-385g.jpg";
import carnationMilk170g from "@/assets/variants/carnation-milk-170g.jpg";
import carnationMilk385g from "@/assets/variants/carnation-milk-385g.jpg";
import enapaMilk170g from "@/assets/variants/enapa-milk-170g.jpg";
import enapaMilk385g from "@/assets/variants/enapa-milk-385g.jpg";
import nido400g from "@/assets/variants/nido-400g.jpg";
import nido900g from "@/assets/variants/nido-900g.jpg";
import cowbell400g from "@/assets/variants/cowbell-400g.jpg";
import cowbell900g from "@/assets/variants/cowbell-900g.jpg";
import enapaPowdered400g from "@/assets/variants/enapa-powdered-400g.jpg";
import enapaPowdered900g from "@/assets/variants/enapa-powdered-900g.jpg";
import bathingSoapSmall from "@/assets/variants/bathing-soap-small.jpg";
import bathingSoapMedium from "@/assets/variants/bathing-soap-medium.jpg";
import bathingSoapLarge from "@/assets/variants/bathing-soap-large.jpg";
import washingSoapSmall from "@/assets/variants/washing-soap-small.jpg";
import washingSoapMedium from "@/assets/variants/washing-soap-medium.jpg";
import washingSoapLarge from "@/assets/variants/washing-soap-large.jpg";
import liquidSoap250ml from "@/assets/variants/liquid-soap-250ml.jpg";
import liquidSoap500ml from "@/assets/variants/liquid-soap-500ml.jpg";
import liquidSoap1l from "@/assets/variants/liquid-soap-1l.jpg";
import yazz8pcs from "@/assets/variants/yazz-8pcs.jpg";
import yazz16pcs from "@/assets/variants/yazz-16pcs.jpg";
import yazz32pcs from "@/assets/variants/yazz-32pcs.jpg";
import softcare8pcs from "@/assets/variants/softcare-8pcs.jpg";
import softcare16pcs from "@/assets/variants/softcare-16pcs.jpg";
import softcare32pcs from "@/assets/variants/softcare-32pcs.jpg";
// import sureRollon50ml from "@/assets/variants/sure-rollon-50ml.jpg";
import sureRollon100ml from "@/assets/variants/sure-rollon-100ml.jpg";
import sureSpray50ml from "@/assets/variants/sure-spray-50ml.jpg";
import sureSpray150ml from "@/assets/variants/sure-spray-150ml.jpg";
import doveRollon50ml from "@/assets/variants/dove-rollon-50ml.jpg";
import doveRollon100ml from "@/assets/variants/dove-rollon-100ml.jpg";
import doveSpray100ml from "@/assets/variants/dove-spray-100ml.jpg";
import doveSpray150ml from "@/assets/variants/dove-spray-150ml.jpg";

// Water brand variants
import belWaterSmall from "@/assets/variants/bel-water-small.jpg";
import belWaterMedium from "@/assets/variants/bel-water-medium.jpg";
import belWaterLarge from "@/assets/variants/bel-water-large.jpg";
import aquaWaterSmall from "@/assets/variants/aqua-water-small.jpg";
import aquaWaterMedium from "@/assets/variants/aqua-water-medium.jpg";
import aquaWaterLarge from "@/assets/variants/aqua-water-large.jpg";

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  unit: string;
  inStock: boolean;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  inStock: boolean;
  weight?: string;
  variants?: ProductVariant[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  image: string;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories: Subcategory[];
}

export const categoriesData: Category[] = [
  {
    id: "fresh-foods",
    name: "Fresh Foods",
    description: "Farm-fresh produce, meat, fish, and eggs",
    image: farmProduceImage,
    subcategories: [
      {
        id: "farm-produce",
        name: "Farm Produce",
        description: "Fresh vegetables and produce from local farms",
        image: freshProduceImage,
        products: [
          {
            id: 1,
            name: "Fresh Bell Peppers",
            price: 8.0,
            unit: "per kg",
            image: freshProduceImage,
            description: "Colorful fresh bell peppers",
            inStock: true,
          },
          {
            id: 2,
            name: "Red Onions",
            price: 6.0,
            unit: "per kg",
            image: freshProduceImage,
            description: "Fresh red onions",
            inStock: true,
          },
          {
            id: 3,
            name: "Fresh Tomatoes",
            price: 12.0,
            unit: "per kg",
            image: freshProduceImage,
            description: "Ripe fresh tomatoes",
            inStock: true,
          },
          {
            id: 4,
            name: "Fresh Ginger",
            price: 15.0,
            unit: "per 500g",
            image: freshProduceImage,
            description: "Fresh ginger root",
            inStock: true,
          },
          {
            id: 5,
            name: "Garlic",
            price: 18.0,
            unit: "per 500g",
            image: freshProduceImage,
            description: "Fresh garlic bulbs",
            inStock: true,
          },
          {
            id: 6,
            name: "Ripe Plantain",
            price: 10.0,
            unit: "per bunch",
            image: freshProduceImage,
            description: "Sweet ripe plantains",
            inStock: true,
          },
          {
            id: 7,
            name: "Fresh Yam",
            price: 25.0,
            unit: "per tuber",
            image: freshProduceImage,
            description: "Quality fresh yam",
            inStock: true,
          },
          {
            id: 8,
            name: "Carrots",
            price: 8.0,
            unit: "per kg",
            image: freshProduceImage,
            description: "Fresh orange carrots",
            inStock: true,
          },
          {
            id: 9,
            name: "Spring Onions",
            price: 5.0,
            unit: "per bunch",
            image: freshProduceImage,
            description: "Fresh spring onions",
            inStock: true,
          },
        ],
      },
      {
        id: "meat-fish-egg",
        name: "Meat, Fish & Egg",
        description: "Fresh meat, fish, and farm eggs",
        image: meatFishDisplayImage,
        products: [
          {
            id: 10,
            name: "Fresh Goat Meat",
            price: 45.0,
            unit: "per kg",
            image: meatFishDisplayImage,
            description: "Fresh goat meat cuts",
            inStock: true,
          },
          {
            id: 11,
            name: "Chicken Breast",
            price: 35.0,
            unit: "per kg",
            image: meatFishDisplayImage,
            description: "Fresh chicken breast",
            inStock: true,
          },
          {
            id: 12,
            name: "Beef Cuts",
            price: 42.0,
            unit: "per kg",
            image: meatFishDisplayImage,
            description: "Fresh beef cuts",
            inStock: true,
          },
          {
            id: 13,
            name: "Fresh Red Fish",
            price: 55.0,
            unit: "per kg",
            image: meatFishDisplayImage,
            description: "Fresh red fish fillets",
            inStock: true,
          },
          {
            id: 14,
            name: "Fresh Tilapia",
            price: 38.0,
            unit: "per kg",
            image: meatFishDisplayImage,
            description: "Fresh whole tilapia",
            inStock: true,
          },
          {
            id: 15,
            name: "Dried Fish",
            price: 75.0,
            unit: "per 500g",
            image: meatFishDisplayImage,
            description: "Quality dried fish",
            inStock: true,
          },
          {
            id: 16,
            name: "Farm Fresh Eggs",
            price: 12.0,
            unit: "per dozen",
            image: meatFishDisplayImage,
            description: "Fresh farm eggs",
            inStock: true,
          },
        ],
      },
    ],
  },
  {
    id: "snacks-frozen",
    name: "Snacks & Frozen Foods",
    description: "Delicious snacks, drinks, biscuits and frozen foods",
    image: snacksFrozenImage,
    subcategories: [
      {
        id: "soft-drinks",
        name: "Soft Drinks",
        description: "Refreshing beverages and drinks",
        image: softDrinksImage,
        products: [
          {
            id: 21,
            name: "BEL Drinks",
            price: 3.5,
            unit: "from",
            image: belWaterSmall,
            description: "Refreshing BEL water and drinks",
            inStock: true,
            variants: [
              {
                id: "bel-small",
                name: "BEL Water 50cl",
                price: 3.5,
                unit: "per bottle",
                inStock: true,
                image: belWaterSmall,
              },
              {
                id: "bel-medium",
                name: "BEL Water 75cl",
                price: 5.0,
                unit: "per bottle",
                inStock: true,
                image: belWaterMedium,
              },
              {
                id: "bel-large",
                name: "BEL Water 1.5L",
                price: 8.0,
                unit: "per bottle",
                inStock: true,
                image: belWaterLarge,
              },
            ],
          },
          {
            id: 22,
            name: "Special Drinks",
            price: 4.0,
            unit: "from",
            image: aquaWaterSmall,
            description: "Premium water and special beverages",
            inStock: true,
            variants: [
              {
                id: "aqua-small",
                name: "Aqua Water 50cl",
                price: 4.0,
                unit: "per bottle",
                inStock: true,
                image: aquaWaterSmall,
              },
              {
                id: "aqua-medium",
                name: "Aqua Water 75cl",
                price: 6.0,
                unit: "per bottle",
                inStock: true,
                image: aquaWaterMedium,
              },
              {
                id: "aqua-large",
                name: "Aqua Water 1.5L",
                price: 10.0,
                unit: "per bottle",
                inStock: true,
                image: aquaWaterLarge,
              },
            ],
          },
          {
            id: 23,
            name: "Coca Cola",
            price: 5.0,
            unit: "per bottle",
            image: softDrinksImage,
            description: "Classic Coca Cola",
            inStock: true,
          },
          {
            id: 24,
            name: "Holandia",
            price: 4.5,
            unit: "per bottle",
            image: softDrinksImage,
            description: "Holandia yogurt drink",
            inStock: true,
          },
          {
            id: 25,
            name: "Niche Chocolate",
            price: 6.0,
            unit: "per bottle",
            image: softDrinksImage,
            description: "Rich chocolate drink",
            inStock: true,
          },
        ],
      },
      {
        id: "biscuits",
        name: "Biscuits",
        description: "Delicious biscuits and cookies",
        image: biscuitsDisplayImage,
        products: [
          {
            id: 26,
            name: "Oreo",
            price: 8.0,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Classic Oreo cookies",
            inStock: true,
          },
          {
            id: 27,
            name: "King Cracker",
            price: 5.0,
            unit: "from",
            image: biscuitsDisplayImage,
            description: "Crispy king crackers",
            inStock: true,
            variants: [
              {
                id: "king-small",
                name: "King Cracker Small",
                price: 5.0,
                unit: "per pack",
                inStock: true,
                image: biscuitsDisplayImage,
              },
              {
                id: "king-large",
                name: "King Cracker Large",
                price: 12.0,
                unit: "per pack",
                inStock: true,
                image: biscuitsDisplayImage,
              },
            ],
          },
          {
            id: 28,
            name: "Soda Biscuit",
            price: 6.0,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Light soda biscuits",
            inStock: true,
          },
          {
            id: 29,
            name: "Simply Good",
            price: 7.0,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Simply Good biscuits",
            inStock: true,
          },
          {
            id: 30,
            name: "Nutri Snack",
            price: 9.0,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Nutritious snack biscuits",
            inStock: true,
          },
          {
            id: 31,
            name: "Fun-O",
            price: 4.5,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Fun-O biscuits",
            inStock: true,
          },
          {
            id: 32,
            name: "Digestive Biscuit",
            price: 8.5,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Healthy digestive biscuits",
            inStock: true,
          },
          {
            id: 33,
            name: "Chocolate Cookies",
            price: 10.0,
            unit: "per pack",
            image: biscuitsDisplayImage,
            description: "Rich chocolate cookies",
            inStock: true,
          },
        ],
      },
    ],
  },
  {
    id: "mashedke-delight",
    name: "MashedKe Delight",
    description: "Nutritious kenkey smoothies for health-conscious individuals",
    image: mashedkeDelightImage,
    subcategories: [
      {
        id: "lactating-mothers-kids",
        name: "Lactating Mothers & Kids (6 months+)",
        description:
          "Gentle fruits, digestion aid, healthy fats, mild vegetables - perfect for mothers and young children",
        image: lactatingSmoothiesImage,
        products: [
          {
            id: 50,
            name: "Banana + Pawpaw + Almond Milk",
            price: 18.0,
            unit: "per bottle",
            image: lactatingSmoothiesImage,
            description:
              "Gentle blend with banana, pawpaw and almond milk - perfect for nursing mothers",
            inStock: true,
          },
          {
            id: 51,
            name: "Apple + Carrot + Cashew",
            price: 20.0,
            unit: "per bottle",
            image: lactatingSmoothiesImage,
            description:
              "Nutritious apple, carrot and cashew blend for healthy digestion",
            inStock: true,
          },
          {
            id: 52,
            name: "Mango + Avocado + Sesame Seeds",
            price: 22.0,
            unit: "per bottle",
            image: lactatingSmoothiesImage,
            description:
              "Rich mango, avocado and sesame seed smoothie packed with healthy fats",
            inStock: true,
          },
          {
            id: 53,
            name: "Watermelon + Spinach + Cashew",
            price: 19.0,
            unit: "per bottle",
            image: lactatingSmoothiesImage,
            description: "Hydrating watermelon with mild spinach and cashew",
            inStock: true,
          },
          {
            id: 54,
            name: "Banana + Spinach + Almond",
            price: 18.0,
            unit: "per bottle",
            image: lactatingSmoothiesImage,
            description:
              "Gentle banana and spinach with almonds for extra nutrition",
            inStock: true,
          },
        ],
      },
      {
        id: "gym-enthusiasts",
        name: "Gym Enthusiasts",
        description:
          "High energy, recovery, protein, natural sweetness - fuel your workout and recovery",
        image: gymSmoothiesImage,
        products: [
          {
            id: 60,
            name: "Banana + Dates + Peanut Butter",
            price: 25.0,
            unit: "per bottle",
            image: gymSmoothiesImage,
            description:
              "High-protein blend with banana, dates and peanut butter for muscle building",
            inStock: true,
          },
          {
            id: 61,
            name: "Pineapple + Chia Seeds + Almond Milk",
            price: 24.0,
            unit: "per bottle",
            image: gymSmoothiesImage,
            description:
              "Energy-boosting pineapple with chia seeds and almond milk",
            inStock: true,
          },
          {
            id: 62,
            name: "Mixed Berries + Walnuts + Soy Milk",
            price: 28.0,
            unit: "per bottle",
            image: gymSmoothiesImage,
            description:
              "Antioxidant-rich berries with walnuts and soy milk for recovery",
            inStock: true,
          },
          {
            id: 63,
            name: "Banana + Protein Powder + Peanuts",
            price: 30.0,
            unit: "per bottle",
            image: gymSmoothiesImage,
            description:
              "Ultimate protein smoothie with banana, protein powder and peanuts",
            inStock: true,
          },
          {
            id: 64,
            name: "Dates + Almonds + Skimmed Milk",
            price: 26.0,
            unit: "per bottle",
            image: gymSmoothiesImage,
            description: "Natural energy from dates, almonds and skimmed milk",
            inStock: true,
          },
        ],
      },
      {
        id: "mashedke-lovers",
        name: "MashedKe Lovers (General Audience)",
        description: "Fun, refreshing, indulgent flavors for everyone to enjoy",
        image: generalSmoothiesImage,
        products: [
          {
            id: 70,
            name: "Coconut + Honey + Cashew",
            price: 22.0,
            unit: "per bottle",
            image: generalSmoothiesImage,
            description:
              "Tropical coconut with honey and cashew - a crowd favorite",
            inStock: true,
          },
          {
            id: 71,
            name: "Chocolate + Banana + Groundnut",
            price: 24.0,
            unit: "per bottle",
            image: generalSmoothiesImage,
            description: "Indulgent chocolate banana smoothie with groundnuts",
            inStock: true,
          },
          {
            id: 72,
            name: "Coconut + Coconut Flakes + Honey",
            price: 20.0,
            unit: "per bottle",
            image: generalSmoothiesImage,
            description: "Double coconut delight with natural honey sweetness",
            inStock: true,
          },
          {
            id: 73,
            name: "Banana + Chocolate + Cashew",
            price: 25.0,
            unit: "per bottle",
            image: generalSmoothiesImage,
            description: "Rich banana chocolate blend with cashews",
            inStock: true,
          },
          {
            id: 74,
            name: "Mixed Fruit + Honey + Groundnut",
            price: 23.0,
            unit: "per bottle",
            image: generalSmoothiesImage,
            description: "Tropical mixed fruit with honey and groundnuts",
            inStock: true,
          },
        ],
      },
    ],
  },
  {
    id: "household-essentials",
    name: "Household Essentials",
    description: "Daily needs and household items for your home",
    image: householdEssentialsImage,
    subcategories: [
      {
        id: "food-essentials",
        name: "Food Essentials",
        description: "Basic food items and cooking essentials",
        image: foodEssentialsImage,
        products: [
          {
            id: 80,
            name: "Milo Drink Mix",
            price: 10.0,
            unit: "from",
            image: foodEssentialsImage,
            description: "Nutritious chocolate drink",
            inStock: true,
            variants: [
              {
                id: "milo-100g",
                name: "100g",
                price: 10.0,
                unit: "per pack",
                inStock: true,
                image: milo100g,
              },
              {
                id: "milo-200g",
                name: "200g",
                price: 18.0,
                unit: "per pack",
                inStock: true,
                image: milo200g,
              },
              {
                id: "milo-400g",
                name: "400g",
                price: 35.0,
                unit: "per pack",
                inStock: true,
                image: milo400g,
              },
              {
                id: "milo-1kg",
                name: "1kg",
                price: 80.0,
                unit: "per pack",
                inStock: true,
                image: milo1kg,
              },
            ],
          },
          {
            id: 81,
            name: "Sugar",
            price: 6.0,
            unit: "from",
            image: householdEssentialsImage,
            description: "White and brown sugar varieties",
            inStock: true,
            variants: [
              {
                id: "white-500g",
                name: "White Sugar 500g",
                price: 6.0,
                unit: "per pack",
                inStock: true,
                image: whiteSugar500g,
              },
              {
                id: "white-1kg",
                name: "White Sugar 1kg",
                price: 10.0,
                unit: "per pack",
                inStock: true,
                image: whiteSugar1kg,
              },
              {
                id: "white-5kg",
                name: "White Sugar 5kg",
                price: 45.0,
                unit: "per pack",
                inStock: true,
                image: whiteSugar5kg,
              },
              {
                id: "brown-500g",
                name: "Brown Sugar 500g",
                price: 8.0,
                unit: "per pack",
                inStock: true,
                image: brownSugar500g,
              },
              {
                id: "brown-1kg",
                name: "Brown Sugar 1kg",
                price: 15.0,
                unit: "per pack",
                inStock: true,
                image: brownSugar1kg,
              },
              {
                id: "brown-5kg",
                name: "Brown Sugar 5kg",
                price: 65.0,
                unit: "per pack",
                inStock: true,
                image: brownSugar5kg,
              },
            ],
          },
          {
            id: 82,
            name: "Tin Milk",
            price: 4.5,
            unit: "from",
            image: householdEssentialsImage,
            description: "Evaporated milk - Ideal, ENAPA, Carnation",
            inStock: true,
            variants: [
              {
                id: "ideal-170g",
                name: "Ideal Milk 170g",
                price: 4.5,
                unit: "per tin",
                inStock: true,
                image: idealMilk170g,
              },
              {
                id: "ideal-385g",
                name: "Ideal Milk 385g",
                price: 8.0,
                unit: "per tin",
                inStock: true,
                image: idealMilk385g,
              },
              {
                id: "carnation-170g",
                name: "Carnation Milk 170g",
                price: 5.0,
                unit: "per tin",
                inStock: true,
                image: carnationMilk170g,
              },
              {
                id: "carnation-385g",
                name: "Carnation Milk 385g",
                price: 9.0,
                unit: "per tin",
                inStock: true,
                image: carnationMilk385g,
              },
              {
                id: "enapa-170g",
                name: "ENAPA Milk 170g",
                price: 4.8,
                unit: "per tin",
                inStock: true,
                image: enapaMilk170g,
              },
              {
                id: "enapa-385g",
                name: "ENAPA Milk 385g",
                price: 8.5,
                unit: "per tin",
                inStock: true,
                image: enapaMilk385g,
              },
            ],
          },
          {
            id: 83,
            name: "Powdered Milk",
            price: 25.0,
            unit: "from",
            image: householdEssentialsImage,
            description: "Quality powdered milk - Nido, Cowbell, ENAPA",
            inStock: true,
            variants: [
              {
                id: "nido-400g",
                name: "Nido 400g",
                price: 35.0,
                unit: "per tin",
                inStock: true,
                image: nido400g,
              },
              {
                id: "nido-900g",
                name: "Nido 900g",
                price: 70.0,
                unit: "per tin",
                inStock: true,
                image: nido900g,
              },
              {
                id: "cowbell-400g",
                name: "Cowbell 400g",
                price: 30.0,
                unit: "per tin",
                inStock: true,
                image: cowbell400g,
              },
              {
                id: "cowbell-900g",
                name: "Cowbell 900g",
                price: 65.0,
                unit: "per tin",
                inStock: true,
                image: cowbell900g,
              },
              {
                id: "enapa-400g",
                name: "ENAPA 400g",
                price: 25.0,
                unit: "per tin",
                inStock: true,
                image: enapaPowdered400g,
              },
              {
                id: "enapa-900g",
                name: "ENAPA 900g",
                price: 55.0,
                unit: "per tin",
                inStock: true,
                image: enapaPowdered900g,
              },
            ],
          },
        ],
      },
      {
        id: "personal-care",
        name: "Personal Care",
        description: "Personal hygiene and care products",
        image: householdEssentialsImage,
        products: [
          {
            id: 90,
            name: "Soaps",
            price: 3.5,
            unit: "from",
            image: householdEssentialsImage,
            description: "Quality bathing, washing and liquid soaps",
            inStock: true,
            variants: [
              {
                id: "bathing-small",
                name: "Bathing Soap Small",
                price: 3.5,
                unit: "per bar",
                inStock: true,
                image: bathingSoapSmall,
              },
              {
                id: "bathing-medium",
                name: "Bathing Soap Medium",
                price: 6.0,
                unit: "per bar",
                inStock: true,
                image: bathingSoapMedium,
              },
              {
                id: "bathing-large",
                name: "Bathing Soap Large",
                price: 10.0,
                unit: "per bar",
                inStock: true,
                image: bathingSoapLarge,
              },
              {
                id: "washing-small",
                name: "Washing Soap Small",
                price: 4.0,
                unit: "per bar",
                inStock: true,
                image: washingSoapSmall,
              },
              {
                id: "washing-medium",
                name: "Washing Soap Medium",
                price: 7.0,
                unit: "per bar",
                inStock: true,
                image: washingSoapMedium,
              },
              {
                id: "washing-large",
                name: "Washing Soap Large",
                price: 12.0,
                unit: "per bar",
                inStock: true,
                image: washingSoapLarge,
              },
              {
                id: "liquid-250ml",
                name: "Liquid Soap 250ml",
                price: 8.0,
                unit: "per bottle",
                inStock: true,
                image: liquidSoap250ml,
              },
              {
                id: "liquid-500ml",
                name: "Liquid Soap 500ml",
                price: 15.0,
                unit: "per bottle",
                inStock: true,
                image: liquidSoap500ml,
              },
              {
                id: "liquid-1l",
                name: "Liquid Soap 1L",
                price: 25.0,
                unit: "per bottle",
                inStock: true,
                image: liquidSoap1l,
              },
            ],
          },
          {
            id: 91,
            name: "Sanitary Pads",
            price: 8.0,
            unit: "from",
            image: personalCareImage,
            description: "Quality sanitary pads - Yazz and Softcare",
            inStock: true,
            variants: [
              {
                id: "yazz-8pcs",
                name: "Yazz 8pcs",
                price: 8.0,
                unit: "per pack",
                inStock: true,
                image: yazz8pcs,
              },
              {
                id: "yazz-16pcs",
                name: "Yazz 16pcs",
                price: 15.0,
                unit: "per pack",
                inStock: true,
                image: yazz16pcs,
              },
              {
                id: "yazz-32pcs",
                name: "Yazz 32pcs",
                price: 28.0,
                unit: "per pack",
                inStock: true,
                image: yazz32pcs,
              },
              {
                id: "softcare-8pcs",
                name: "Softcare 8pcs",
                price: 9.0,
                unit: "per pack",
                inStock: true,
                image: softcare8pcs,
              },
              {
                id: "softcare-16pcs",
                name: "Softcare 16pcs",
                price: 17.0,
                unit: "per pack",
                inStock: true,
                image: softcare16pcs,
              },
              {
                id: "softcare-32pcs",
                name: "Softcare 32pcs",
                price: 32.0,
                unit: "per pack",
                inStock: true,
                image: softcare32pcs,
              },
            ],
          },
          {
            id: 92,
            name: "Deodorants",
            price: 12.0,
            unit: "from",
            image: personalCareImage,
            description: "Quality deodorants - Sure and Dove",
            inStock: true,
            variants: [
              {
                id: "sure-rollon-50ml",
                name: "Sure Roll-on 50ml",
                price: 12.0,
                unit: "per bottle",
                inStock: true,
                image: sureRollon100ml,
              },
              {
                id: "sure-rollon-100ml",
                name: "Sure Roll-on 100ml",
                price: 20.0,
                unit: "per bottle",
                inStock: true,
                image: sureRollon100ml,
              },
              {
                id: "sure-spray-50ml",
                name: "Sure Spray 50ml",
                price: 15.0,
                unit: "per bottle",
                inStock: true,
                image: sureSpray50ml,
              },
              {
                id: "sure-spray-150ml",
                name: "Sure Spray 150ml",
                price: 25.0,
                unit: "per bottle",
                inStock: true,
                image: sureSpray150ml,
              },
              {
                id: "dove-rollon-50ml",
                name: "Dove Roll-on 50ml",
                price: 14.0,
                unit: "per bottle",
                inStock: true,
                image: doveRollon50ml,
              },
              {
                id: "dove-rollon-100ml",
                name: "Dove Roll-on 100ml",
                price: 24.0,
                unit: "per bottle",
                inStock: true,
                image: doveRollon100ml,
              },
              {
                id: "dove-spray-100ml",
                name: "Dove Spray 100ml",
                price: 22.0,
                unit: "per bottle",
                inStock: true,
                image: doveSpray100ml,
              },
              {
                id: "dove-spray-150ml",
                name: "Dove Spray 150ml",
                price: 30.0,
                unit: "per bottle",
                inStock: true,
                image: doveSpray150ml,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "stew-base-spices",
    name: "Stew Base & Spices Puree",
    description:
      "Ready-made spice blends and stew bases for authentic African cuisine",
    image: stewBaseSpicesImage,
    subcategories: [
      {
        id: "spice-purees",
        name: "Spice Purees",
        description: "Fresh herb and spice purees for authentic flavoring",
        image: stewSpicesImage,
        products: [
          {
            id: 100,
            name: "Garlic+Ginger+Onion+Parsley Puree",
            price: 15.0,
            unit: "per 250ml",
            image: stewSpicesImage,
            description: "Mixed herb puree for rich flavor base",
            inStock: true,
          },
          {
            id: 101,
            name: "Bonnet Pepper+Spring Onion+Bell Pepper Blend",
            price: 18.0,
            unit: "per 250ml",
            image: stewSpicesImage,
            description: "Spicy pepper blend for heat and flavor",
            inStock: true,
          },
          {
            id: 102,
            name: "Tomato+Red Bell Pepper Puree",
            price: 12.0,
            unit: "per 300ml",
            image: stewSpicesImage,
            description: "Rich tomato base for stews and sauces",
            inStock: true,
          },
          {
            id: 103,
            name: "Onion Puree",
            price: 10.0,
            unit: "per 250ml",
            image: stewSpicesImage,
            description: "Smooth onion puree for cooking base",
            inStock: true,
          },
        ],
      },
      {
        id: "stew-bases",
        name: "Stew Bases",
        description: "Ready-to-use stew bases for quick cooking",
        image: stewSpicesImage,
        products: [
          {
            id: 110,
            name: "Jollof Rice Base",
            price: 20.0,
            unit: "per 400ml",
            image: stewSpicesImage,
            description: "Authentic jollof rice seasoning base",
            inStock: true,
          },
          {
            id: 111,
            name: "Palm Nut Soup Base",
            price: 25.0,
            unit: "per 500ml",
            image: stewSpicesImage,
            description: "Traditional palm nut soup concentrate",
            inStock: true,
          },
          {
            id: 112,
            name: "Light Soup Base",
            price: 18.0,
            unit: "per 400ml",
            image: stewSpicesImage,
            description: "Classic Ghanaian light soup base",
            inStock: true,
          },
          {
            id: 113,
            name: "Groundnut Soup Base",
            price: 22.0,
            unit: "per 450ml",
            image: stewSpicesImage,
            description: "Rich groundnut soup concentrate",
            inStock: true,
          },
        ],
      },
    ],
  },
];
