import { config } from 'dotenv';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
console.log('加载环境变量文件:', envPath);
const result = config({ path: envPath });
if (result.error) {
  console.error('加载环境变量失败:', result.error);
} else {
  console.log('环境变量加载成功');
}

import connectDB from '../lib/mongodb';
import Category from '../models/Category';
import LinkItem from '../models/LinkItem';
import { SAMPLE_CATEGORY_TREE } from '../lib/sample-data';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/(^-|-$)/g, '')
    || 'category';
}

async function seedTreeIfEmpty() {
  const count = await Category.countDocuments();
  if (count > 0) {
    console.log('ℹ️  检测到现有分类，跳过整树示例创建');
    return;
  }

  const idMap = new Map<string, any>();

  for (const root of SAMPLE_CATEGORY_TREE) {
    const rootDoc = await Category.create({
      title: root.title,
      slug: root.slug,
      description: root.description,
      order: root.order ?? 0,
      enabled: true,
    });
    idMap.set(root.id, rootDoc._id);

    for (const child of root.children ?? []) {
      const childDoc = await Category.create({
        title: child.title,
        slug: child.slug,
        description: child.description,
        order: child.order ?? 0,
        enabled: true,
        parentId: rootDoc._id,
      });
      idMap.set(child.id, childDoc._id);
    }

    for (const link of root.links ?? []) {
      const categoryId = idMap.get(link.categoryId ?? root.id) ?? rootDoc._id;
      await LinkItem.create({
        title: link.title,
        url: link.url,
        description: link.description,
        iconUrl: link.iconUrl,
        categoryId,
        tags: link.tags,
        order: link.order ?? 0,
        enabled: true,
        clicks: 0,
        reviewStatus: 'approved',
        source: 'admin',
      });
    }
  }

  console.log('✅ 已插入完整示例分类树');
}

async function seedChildrenForExistingRoots() {
  const roots = await Category.find({
    $or: [{ parentId: { $exists: false } }, { parentId: null }],
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  let totalChildrenCreated = 0;
  let totalLinksCreated = 0;

  for (const root of roots) {
    const hasChild = await Category.exists({ parentId: root._id });
    if (hasChild) continue;

    const baseSlug = (root.slug || slugify(root.title)).replace(/[^a-z0-9-]/gi, '-');

    const childDefinitions = [
      {
        title: `${root.title}精选`,
        description: `示例子类：展示 ${root.title} 的精选内容`,
        slugSuffix: 'featured',
        sampleLink: {
          title: `${root.title} 精选资源`,
          url: 'https://example.com/featured',
          description: `示例链接，用于演示 ${root.title} 的二级分类`,
        },
      },
      {
        title: `${root.title}工具`,
        description: `示例子类：与 ${root.title} 相关的工具集合`,
        slugSuffix: 'tools',
        sampleLink: {
          title: `${root.title} 常用工具`,
          url: 'https://example.com/tools',
          description: `示例链接，用于演示 ${root.title} 的工具分类`,
        },
      },
    ];

    for (const [index, def] of childDefinitions.entries()) {
      let slugCandidate = `${baseSlug}-${def.slugSuffix}`;
      let attempt = 1;
      while (await Category.exists({ slug: slugCandidate })) {
        slugCandidate = `${baseSlug}-${def.slugSuffix}-${attempt++}`;
      }

      const child = await Category.create({
        title: def.title,
        slug: slugCandidate,
        description: def.description,
        order: index,
        enabled: true,
        parentId: root._id,
      });
      totalChildrenCreated += 1;

      await LinkItem.create({
        title: def.sampleLink.title,
        url: def.sampleLink.url,
        description: def.sampleLink.description,
        iconUrl: 'https://fav.farm/⭐',
        categoryId: child._id,
        tags: [root.title, '示例'],
        order: 0,
        enabled: true,
        clicks: 0,
        reviewStatus: 'approved',
        source: 'admin',
      });
      totalLinksCreated += 1;
    }
  }

  if (totalChildrenCreated > 0) {
    console.log(`✅ 已为 ${totalChildrenCreated} 个子分类创建示例结构（生成 ${totalLinksCreated} 个示例链接）`);
  } else {
    console.log('ℹ️  所有顶级分类均已存在子分类，未创建新的示例结构');
  }
}

async function run() {
  try {
    await connectDB();
    await seedTreeIfEmpty();
    await seedChildrenForExistingRoots();
    console.log('🎉 示例分类补齐完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 示例分类补齐失败:', error);
    process.exit(1);
  }
}

run();
