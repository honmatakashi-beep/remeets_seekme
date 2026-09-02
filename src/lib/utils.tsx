import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Process Env Polyfill for Browser ---
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

// --- cn utility ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 都道府県リスト ---
export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

// --- Helper Functions ---

export const formatEraLabel = (era?: string): string => {
  if (!era) return '年代未設定';
  const str = era.toString();
  if (str.includes('年代')) return str;
  const clean = str.replace(/[^0-9]/g, '');
  if (!clean) return str;
  if (clean.length === 4) return `${clean}年代`;
  if (clean.length === 2) {
    const num = parseInt(clean, 10);
    if (num >= 50) return `19${clean}年代`;
    return `20${clean}年代`;
  }
  return `${clean}年代`;
};

export const getCategoryText = (cat?: string): string => {
  if (!cat) return '未設定';
  switch (cat) {
    case 'school':
    case 'friend':
      return '学校（同級生・先生）';
    case 'work':
      return '職場（同僚・上司）';
    case 'neighborhood':
      return '近所・幼馴染';
    case 'hobby':
      return '趣味・サークル';
    case 'love':
      return '初恋・大切な人';
    case 'family':
      return '家族・親戚';
    case 'other':
      return 'その他';
    default:
      return cat;
  }
};

export const getPostUrl = (post: {
  id: number;
  target_name: string;
  target_hometown?: string;
  era?: string;
  relationship?: string;
  category?: string;
}): string => {
  if (!post) return '/';

  const relMap: Record<string, string> = {
    "friend": "同級生・友人",
    "school": "学校・同級生",
    "work": "同僚・仕事仲間",
    "love": "初恋・元恋人",
    "family": "家族・親戚",
    "neighborhood": "近所・幼馴染",
    "hobby": "趣味・サークル",
    "other": "その他"
  };

  const rawRel = post.relationship || post.category || '';
  const rel = rawRel ? (relMap[rawRel] || rawRel) : 'any';
  const name = post.target_name ? encodeURIComponent(post.target_name) : 'someone';

  const maskedHometown = post.target_hometown
    ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown)
    : 'anywhere';
  const hometown = encodeURIComponent(maskedHometown);

  const eraFormatted = formatEraLabel(post.era);
  const era = encodeURIComponent(eraFormatted);
  const relationship = encodeURIComponent(rel);

  return `/name/${name}/${hometown}/${era}/${relationship}?id=${post.id}`;
};

// --- PageHeader Component ---

export interface PageHeaderProps {
  icon?: React.ReactNode;
  iconBoxClassName?: string;
  category?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  iconBoxClassName = "bg-black/5 text-black",
  category,
  title,
  description,
  action,
  badge
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-brand-border pb-6">
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconBoxClassName}`}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {category && (
              <span className="text-[10px] md:text-xs font-bold text-black/60 uppercase tracking-[0.3em] font-sans whitespace-nowrap block">
                {category}
              </span>
            )}
            {badge}
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-black tracking-widest leading-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-black/70 font-sans leading-relaxed mt-1 hidden md:block">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
