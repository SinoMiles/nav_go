import { config } from 'dotenv';
import path from 'path';
import { Types } from 'mongoose';

const envPath = path.join(process.cwd(), '.env.local');
console.log('Loading env file:', envPath);
const result = config({ path: envPath });
if (result.error) {
  console.error('Failed to load env file:', result.error);
} else {
  console.log('Environment variables loaded');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'configured' : 'not set');
}

import connectDB from '../lib/mongodb';
import Theme from '../models/Theme';
import Settings from '../models/Settings';
import Category from '../models/Category';
import LinkItem from '../models/LinkItem';
import { SAMPLE_CATEGORY_TREE } from '../lib/sample-data';
import { syncThemesWithFilesystem } from '../lib/theme';
import { getAvailableThemeNames } from '../lib/theme-registry';

async function seedSampleCategories() {
  const categoryCount = await Category.countDocuments();
  if (categoryCount > 0) {
    console.log('ℹ️  Existing categories detected, skipping seed data');
    return;
  }

  const idMap = new Map<string, Types.ObjectId>();

  for (const root of SAMPLE_CATEGORY_TREE) {
    const rootDoc = await Category.create({
      title: root.title,
      slug: root.slug,
      description: root.description,
      order: root.order ?? 0,
      enabled: true,
    });
    const rootObjectId = rootDoc._id as Types.ObjectId;
    idMap.set(root.id, rootObjectId);

    for (const child of root.children ?? []) {
      const childDoc = await Category.create({
        title: child.title,
        slug: child.slug,
        description: child.description,
        order: child.order ?? 0,
        enabled: true,
        parentId: rootObjectId,
      });
      idMap.set(child.id, childDoc._id as Types.ObjectId);
    }
  }

  for (const root of SAMPLE_CATEGORY_TREE) {
    for (const link of root.links ?? []) {
      const categoryObjectId = idMap.get(link.categoryId ?? root.id);
      if (!categoryObjectId) continue;

      await LinkItem.create({
        title: link.title,
        url: link.url,
        description: link.description,
        iconUrl: link.iconUrl,
        categoryId: categoryObjectId,
        tags: link.tags,
        order: link.order ?? 0,
        enabled: true,
        clicks: 0,
        reviewStatus: 'approved',
        source: 'admin',
      });
    }
  }

  console.log('✅ Seeded sample categories and links');
}

async function initDatabase() {
  try {
    console.log('🔗  Connecting to database...');
    await connectDB();

    console.log('🧹  Syncing themes with filesystem...');
    await syncThemesWithFilesystem();
    const availableNames = getAvailableThemeNames();

    console.log('⚙️  Checking site settings...');
    const existingSettings = await Settings.findOne({});

    if (!existingSettings) {
      const initialTheme = availableNames.includes('fullscreen-section')
        ? 'fullscreen-section'
        : availableNames[0] ?? 'fullscreen-section';

      await Settings.create({
        activeTheme: initialTheme,
        siteName: 'NavGo',
        siteDescription: 'Navigation system powered by Next.js',
        themeConfigs: {},
      });
      console.log('✅ Created default settings');
    } else {
      const sanitizedConfigs = Object.fromEntries(
        Object.entries(existingSettings.themeConfigs || {}).filter(([key]) =>
          availableNames.includes(key)
        ),
      );

      const activeTheme = existingSettings.activeTheme;
      existingSettings.activeTheme = availableNames.includes(activeTheme)
        ? activeTheme
        : (availableNames.includes('fullscreen-section')
            ? 'fullscreen-section'
            : availableNames[0] ?? 'fullscreen-section');
      existingSettings.themeConfigs = sanitizedConfigs;
      await existingSettings.save();
      console.log('ℹ️  Settings synchronized');
    }

    console.log('📂  Checking categories and sample data...');
    await seedSampleCategories();

    console.log('\n🎉 Database initialization complete!');
    console.log('📝 Next steps:');
    console.log('1. Visit http://localhost:3000/admin/register to create an admin account');
    console.log('2. Sign in to the admin panel to manage categories and links');
    console.log('3. Use theme management to switch and preview themes');

    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();

