import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// ------------------------------------------------------------------
// Categories + Products data
// Each product references its category by name (resolved to id below)
// ------------------------------------------------------------------
const categoriesData = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  {
    name: 'Computers & Laptops',
    description: 'Desktops, laptops and accessories',
  },
  { name: 'Mobile Phones', description: 'Smartphones and mobile accessories' },
  { name: 'Home Appliances', description: 'Appliances for home use' },
  { name: 'Furniture', description: 'Home and office furniture' },
  { name: 'Groceries', description: 'Food and daily grocery items' },
  { name: 'Clothing', description: 'Men, women and kids clothing' },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
  },
  {
    name: 'Books & Stationery',
    description: 'Books, notebooks and office supplies',
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Cosmetics and personal care products',
  },
];

const productsData: Array<{
  sku: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  reorderLevel: number;
}> = [
  // Electronics
  {
    sku: 'ELEC-001',
    name: '43" LED Television',
    description: 'Full HD smart LED TV',
    category: 'Electronics',
    costPrice: 4200,
    sellPrice: 5500,
    reorderLevel: 5,
  },
  {
    sku: 'ELEC-002',
    name: 'Bluetooth Speaker',
    description: 'Portable wireless speaker',
    category: 'Electronics',
    costPrice: 250,
    sellPrice: 400,
    reorderLevel: 10,
  },
  {
    sku: 'ELEC-003',
    name: 'Noise Cancelling Headphones',
    description: 'Over-ear wireless headphones',
    category: 'Electronics',
    costPrice: 900,
    sellPrice: 1350,
    reorderLevel: 8,
  },
  {
    sku: 'ELEC-004',
    name: 'Digital Camera',
    description: '24MP mirrorless camera',
    category: 'Electronics',
    costPrice: 8500,
    sellPrice: 11000,
    reorderLevel: 3,
  },
  {
    sku: 'ELEC-005',
    name: 'Smart Watch',
    description: 'Fitness tracking smart watch',
    category: 'Electronics',
    costPrice: 600,
    sellPrice: 950,
    reorderLevel: 10,
  },
  {
    sku: 'ELEC-006',
    name: 'Power Bank 20000mAh',
    description: 'Fast charging power bank',
    category: 'Electronics',
    costPrice: 180,
    sellPrice: 300,
    reorderLevel: 20,
  },
  {
    sku: 'ELEC-007',
    name: '4K Action Camera',
    description: 'Waterproof action camera',
    category: 'Electronics',
    costPrice: 1500,
    sellPrice: 2100,
    reorderLevel: 5,
  },

  // Computers & Laptops
  {
    sku: 'COMP-001',
    name: 'Business Laptop 15"',
    description: 'Core i7, 16GB RAM, 512GB SSD',
    category: 'Computers & Laptops',
    costPrice: 15000,
    sellPrice: 19500,
    reorderLevel: 5,
  },
  {
    sku: 'COMP-002',
    name: 'Gaming Laptop 17"',
    description: 'RTX graphics gaming laptop',
    category: 'Computers & Laptops',
    costPrice: 28000,
    sellPrice: 35000,
    reorderLevel: 2,
  },
  {
    sku: 'COMP-003',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    category: 'Computers & Laptops',
    costPrice: 80,
    sellPrice: 150,
    reorderLevel: 30,
  },
  {
    sku: 'COMP-004',
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard',
    category: 'Computers & Laptops',
    costPrice: 350,
    sellPrice: 550,
    reorderLevel: 15,
  },
  {
    sku: 'COMP-005',
    name: '27" Monitor',
    description: '2K IPS display monitor',
    category: 'Computers & Laptops',
    costPrice: 3200,
    sellPrice: 4300,
    reorderLevel: 8,
  },
  {
    sku: 'COMP-006',
    name: 'External SSD 1TB',
    description: 'Portable USB-C SSD',
    category: 'Computers & Laptops',
    costPrice: 900,
    sellPrice: 1300,
    reorderLevel: 10,
  },
  {
    sku: 'COMP-007',
    name: 'Laptop Backpack',
    description: 'Padded laptop backpack',
    category: 'Computers & Laptops',
    costPrice: 200,
    sellPrice: 350,
    reorderLevel: 15,
  },

  // Mobile Phones
  {
    sku: 'MOB-001',
    name: 'Smartphone Pro Max',
    description: 'Flagship smartphone 256GB',
    category: 'Mobile Phones',
    costPrice: 18000,
    sellPrice: 22500,
    reorderLevel: 5,
  },
  {
    sku: 'MOB-002',
    name: 'Smartphone Lite',
    description: 'Budget-friendly smartphone 128GB',
    category: 'Mobile Phones',
    costPrice: 5000,
    sellPrice: 6800,
    reorderLevel: 15,
  },
  {
    sku: 'MOB-003',
    name: 'Phone Case',
    description: 'Shockproof silicone phone case',
    category: 'Mobile Phones',
    costPrice: 40,
    sellPrice: 90,
    reorderLevel: 40,
  },
  {
    sku: 'MOB-004',
    name: 'Screen Protector Glass',
    description: 'Tempered glass screen protector',
    category: 'Mobile Phones',
    costPrice: 20,
    sellPrice: 50,
    reorderLevel: 50,
  },
  {
    sku: 'MOB-005',
    name: 'Fast Charger 30W',
    description: 'USB-C fast wall charger',
    category: 'Mobile Phones',
    costPrice: 90,
    sellPrice: 160,
    reorderLevel: 25,
  },
  {
    sku: 'MOB-006',
    name: 'Wireless Earbuds',
    description: 'True wireless stereo earbuds',
    category: 'Mobile Phones',
    costPrice: 450,
    sellPrice: 700,
    reorderLevel: 12,
  },

  // Home Appliances
  {
    sku: 'HOME-001',
    name: 'Refrigerator 18ft',
    description: 'No-frost double door refrigerator',
    category: 'Home Appliances',
    costPrice: 12000,
    sellPrice: 15500,
    reorderLevel: 3,
  },
  {
    sku: 'HOME-002',
    name: 'Washing Machine 9kg',
    description: 'Front load automatic washer',
    category: 'Home Appliances',
    costPrice: 9000,
    sellPrice: 11800,
    reorderLevel: 4,
  },
  {
    sku: 'HOME-003',
    name: 'Microwave Oven',
    description: '25L digital microwave',
    category: 'Home Appliances',
    costPrice: 1800,
    sellPrice: 2500,
    reorderLevel: 6,
  },
  {
    sku: 'HOME-004',
    name: 'Air Conditioner 1.5 Ton',
    description: 'Split inverter air conditioner',
    category: 'Home Appliances',
    costPrice: 13500,
    sellPrice: 17000,
    reorderLevel: 3,
  },
  {
    sku: 'HOME-005',
    name: 'Electric Kettle',
    description: '1.7L stainless steel kettle',
    category: 'Home Appliances',
    costPrice: 220,
    sellPrice: 350,
    reorderLevel: 20,
  },
  {
    sku: 'HOME-006',
    name: 'Vacuum Cleaner',
    description: 'Bagless cyclonic vacuum cleaner',
    category: 'Home Appliances',
    costPrice: 1600,
    sellPrice: 2200,
    reorderLevel: 5,
  },
  {
    sku: 'HOME-007',
    name: 'Blender',
    description: 'High-speed kitchen blender',
    category: 'Home Appliances',
    costPrice: 450,
    sellPrice: 700,
    reorderLevel: 12,
  },

  // Furniture
  {
    sku: 'FURN-001',
    name: 'Office Desk',
    description: 'Wooden office desk with drawers',
    category: 'Furniture',
    costPrice: 2200,
    sellPrice: 3200,
    reorderLevel: 4,
  },
  {
    sku: 'FURN-002',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable mesh office chair',
    category: 'Furniture',
    costPrice: 1800,
    sellPrice: 2600,
    reorderLevel: 5,
  },
  {
    sku: 'FURN-003',
    name: '3-Seater Sofa',
    description: 'Fabric living room sofa',
    category: 'Furniture',
    costPrice: 6500,
    sellPrice: 9000,
    reorderLevel: 2,
  },
  {
    sku: 'FURN-004',
    name: 'Bookshelf',
    description: '5-tier wooden bookshelf',
    category: 'Furniture',
    costPrice: 900,
    sellPrice: 1400,
    reorderLevel: 6,
  },
  {
    sku: 'FURN-005',
    name: 'Dining Table Set',
    description: '6-seater dining table with chairs',
    category: 'Furniture',
    costPrice: 8000,
    sellPrice: 11500,
    reorderLevel: 2,
  },
  {
    sku: 'FURN-006',
    name: 'Bed Frame Queen',
    description: 'Wooden queen size bed frame',
    category: 'Furniture',
    costPrice: 4500,
    sellPrice: 6200,
    reorderLevel: 3,
  },

  // Groceries
  {
    sku: 'GROC-001',
    name: 'Basmati Rice 5kg',
    description: 'Premium basmati rice bag',
    category: 'Groceries',
    costPrice: 180,
    sellPrice: 240,
    reorderLevel: 40,
  },
  {
    sku: 'GROC-002',
    name: 'Sunflower Oil 1.5L',
    description: 'Cooking oil bottle',
    category: 'Groceries',
    costPrice: 90,
    sellPrice: 130,
    reorderLevel: 50,
  },
  {
    sku: 'GROC-003',
    name: 'White Sugar 1kg',
    description: 'Refined white sugar bag',
    category: 'Groceries',
    costPrice: 25,
    sellPrice: 38,
    reorderLevel: 60,
  },
  {
    sku: 'GROC-004',
    name: 'Pasta 500g',
    description: 'Durum wheat pasta pack',
    category: 'Groceries',
    costPrice: 18,
    sellPrice: 28,
    reorderLevel: 70,
  },
  {
    sku: 'GROC-005',
    name: 'Green Tea Bags',
    description: 'Box of 100 green tea bags',
    category: 'Groceries',
    costPrice: 60,
    sellPrice: 95,
    reorderLevel: 30,
  },
  {
    sku: 'GROC-006',
    name: 'Canned Tomatoes 400g',
    description: 'Peeled canned tomatoes',
    category: 'Groceries',
    costPrice: 15,
    sellPrice: 24,
    reorderLevel: 80,
  },

  // Clothing
  {
    sku: 'CLTH-001',
    name: "Men's Cotton T-Shirt",
    description: 'Casual crew neck t-shirt',
    category: 'Clothing',
    costPrice: 90,
    sellPrice: 160,
    reorderLevel: 25,
  },
  {
    sku: 'CLTH-002',
    name: "Women's Denim Jeans",
    description: 'Slim fit denim jeans',
    category: 'Clothing',
    costPrice: 250,
    sellPrice: 420,
    reorderLevel: 20,
  },
  {
    sku: 'CLTH-003',
    name: "Kids' Hoodie",
    description: 'Warm fleece hoodie for kids',
    category: 'Clothing',
    costPrice: 130,
    sellPrice: 220,
    reorderLevel: 18,
  },
  {
    sku: 'CLTH-004',
    name: 'Leather Jacket',
    description: "Men's genuine leather jacket",
    category: 'Clothing',
    costPrice: 900,
    sellPrice: 1400,
    reorderLevel: 6,
  },
  {
    sku: 'CLTH-005',
    name: 'Winter Scarf',
    description: 'Knitted wool scarf',
    category: 'Clothing',
    costPrice: 60,
    sellPrice: 110,
    reorderLevel: 20,
  },

  // Sports & Outdoors
  {
    sku: 'SPRT-001',
    name: 'Football',
    description: 'Size 5 match football',
    category: 'Sports & Outdoors',
    costPrice: 150,
    sellPrice: 240,
    reorderLevel: 15,
  },
  {
    sku: 'SPRT-002',
    name: 'Yoga Mat',
    description: 'Non-slip exercise yoga mat',
    category: 'Sports & Outdoors',
    costPrice: 120,
    sellPrice: 200,
    reorderLevel: 20,
  },
  {
    sku: 'SPRT-003',
    name: 'Dumbbell Set 10kg',
    description: 'Adjustable dumbbell pair',
    category: 'Sports & Outdoors',
    costPrice: 650,
    sellPrice: 950,
    reorderLevel: 6,
  },
  {
    sku: 'SPRT-004',
    name: 'Camping Tent 4-Person',
    description: 'Waterproof camping tent',
    category: 'Sports & Outdoors',
    costPrice: 1400,
    sellPrice: 2000,
    reorderLevel: 4,
  },
  {
    sku: 'SPRT-005',
    name: 'Cycling Helmet',
    description: 'Adjustable ventilated helmet',
    category: 'Sports & Outdoors',
    costPrice: 300,
    sellPrice: 480,
    reorderLevel: 8,
  },

  // Books & Stationery
  {
    sku: 'BOOK-001',
    name: 'A4 Notebook Pack (5)',
    description: 'Ruled A4 notebooks pack of 5',
    category: 'Books & Stationery',
    costPrice: 60,
    sellPrice: 100,
    reorderLevel: 40,
  },
  {
    sku: 'BOOK-002',
    name: 'Ballpoint Pens (10 pack)',
    description: 'Blue ink ballpoint pens',
    category: 'Books & Stationery',
    costPrice: 25,
    sellPrice: 45,
    reorderLevel: 60,
  },
  {
    sku: 'BOOK-003',
    name: 'Desk Organizer',
    description: 'Multi-compartment desk organizer',
    category: 'Books & Stationery',
    costPrice: 90,
    sellPrice: 150,
    reorderLevel: 12,
  },
  {
    sku: 'BOOK-004',
    name: 'Sticky Notes Set',
    description: 'Assorted color sticky notes',
    category: 'Books & Stationery',
    costPrice: 20,
    sellPrice: 35,
    reorderLevel: 50,
  },
  {
    sku: 'BOOK-005',
    name: 'Backpack Pencil Case',
    description: 'Zippered pencil case',
    category: 'Books & Stationery',
    costPrice: 35,
    sellPrice: 60,
    reorderLevel: 30,
  },

  // Beauty & Personal Care
  {
    sku: 'BEAU-001',
    name: 'Facial Moisturizer 50ml',
    description: 'Daily hydrating moisturizer',
    category: 'Beauty & Personal Care',
    costPrice: 110,
    sellPrice: 180,
    reorderLevel: 20,
  },
  {
    sku: 'BEAU-002',
    name: 'Shampoo 400ml',
    description: 'Nourishing hair shampoo',
    category: 'Beauty & Personal Care',
    costPrice: 70,
    sellPrice: 120,
    reorderLevel: 30,
  },
  {
    sku: 'BEAU-003',
    name: 'Perfume 100ml',
    description: 'Long-lasting eau de parfum',
    category: 'Beauty & Personal Care',
    costPrice: 400,
    sellPrice: 650,
    reorderLevel: 10,
  },
  {
    sku: 'BEAU-004',
    name: 'Electric Shaver',
    description: 'Rechargeable electric shaver',
    category: 'Beauty & Personal Care',
    costPrice: 500,
    sellPrice: 800,
    reorderLevel: 8,
  },
  {
    sku: 'BEAU-005',
    name: 'Sunscreen SPF50',
    description: 'Broad spectrum sunscreen lotion',
    category: 'Beauty & Personal Care',
    costPrice: 95,
    sellPrice: 160,
    reorderLevel: 25,
  },
];

async function main() {
  const hashPassword = await bcrypt.hash('Password123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'mohamedmrslan@gmail.com',
      name: 'Mohamed Shehata',
      role: 'ADMIN',
      passwordHash: hashPassword,
    },
  });
  console.log('admin created successfully: ', admin.email);

  // Create categories and keep a name -> id map
  const categoryIdByName = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryIdByName.set(created.name, created.id);
  }
  console.log(`created ${categoriesData.length} categories`);

  // Create products, each linked to its category via categoryId
  let createdProducts = 0;
  for (const p of productsData) {
    const categoryId = categoryIdByName.get(p.category);
    if (!categoryId) {
      console.warn(
        `skipping product ${p.sku}: category "${p.category}" not found`,
      );
      continue;
    }
    await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        categoryId,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        reorderLevel: p.reorderLevel,
      },
    });
    createdProducts++;
  }
  console.log(`created ${createdProducts} products`);
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
