import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../app/models/category.js';
import Product from '../app/models/product.js';
import Seller from '../app/models/seller.js';
import HeroConfig from '../app/models/heroConfig.js';
import OfferSection from '../app/models/offerSection.js';

dotenv.config();

async function seedCatalog() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickcommerce');
    console.log('Connected to MongoDB');

    // 1. Get Seller
    let seller = await Seller.findOne({ email: 'harsh@appzeto.com' });
    if (!seller) {
      console.error('Seller harsh@appzeto.com not found. Run seedCredentials.js first.');
      process.exit(1);
    }

    // 2. Create Header Categories
    const headersData = [
      { name: 'Grocery & Kitchen', slug: 'grocery-kitchen', type: 'header', headerColor: '#123B8E', headerFontColor: '#FFFFFF', headerIconColor: '#FFFFFF', sortOrder: 1, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400' },
      { name: 'Fresh Produce', slug: 'fresh-produce', type: 'header', headerColor: '#16A34A', headerFontColor: '#FFFFFF', headerIconColor: '#FFFFFF', sortOrder: 2, image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=400' },
      { name: 'Snacks & Drinks', slug: 'snacks-drinks', type: 'header', headerColor: '#F4B400', headerFontColor: '#172033', headerIconColor: '#172033', sortOrder: 3, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400' },
      { name: 'Personal & Beauty', slug: 'personal-beauty', type: 'header', headerColor: '#E53935', headerFontColor: '#FFFFFF', headerIconColor: '#FFFFFF', sortOrder: 4, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400' },
    ];

    const headersMap = {};
    for (const h of headersData) {
      let doc = await Category.findOne({ slug: h.slug });
      if (!doc) {
        doc = await Category.create(h);
      } else {
        Object.assign(doc, h);
        await doc.save();
      }
      headersMap[h.slug] = doc;
    }
    console.log('✅ Headers created/updated');

    // 3. Create Main Categories & Subcategories
    const categoriesData = [
      {
        name: 'Atta, Rice & Dal',
        slug: 'atta-rice-dal',
        type: 'category',
        parentId: headersMap['grocery-kitchen']._id,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
        subcategories: [
          { name: 'Chakki Atta', slug: 'chakki-atta', type: 'subcategory' },
          { name: 'Basmati Rice', slug: 'basmati-rice', type: 'subcategory' },
          { name: 'Pulses & Dals', slug: 'pulses-dals', type: 'subcategory' },
        ]
      },
      {
        name: 'Dairy, Bread & Eggs',
        slug: 'dairy-bread-eggs',
        type: 'category',
        parentId: headersMap['grocery-kitchen']._id,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
        subcategories: [
          { name: 'Fresh Milk', slug: 'fresh-milk', type: 'subcategory' },
          { name: 'Butter & Cheese', slug: 'butter-cheese', type: 'subcategory' },
          { name: 'Farm Eggs', slug: 'farm-eggs', type: 'subcategory' },
        ]
      },
      {
        name: 'Fresh Vegetables',
        slug: 'fresh-vegetables',
        type: 'category',
        parentId: headersMap['fresh-produce']._id,
        image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400',
        subcategories: [
          { name: 'Daily Vegetables', slug: 'daily-vegetables', type: 'subcategory' },
          { name: 'Leafy Greens', slug: 'leafy-greens', type: 'subcategory' },
        ]
      },
      {
        name: 'Fresh Fruits',
        slug: 'fresh-fruits',
        type: 'category',
        parentId: headersMap['fresh-produce']._id,
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=400',
        subcategories: [
          { name: 'Seasonal Fruits', slug: 'seasonal-fruits', type: 'subcategory' },
          { name: 'Exotic Fruits', slug: 'exotic-fruits', type: 'subcategory' },
        ]
      },
      {
        name: 'Chips & Snacks',
        slug: 'chips-snacks',
        type: 'category',
        parentId: headersMap['snacks-drinks']._id,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400',
        subcategories: [
          { name: 'Potato Chips', slug: 'potato-chips', type: 'subcategory' },
          { name: 'Indian Namkeen', slug: 'indian-namkeen', type: 'subcategory' },
        ]
      },
    ];

    const categoryMap = {};
    const subcategoryMap = {};

    for (const cat of categoriesData) {
      const { subcategories, ...catFields } = cat;
      let catDoc = await Category.findOne({ slug: cat.slug });
      if (!catDoc) {
        catDoc = await Category.create(catFields);
      } else {
        Object.assign(catDoc, catFields);
        await catDoc.save();
      }
      categoryMap[cat.slug] = catDoc;

      for (const sub of subcategories) {
        let subDoc = await Category.findOne({ slug: sub.slug });
        if (!subDoc) {
          subDoc = await Category.create({ ...sub, parentId: catDoc._id });
        } else {
          subDoc.parentId = catDoc._id;
          await subDoc.save();
        }
        subcategoryMap[sub.slug] = subDoc;
      }
    }
    console.log('✅ Categories and Subcategories created/updated');

    // 4. Create Products
    const productsData = [
      {
        name: 'Aashirvaad Shuddh Chakki Atta 5kg',
        sku: 'ATT-AASH-5KG',
        description: '100% pure wheat flour processed with traditional chakki process.',
        price: 265,
        salePrice: 245,
        stock: 50,
        brand: 'Aashirvaad',
        weight: '5 kg',
        hsnCode: '1101',
        foodPreference: 'veg',
        headerId: headersMap['grocery-kitchen']._id,
        categoryId: categoryMap['atta-rice-dal']._id,
        subcategoryId: subcategoryMap['chakki-atta']._id,
        sellerId: seller._id,
        mainImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
        isFeatured: true,
        status: 'active',
        approvalStatus: 'approved',
      },
      {
        name: 'Amul Taaza Toned Milk 500ml',
        sku: 'MILK-AMUL-500ML',
        description: 'Fresh homogenized toned milk rich in calcium and vitamins.',
        price: 28,
        salePrice: 27,
        stock: 120,
        brand: 'Amul',
        weight: '500 ml',
        hsnCode: '0401',
        foodPreference: 'veg',
        headerId: headersMap['grocery-kitchen']._id,
        categoryId: categoryMap['dairy-bread-eggs']._id,
        subcategoryId: subcategoryMap['fresh-milk']._id,
        sellerId: seller._id,
        mainImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
        isFeatured: true,
        status: 'active',
        approvalStatus: 'approved',
      },
      {
        name: 'Farm Fresh Tomatoes 1kg',
        sku: 'VEG-TOMATO-1KG',
        description: 'Ripe red fresh local tomatoes sourced directly from farms.',
        price: 45,
        salePrice: 32,
        stock: 80,
        brand: 'Olovely Fresh',
        weight: '1 kg',
        hsnCode: '0702',
        foodPreference: 'veg',
        headerId: headersMap['fresh-produce']._id,
        categoryId: categoryMap['fresh-vegetables']._id,
        subcategoryId: subcategoryMap['daily-vegetables']._id,
        sellerId: seller._id,
        mainImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
        isFeatured: true,
        status: 'active',
        approvalStatus: 'approved',
      },
      {
        name: 'Fresh Alphonso Mangoes 1kg',
        sku: 'FRU-MANGO-1KG',
        description: 'Sweet naturally ripened premium Ratnagiri Alphonso mangoes.',
        price: 299,
        salePrice: 249,
        stock: 40,
        brand: 'Olovely Fresh',
        weight: '1 kg',
        hsnCode: '0804',
        foodPreference: 'veg',
        headerId: headersMap['fresh-produce']._id,
        categoryId: categoryMap['fresh-fruits']._id,
        subcategoryId: subcategoryMap['seasonal-fruits']._id,
        sellerId: seller._id,
        mainImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600',
        isFeatured: true,
        status: 'active',
        approvalStatus: 'approved',
      },
      {
        name: "Lays India's Magic Masala 50g",
        sku: 'SNK-LAYS-MASALA',
        description: 'Crispy potato chips seasoned with authentic spicy Indian masalas.',
        price: 20,
        salePrice: 18,
        stock: 150,
        brand: 'Lays',
        weight: '50 g',
        hsnCode: '2005',
        foodPreference: 'veg',
        headerId: headersMap['snacks-drinks']._id,
        categoryId: categoryMap['chips-snacks']._id,
        subcategoryId: subcategoryMap['potato-chips']._id,
        sellerId: seller._id,
        mainImage: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=600',
        isFeatured: true,
        status: 'active',
        approvalStatus: 'approved',
      },
    ];

    const createdProducts = [];
    for (const prod of productsData) {
      let pDoc = await Product.findOne({ sku: prod.sku });
      if (!pDoc) {
        pDoc = await Product.create(prod);
      } else {
        Object.assign(pDoc, prod);
        await pDoc.save();
      }
      createdProducts.push(pDoc);
    }
    console.log('✅ Products created/updated');

    // 5. Create Hero Config & Promotional Banners
    let heroDoc = await HeroConfig.findOne({ pageType: 'home', headerId: null });
    const heroBanners = {
      items: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1400',
          title: 'Super Savings Week',
          subtitle: 'Up to 50% OFF on Grocery Staples & Daily Essentials',
          linkType: 'category',
          linkValue: categoryMap['atta-rice-dal']._id.toString(),
          status: 'active'
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=1400',
          title: 'Farm Fresh Vegetables & Fruits',
          subtitle: 'Directly from local farms to your doorstep in 10 mins',
          linkType: 'category',
          linkValue: categoryMap['fresh-vegetables']._id.toString(),
          status: 'active'
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1400',
          title: 'Olovely Total Suvidha',
          subtitle: 'Everything delivered superfast with guaranteed quality',
          linkType: 'none',
          status: 'active'
        }
      ]
    };

    if (!heroDoc) {
      heroDoc = await HeroConfig.create({
        pageType: 'home',
        headerId: null,
        mediaType: 'image',
        banners: heroBanners
      });
    } else {
      heroDoc.banners = heroBanners;
      await heroDoc.save();
    }
    console.log('✅ Home Hero Banners created/updated');

    // 6. Create Offer Sections
    const offerData = [
      {
        title: 'Super Savings Deals',
        backgroundColor: '#123B8E',
        sideImageKey: 'grocery',
        categoryIds: [categoryMap['atta-rice-dal']._id],
        productIds: createdProducts.map((p) => p._id),
        sellerIds: [seller._id],
        order: 1,
        status: 'active'
      },
      {
        title: 'Farm Fresh Market',
        backgroundColor: '#16A34A',
        sideImageKey: 'kitchen',
        categoryIds: [categoryMap['fresh-vegetables']._id, categoryMap['fresh-fruits']._id],
        productIds: createdProducts
          .filter((p) => p.headerId && p.headerId.toString() === headersMap['fresh-produce']._id.toString())
          .map((p) => p._id),
        sellerIds: [seller._id],
        order: 2,
        status: 'active'
      }
    ];

    for (const off of offerData) {
      let oDoc = await OfferSection.findOne({ title: off.title });
      if (!oDoc) {
        await OfferSection.create(off);
      } else {
        Object.assign(oDoc, off);
        await oDoc.save();
      }
    }
    console.log('✅ Offer Sections created/updated');

    console.log('\n🎉 Catalog seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding catalog:', error);
    process.exit(1);
  }
}

seedCatalog();
