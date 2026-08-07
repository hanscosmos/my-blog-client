interface QueryType {
  title: string;
  category?: string;
}

interface ArticleTagItem {
  id: string;
  name: string;
  alias: string;
  sort: number;
  color: string;
  description: string;
}

interface ArticleItemType {
  id: string;
  title: string;
  pinyin: string;
  category: {
    name: string;
    id: string;
    father: string;
  } | null;
  author: {
    name: string;
    id: string;
    avatar: string;
  };
  status: string;
  properties: string;
  visible: string;
  column: string | null;
  createTime: string;
  updateTime: string;
  readCount: number;
  cover: string | null;
  isTop: boolean;
  abstract: string | null;
  isDelete: boolean;
  tags: ArticleTagItem[];
}

interface ArticleDetailBaseInfo {
  id: string;
  title: string;
  pinyin: string;
  cover: string | null;
  status: string;
  properties: string;
  visible: string;
  column: string | null;
  createTime: string;
  updateTime: string;
  readCount: number;
  isTop: boolean;
  abstract: string | null;
  isDelete: boolean;
}

interface ArticleDetailAuthorInfo {
  id: string;
  nickName: string;
  avatar: string;
}

interface ArticleDetailCategoryInfo {
  father: string;
  base: {
    id: string;
    name: string;
    alias: string;
  } | null;
}

interface ArticleDetailTagItem {
  id: string;
  name: string;
  alias: string;
  sort: number;
  color: string;
  description: string;
}

interface ArticleDetailInfo {
  content: string;
}

interface ArticleDetailType {
  baseInfo: ArticleDetailBaseInfo;
  authorInfo: ArticleDetailAuthorInfo;
  categoryInfo: ArticleDetailCategoryInfo | null;
  tagList: ArticleDetailTagItem[];
  detailInfo: ArticleDetailInfo;
  createTime: string;
}

interface ArticleCategoryItemType {
  id: string;
  name: string;
  alias: string;
  sort: number;
  father: string | null;
  fatherName?: string | null;
  description: string;
  children?: ArticleCategoryItemType[];
}

interface ArticleColumnItemType {
  id: string;
  name: string;
  sort: number;
  cover: string;
  description: string;
}
