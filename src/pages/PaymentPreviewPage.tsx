import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { AdminPaymentShowroom } from '../components/AdminPaymentShowroom';

export const PaymentPreviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span>サイトTOPへ戻る</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard size={15} className="text-indigo-600" />
              ReMEETs 決済システムプレビュー（確認用）
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold transition-colors"
            >
              管理者画面へ
            </Link>
          </div>
        </div>

        {/* Live Showroom Component */}
        <AdminPaymentShowroom />
      </div>
    </div>
  );
};
