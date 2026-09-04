import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { PageHeader } from '../lib/utils';

export const FaqPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black transition-opacity"
      >
        <ArrowLeft size={16} />
        <span>トップへ戻る</span>
      </Link>

      <div className="glass-card p-6 sm:p-8 md:p-12 bg-white rounded-3xl border border-brand-border shadow-sm space-y-8">
        <PageHeader
          icon={<HelpCircle size={26} className="text-teal-700" />}
          iconBoxClassName="bg-teal-50 text-teal-700 border border-teal-200"
          category="Help Center & FAQ"
          title="よくあるご質問（FAQ）"
          description="現在FAQページを再構築中です。"
        />

        <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-brand-border">
          <p className="text-sm text-black/70 font-sans">
            FAQデータはすべて安全に保持されています。ご希望の仕様やデザインをご指示ください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
