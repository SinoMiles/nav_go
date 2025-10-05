export interface SampleLinkDefinition {
  id: string;
  title: string;
  url: string;
  description: string;
  iconUrl: string;
  categoryId?: string;
  tags?: string[];
  order?: number;
}

export interface SampleChildDefinition {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface SampleCategoryDefinition {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  children?: SampleChildDefinition[];
  links?: SampleLinkDefinition[];
}

export const SAMPLE_CATEGORY_TREE: SampleCategoryDefinition[] = [
  {
    id: 'sample-search-root',
    title: '搜索引擎',
    slug: 'search-engines-sample',
    description: '主流综合与垂直搜索平台',
    order: 0,
    children: [
      {
        id: 'sample-search-general',
        title: '综合搜索',
        slug: 'search-general-sample',
        description: '覆盖全面的综合搜索引擎',
        order: 0,
      },
      {
        id: 'sample-search-vertical',
        title: '专业搜索',
        slug: 'search-vertical-sample',
        description: '专注细分领域的垂直搜索',
        order: 1,
      },
    ],
    links: [
      {
        id: 'sample-link-google',
        title: 'Google',
        url: 'https://www.google.com',
        description: '全球领先的综合搜索引擎',
        iconUrl: 'https://www.google.com/favicon.ico',
        categoryId: 'sample-search-general',
        tags: ['搜索', '国际'],
        order: 0,
      },
      {
        id: 'sample-link-zhihu',
        title: '知乎搜索',
        url: 'https://www.zhihu.com/explore',
        description: '知乎社区的热点问题与答案检索',
        iconUrl: 'https://static.zhihu.com/heifetz/favicon.ico',
        categoryId: 'sample-search-vertical',
        tags: ['搜索', '中文'],
        order: 1,
      },
    ],
  },
  {
    id: 'sample-social-root',
    title: '社交媒体',
    slug: 'social-media-sample',
    description: '主流社交与即时通讯平台',
    order: 1,
    children: [
      {
        id: 'sample-social-community',
        title: '社区平台',
        slug: 'social-community-sample',
        description: '分享灵感与交流观点的社区',
        order: 0,
      },
      {
        id: 'sample-social-messaging',
        title: '即时通讯',
        slug: 'social-messaging-sample',
        description: '高效沟通的聊天工具',
        order: 1,
      },
    ],
    links: [
      {
        id: 'sample-link-twitter',
        title: 'Twitter',
        url: 'https://twitter.com',
        description: '实时热点与观点分享平台',
        iconUrl: 'https://abs.twimg.com/favicons/twitter.2.ico',
        categoryId: 'sample-social-community',
        tags: ['社交', '资讯'],
        order: 0,
      },
      {
        id: 'sample-link-slack',
        title: 'Slack',
        url: 'https://slack.com',
        description: '团队即时协作沟通工具',
        iconUrl: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
        categoryId: 'sample-social-messaging',
        tags: ['协作', '沟通'],
        order: 1,
      },
    ],
  },
  {
    id: 'sample-dev-root',
    title: '开发工具',
    slug: 'dev-tools-sample',
    description: '面向开发者的工具与平台',
    order: 2,
    children: [
      {
        id: 'sample-dev-collaboration',
        title: '协作托管',
        slug: 'dev-collaboration-sample',
        description: '代码托管与协作平台',
        order: 0,
      },
      {
        id: 'sample-dev-productivity',
        title: '效率工具',
        slug: 'dev-productivity-sample',
        description: '提升研发效率的云服务工具',
        order: 1,
      },
    ],
    links: [
      {
        id: 'sample-link-github',
        title: 'GitHub',
        url: 'https://github.com',
        description: '全球最大开源代码托管与协作平台',
        iconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
        categoryId: 'sample-dev-collaboration',
        tags: ['开发', '开源'],
        order: 0,
      },
      {
        id: 'sample-link-vercel',
        title: 'Vercel',
        url: 'https://vercel.com',
        description: '前端团队的一体化部署与协作平台',
        iconUrl: 'https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/57x57.png',
        categoryId: 'sample-dev-productivity',
        tags: ['部署', '云服务'],
        order: 1,
      },
    ],
  },
];
