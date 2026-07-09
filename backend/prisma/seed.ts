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
  const productBySku = new Map<
    string,
    { id: string; costPrice: number; sellPrice: number }
  >();
  for (const p of productsData) {
    const categoryId = categoryIdByName.get(p.category);
    if (!categoryId) {
      console.warn(
        `skipping product ${p.sku}: category "${p.category}" not found`,
      );
      continue;
    }
    const created = await prisma.product.create({
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
    productBySku.set(p.sku, {
      id: created.id,
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
    });
    createdProducts++;
  }
  console.log(`created ${createdProducts} products`);

  // ------------------------------------------------------------------
  // Users (extra roles besides the ADMIN created above)
  // ------------------------------------------------------------------
  const managerPasswordHash = await bcrypt.hash('Password123', 10);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@erp-lite.test',
      name: 'Mahmoud Khaled',
      role: 'MANAGER',
      passwordHash: managerPasswordHash,
    },
  });

  const employeePasswordHash = await bcrypt.hash('Password123', 10);
  const employee1 = await prisma.user.create({
    data: {
      email: 'employee1@erp-lite.test',
      name: 'Mostafa Ahmed',
      role: 'EMPLOYEE',
      passwordHash: employeePasswordHash,
    },
  });
  const employee2 = await prisma.user.create({
    data: {
      email: 'employee2@erp-lite.test',
      name: 'Rawan Hesham',
      role: 'EMPLOYEE',
      passwordHash: employeePasswordHash,
    },
  });
  const inactiveEmployee = await prisma.user.create({
    data: {
      email: 'inactive@erp-lite.test',
      name: 'Hagar Ahmed',
      role: 'EMPLOYEE',
      passwordHash: employeePasswordHash,
      isActive: false,
    },
  });
  console.log(
    'created users: manager, 2 active employees, 1 inactive employee',
  );

  // ------------------------------------------------------------------
  // Company settings (singleton row)
  // ------------------------------------------------------------------
  await prisma.companySettings.create({
    data: {
      name: 'ERP Lite Trading Co.',
      currency: 'EGP',
      address: '12 Tahrir Street, Cairo, Egypt',
      taxNumber: 'EG-123-456-789',
      invoicePrefix: 'INV-',
      invoiceFooterNote: 'Thank you for your business!',
      paymentTerms: 'Payment due within 14 days of invoice date.',
    },
  });
  console.log('created company settings');

  // ------------------------------------------------------------------
  // Suppliers
  // ------------------------------------------------------------------
  const suppliersData = [
    {
      name: 'Nile Electronics Trading',
      email: 'sales@nile-electronics.com',
      phone: '+20 100 111 2222',
      address: 'Industrial Zone, 6th of October City, Giza',
    },
    {
      name: 'Cairo Appliance Distributors',
      email: 'contact@cairo-appliances.com',
      phone: '+20 101 222 3333',
      address: 'Salah Salem St, Cairo',
    },
    {
      name: 'Delta Furniture Works',
      email: 'orders@delta-furniture.com',
      phone: '+20 102 333 4444',
      address: 'Mansoura Industrial Area, Dakahlia',
    },
    {
      name: 'Alexandria Grocery Supply',
      email: 'info@alex-grocery.com',
      phone: '+20 103 444 5555',
      address: 'Free Zone, Alexandria',
    },
    {
      name: 'Smart Mobile Wholesale',
      email: 'wholesale@smartmobile.com',
      phone: '+20 104 555 6666',
      address: 'Downtown, Cairo',
    },
  ];
  const suppliers: Awaited<ReturnType<typeof prisma.supplier.create>>[] = [];
  for (const s of suppliersData) {
    suppliers.push(await prisma.supplier.create({ data: s }));
  }
  console.log(`created ${suppliers.length} suppliers`);

  // ------------------------------------------------------------------
  // Customers
  // ------------------------------------------------------------------
  const customersData = [
    {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '+20 111 000 1111',
      address: 'Nasr City, Cairo',
    },
    {
      name: 'Sara Mahmoud',
      email: 'sara.mahmoud@example.com',
      phone: '+20 112 000 2222',
      address: 'Sheikh Zayed, Giza',
    },
    {
      name: 'Omar Fathy Retail Store',
      email: 'omar.fathy@example.com',
      phone: '+20 113 000 3333',
      address: 'Mohandessin, Giza',
    },
    {
      name: 'Nour El-Din Trading',
      email: 'noureldin@example.com',
      phone: '+20 114 000 4444',
      address: 'Heliopolis, Cairo',
    },
    {
      name: 'Yasmine Adel',
      email: null,
      phone: '+20 115 000 5555',
      address: 'Maadi, Cairo',
    },
    {
      name: 'Karim Salah Electronics Shop',
      email: 'karim.salah@example.com',
      phone: '+20 116 000 6666',
      address: 'Smouha, Alexandria',
    },
    {
      name: 'Mona Reda',
      email: 'mona.reda@example.com',
      phone: null,
      address: 'Dokki, Giza',
    },
    {
      name: 'Tarek Aboul-Enein',
      email: 'tarek.aboulenein@example.com',
      phone: '+20 117 000 7777',
      address: '10th of Ramadan City, Sharqia',
    },
  ];
  const customers: Awaited<ReturnType<typeof prisma.customer.create>>[] = [];
  for (const c of customersData) {
    customers.push(await prisma.customer.create({ data: c }));
  }
  console.log(`created ${customers.length} customers`);

  // Helper to pull a product by SKU with a guaranteed non-null result
  function product(sku: string) {
    const p = productBySku.get(sku);
    if (!p) throw new Error(`Seed error: product ${sku} not found`);
    return p;
  }

  // ------------------------------------------------------------------
  // Purchase Orders (+ items). Some RECEIVED (stock goes up + IN
  // movements), some still PENDING (no stock effect yet).
  // ------------------------------------------------------------------
  const purchaseOrdersPlan: Array<{
    poNumber: string;
    supplier: (typeof suppliers)[number];
    status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
    createdBy: typeof admin;
    items: Array<{ sku: string; quantity: number }>;
    daysAgo: number;
  }> = [
    {
      poNumber: 'PO-2026-0001',
      supplier: suppliers[0],
      status: 'RECEIVED',
      createdBy: admin,
      items: [
        { sku: 'ELEC-001', quantity: 20 },
        { sku: 'ELEC-002', quantity: 40 },
        { sku: 'ELEC-005', quantity: 30 },
      ],
      daysAgo: 20,
    },
    {
      poNumber: 'PO-2026-0002',
      supplier: suppliers[1],
      status: 'RECEIVED',
      createdBy: manager,
      items: [
        { sku: 'HOME-001', quantity: 10 },
        { sku: 'HOME-002', quantity: 12 },
        { sku: 'HOME-005', quantity: 25 },
      ],
      daysAgo: 18,
    },
    {
      poNumber: 'PO-2026-0003',
      supplier: suppliers[2],
      status: 'RECEIVED',
      createdBy: admin,
      items: [
        { sku: 'FURN-001', quantity: 8 },
        { sku: 'FURN-002', quantity: 10 },
      ],
      daysAgo: 15,
    },
    {
      poNumber: 'PO-2026-0004',
      supplier: suppliers[4],
      status: 'RECEIVED',
      createdBy: manager,
      items: [
        { sku: 'MOB-001', quantity: 15 },
        { sku: 'MOB-002', quantity: 25 },
        { sku: 'MOB-006', quantity: 30 },
      ],
      daysAgo: 12,
    },
    {
      poNumber: 'PO-2026-0005',
      supplier: suppliers[3],
      status: 'PENDING',
      createdBy: admin,
      items: [
        { sku: 'GROC-001', quantity: 100 },
        { sku: 'GROC-002', quantity: 80 },
        { sku: 'GROC-003', quantity: 120 },
      ],
      daysAgo: 3,
    },
    {
      poNumber: 'PO-2026-0006',
      supplier: suppliers[0],
      status: 'CANCELLED',
      createdBy: manager,
      items: [{ sku: 'COMP-002', quantity: 5 }],
      daysAgo: 25,
    },
  ];

  let poCount = 0;
  for (const po of purchaseOrdersPlan) {
    const createdAt = new Date(Date.now() - po.daysAgo * 24 * 60 * 60 * 1000);
    const items = po.items.map(({ sku, quantity }) => {
      const prod = product(sku);
      return { productId: prod.id, quantity, unitCost: prod.costPrice };
    });
    const totalAmount = items.reduce(
      (sum, i) => sum + i.quantity * i.unitCost,
      0,
    );

    const createdPo = await prisma.purchaseOrder.create({
      data: {
        poNumber: po.poNumber,
        supplierId: po.supplier.id,
        status: po.status,
        totalAmount,
        createdById: po.createdBy.id,
        createdAt,
        receivedAt: po.status === 'RECEIVED' ? createdAt : null,
        items: { create: items },
      },
    });

    if (po.status === 'RECEIVED') {
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { increment: item.quantity } },
        });
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'IN',
            quantity: item.quantity,
            referenceType: 'PURCHASE_ORDER',
            referenceId: createdPo.id,
            note: `Received against ${po.poNumber}`,
            createdById: po.createdBy.id,
            createdAt,
          },
        });
      }
    }
    poCount++;
  }
  console.log(`created ${poCount} purchase orders`);

  // ------------------------------------------------------------------
  // Sales Orders (+ items) -> Invoices -> Payments. Also produces OUT
  // stock movements for CONFIRMED orders.
  // ------------------------------------------------------------------
  const salesOrdersPlan: Array<{
    orderNumber: string;
    customer: (typeof customers)[number];
    status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
    createdBy: typeof admin;
    items: Array<{ sku: string; quantity: number }>;
    daysAgo: number;
    invoice?: {
      invoiceNumber: string;
      dueInDays: number;
      payments: Array<{
        amountRatio: number; // portion of invoice amount
        method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';
        daysAfterInvoice: number;
        recordedBy: typeof admin;
      }>;
    };
  }> = [
    {
      orderNumber: 'SO-2026-0001',
      customer: customers[0],
      status: 'CONFIRMED',
      createdBy: employee1,
      items: [
        { sku: 'ELEC-001', quantity: 2 },
        { sku: 'ELEC-002', quantity: 3 },
      ],
      daysAgo: 14,
      invoice: {
        invoiceNumber: 'INV-2026-0001',
        dueInDays: 14,
        payments: [
          {
            amountRatio: 1,
            method: 'CASH',
            daysAfterInvoice: 1,
            recordedBy: employee1,
          },
        ],
      },
    },
    {
      orderNumber: 'SO-2026-0002',
      customer: customers[1],
      status: 'CONFIRMED',
      createdBy: manager,
      items: [
        { sku: 'HOME-001', quantity: 1 },
        { sku: 'HOME-005', quantity: 2 },
      ],
      daysAgo: 12,
      invoice: {
        invoiceNumber: 'INV-2026-0002',
        dueInDays: 14,
        payments: [
          {
            amountRatio: 0.5,
            method: 'BANK_TRANSFER',
            daysAfterInvoice: 2,
            recordedBy: manager,
          },
        ],
      },
    },
    {
      orderNumber: 'SO-2026-0003',
      customer: customers[2],
      status: 'CONFIRMED',
      createdBy: employee2,
      items: [{ sku: 'MOB-001', quantity: 3 }],
      daysAgo: 10,
      invoice: {
        invoiceNumber: 'INV-2026-0003',
        dueInDays: 7,
        payments: [], // still fully UNPAID
      },
    },
    {
      orderNumber: 'SO-2026-0004',
      customer: customers[3],
      status: 'CONFIRMED',
      createdBy: admin,
      items: [
        { sku: 'FURN-001', quantity: 1 },
        { sku: 'FURN-002', quantity: 2 },
      ],
      daysAgo: 9,
      invoice: {
        invoiceNumber: 'INV-2026-0004',
        dueInDays: 14,
        payments: [
          {
            amountRatio: 0.6,
            method: 'CARD',
            daysAfterInvoice: 1,
            recordedBy: admin,
          },
          {
            amountRatio: 0.4,
            method: 'CARD',
            daysAfterInvoice: 5,
            recordedBy: admin,
          },
        ],
      },
    },
    {
      orderNumber: 'SO-2026-0005',
      customer: customers[5],
      status: 'CONFIRMED',
      createdBy: employee1,
      items: [
        { sku: 'MOB-006', quantity: 4 },
        { sku: 'MOB-003', quantity: 6 },
      ],
      daysAgo: 6,
      invoice: {
        invoiceNumber: 'INV-2026-0005',
        dueInDays: 14,
        payments: [
          {
            amountRatio: 1,
            method: 'CASH',
            daysAfterInvoice: 0,
            recordedBy: employee1,
          },
        ],
      },
    },
    {
      orderNumber: 'SO-2026-0006',
      customer: customers[6],
      status: 'DRAFT',
      createdBy: employee2,
      items: [{ sku: 'BEAU-003', quantity: 2 }],
      daysAgo: 2,
      // no invoice yet — order isn't confirmed
    },
    {
      orderNumber: 'SO-2026-0007',
      customer: customers[7],
      status: 'CANCELLED',
      createdBy: manager,
      items: [{ sku: 'SPRT-004', quantity: 1 }],
      daysAgo: 8,
      // cancelled — no invoice, no stock effect
    },
    {
      orderNumber: 'SO-2026-0008',
      customer: customers[4],
      status: 'CONFIRMED',
      createdBy: admin,
      items: [
        { sku: 'GROC-001', quantity: 5 },
        { sku: 'BOOK-002', quantity: 10 },
      ],
      daysAgo: 4,
      invoice: {
        invoiceNumber: 'INV-2026-0006',
        dueInDays: 14,
        payments: [],
      },
    },
  ];

  let soCount = 0;
  let invoiceCount = 0;
  let paymentCount = 0;
  for (const so of salesOrdersPlan) {
    const createdAt = new Date(Date.now() - so.daysAgo * 24 * 60 * 60 * 1000);
    const items = so.items.map(({ sku, quantity }) => {
      const prod = product(sku);
      return { productId: prod.id, quantity, unitPrice: prod.sellPrice };
    });
    const totalAmount = items.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );

    const createdSo = await prisma.salesOrder.create({
      data: {
        orderNumber: so.orderNumber,
        customerId: so.customer.id,
        status: so.status,
        totalAmount,
        createdById: so.createdBy.id,
        createdAt,
        confirmedAt: so.status === 'CONFIRMED' ? createdAt : null,
        items: { create: items },
      },
    });
    soCount++;

    if (so.status === 'CONFIRMED') {
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { decrement: item.quantity } },
        });
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            referenceType: 'SALES_ORDER',
            referenceId: createdSo.id,
            note: `Shipped against ${so.orderNumber}`,
            createdById: so.createdBy.id,
            createdAt,
          },
        });
      }
    }

    if (so.invoice) {
      const dueDate = new Date(
        createdAt.getTime() + so.invoice.dueInDays * 24 * 60 * 60 * 1000,
      );
      const paymentsTotal = so.invoice.payments.reduce(
        (sum, p) => sum + Math.round(totalAmount * p.amountRatio * 100) / 100,
        0,
      );
      const status =
        paymentsTotal <= 0
          ? 'UNPAID'
          : paymentsTotal >= totalAmount
            ? 'PAID'
            : 'PARTIALLY_PAID';

      const createdInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: so.invoice.invoiceNumber,
          salesOrderId: createdSo.id,
          amount: totalAmount,
          amountPaid: paymentsTotal,
          status,
          dueDate,
          createdAt,
        },
      });
      invoiceCount++;

      for (const p of so.invoice.payments) {
        const amount = Math.round(totalAmount * p.amountRatio * 100) / 100;
        await prisma.payment.create({
          data: {
            invoiceId: createdInvoice.id,
            amount,
            method: p.method,
            recordedById: p.recordedBy.id,
            paidAt: new Date(
              createdAt.getTime() + p.daysAfterInvoice * 24 * 60 * 60 * 1000,
            ),
          },
        });
        paymentCount++;
      }
    }
  }
  console.log(
    `created ${soCount} sales orders, ${invoiceCount} invoices, ${paymentCount} payments`,
  );

  // ------------------------------------------------------------------
  // A few manual stock adjustments (stock counts, damage, corrections)
  // ------------------------------------------------------------------
  const adjustments: Array<{
    sku: string;
    quantity: number;
    note: string;
    by: typeof admin;
  }> = [
    {
      sku: 'ELEC-003',
      quantity: 15,
      note: 'Initial stock count adjustment',
      by: admin,
    },
    {
      sku: 'COMP-003',
      quantity: 50,
      note: 'Initial stock count adjustment',
      by: admin,
    },
    {
      sku: 'CLTH-001',
      quantity: 40,
      note: 'Initial stock count adjustment',
      by: manager,
    },
    {
      sku: 'HOME-003',
      quantity: -2,
      note: 'Damaged units written off',
      by: manager,
    },
  ];
  for (const adj of adjustments) {
    const prod = product(adj.sku);
    await prisma.product.update({
      where: { id: prod.id },
      data: { quantityInStock: { increment: adj.quantity } },
    });
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        type: 'ADJUSTMENT',
        quantity: adj.quantity,
        referenceType: 'MANUAL',
        note: adj.note,
        createdById: adj.by.id,
      },
    });
  }
  console.log(`created ${adjustments.length} manual stock adjustments`);

  // ------------------------------------------------------------------
  // Audit log samples
  // ------------------------------------------------------------------
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LOGIN',
        entityType: 'User',
        entityId: admin.id,
        userId: admin.id,
        metadata: { ip: '127.0.0.1' },
      },
      {
        action: 'CREATE',
        entityType: 'PurchaseOrder',
        entityId: null,
        userId: admin.id,
        metadata: { poNumber: 'PO-2026-0001' },
      },
      {
        action: 'UPDATE',
        entityType: 'CompanySettings',
        entityId: null,
        userId: admin.id,
        metadata: { field: 'address' },
      },
      {
        action: 'CREATE',
        entityType: 'SalesOrder',
        entityId: null,
        userId: employee1.id,
        metadata: { orderNumber: 'SO-2026-0001' },
      },
      {
        action: 'RECORD_PAYMENT',
        entityType: 'Payment',
        entityId: null,
        userId: manager.id,
        metadata: { method: 'BANK_TRANSFER' },
      },
    ],
  });
  console.log('created sample audit log entries');

  console.log('----------------------------------------');
  console.log('Seed complete. Login credentials:');
  console.log(`  ADMIN:    ${admin.email} / Password123`);
  console.log(`  MANAGER:  ${manager.email} / Password123`);
  console.log(`  EMPLOYEE: ${employee1.email} / Password123`);
  console.log(`  EMPLOYEE: ${employee2.email} / Password123`);
  console.log(`  (inactive, for testing): ${inactiveEmployee.email}`);
  console.log('----------------------------------------');
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
