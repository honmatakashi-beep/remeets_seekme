import { Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { BottleLoader } from "./SharedComponents";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Markdown from "react-markdown";
import {
  Download, Printer, Presentation, CheckSquare, Search, FileText
} from "lucide-react";
import { PRShortsHelperCard } from "./PRShortsHelperCard";
import { PolicePresentationSlideViewer } from "./PolicePresentationSlideViewer";
import {
  POLICE_PRESENTATION_SCENARIOS,
  DEFAULT_AUTH_MEMO
} from "./deploymentGuide/deploymentGuideConstants";
import { POLICE_PRESENTATION_SLIDES } from "../pages/admin/data/policePresentationData";
import { handlePrintDocument, handleDownloadAuditCSV } from "./deploymentGuide/guidePrintHtml";
import { handleExportPptx } from "./deploymentGuide/pptxExport";
import { CostSimulators } from "./deploymentGuide/CostSimulators";
import { DeploymentChecklistModal } from "./deploymentGuide/DeploymentChecklistModal";
import { RiskMitigationMatrix } from "./deploymentGuide/RiskMitigationMatrix";

export { POLICE_PRESENTATION_SCENARIOS, DEFAULT_AUTH_MEMO };

export const AdminDeploymentGuideBlock: React.FC<{ 
  docType: "deployment" | "cost_estimate" | "cost_list_detailed" | "permit" | "police" | "consult" | "matrix" | "slides" | "scenario" | "requirements" | "evaluation" | "pr_plan" | "legal_guide"; 
  setDocType: (val: "deployment" | "cost_estimate" | "cost_list_detailed" | "permit" | "police" | "consult" | "matrix" | "slides" | "scenario" | "requirements" | "evaluation" | "pr_plan" | "legal_guide") => void;
}> = ({ docType, setDocType }) => {
  const [smsCount, setSmsCount] = React.useState<number>(1000);
  const [costTab, setCostTab] = React.useState<"running" | "initial">("running");
  const [subTab, setSubTab] = React.useState<"memo_alert" | "deploy_basic" | "pr_strategy">("memo_alert");
  const [evaluationDateTab, setEvaluationDateTab] = React.useState<"2026-09-05" | "2026-08-24" | "2026-08-15">("2026-09-05");
  const [showChecklistModal, setShowChecklistModal] = React.useState<boolean>(false);
  const [activeChecklistTab, setActiveChecklistTab] = React.useState<"deploy" | "operation">("deploy");
  const [markdown, setMarkdown] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (["deployment", "cost_estimate", "cost_list_detailed", "permit", "requirements", "legal_guide"].includes(docType)) {
      setSubTab("deploy_basic");
    } else if (["evaluation", "pr_plan", "slides"].includes(docType)) {
      setSubTab("pr_strategy");
    }
  }, [docType]);

  React.useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        let fileName = "ReMEETs_Deployment_Guide.md";
        if (docType === "permit") fileName = "ReMEETs_Permit_QA_Guide.md";
        else if (docType === "cost_estimate") fileName = "ReMEETs_Monetization_Guide.md";
        else if (docType === "cost_list_detailed") fileName = "ReMEETs_Cost_List_Guide.md";
        else if (docType === "police") fileName = "ReMEETs_Police_Compliance_Guide.md";
        else if (docType === "consult") fileName = "ReMEETs_Police_Consultation_Flow.md";
        else if (docType === "matrix") fileName = "ReMEETs_Risk_Mitigation_Matrix.md";
        else if (docType === "scenario") fileName = "ReMEETs_Police_Presentation_Scenario.md";
        else if (docType === "requirements") fileName = "ReMEETs_Requirements_Definition.md";
        else if (docType === "evaluation") {
          if (evaluationDateTab === "2026-08-24") fileName = "ReMEETs_Overall_Evaluation_20260824.md";
          else if (evaluationDateTab === "2026-08-15") fileName = "ReMEETs_Overall_Evaluation_20260815.md";
          else fileName = "ReMEETs_Overall_Evaluation.md";
        }
        else if (docType === "pr_plan") fileName = "ReMEETs_PR_Plan.md";
        else if (docType === "legal_guide") fileName = "ReMEETs_Legal_Compliance_Guide.md";
        
        const response = await fetch("/" + fileName);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(arrayBuffer);
          setMarkdown(text);
        } else {
          setMarkdown("ドキュメントの読み込みに失敗しました。");
        }
      } catch (err) {
        setMarkdown("サーバーエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };
    
    if (docType !== "slides") {
      fetchDoc();
    } else {
      setLoading(false);
    }
  }, [docType, evaluationDateTab]);

  const docMenuItems: { id: any; badge: string; cat: string; label: string }[] = [
    { id: "deployment", badge: "①", cat: "手順書", label: "本番デプロイ手順＆安全設計" },
    { id: "cost_estimate", badge: "①-B", cat: "財務", label: "運用コスト試算シミュレータ" },
    { id: "cost_list_detailed", badge: "①-C", cat: "財務", label: "運用コスト総合見積もりリスト" },
    { id: "permit", badge: "②", cat: "法務", label: "開業届出・異性紹介非該当Q&A" },
    { id: "police", badge: "③", cat: "警察連携", label: "生活安全課 協議用セキュリティ報告書" },
    { id: "consult", badge: "④", cat: "警察連携", label: "警察署 事前相談＆令状開示フロー" },
    { id: "matrix", badge: "⑤", cat: "監査", label: "セキュリティ適合性監査マトリクス" },
    { id: "slides", badge: "⑥", cat: "プレゼン", label: "警察・行政向けプレゼンスライド" },
    { id: "scenario", badge: "⑦", cat: "原稿", label: "警察向け口頭発表スクリプト" },
    { id: "requirements", badge: "⑧", cat: "要件定義", label: "システム基本要件定義書" },
    { id: "evaluation", badge: "⑨", cat: "技術評価", label: "サイト全体評価＆専門家レビュー" },
    { id: "pr_plan", badge: "⑩", cat: "広報戦略", label: "PR・マーケティング立ち上げ計画" },
    { id: "legal_guide", badge: "⑪", cat: "法令基準", label: "主要関係法令適合性ガイダンス" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ナビゲーションセレクター */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText size={15} className="text-[#3B627F]" />
              <span>公式仕様書・法的適合文書マスターセレクター</span>
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              全13編 完備
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSubTab("memo_alert")}
              className={"px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer " + (
                subTab === "memo_alert" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              )}
            >
              備忘録・全文書
            </button>
            <button
              onClick={() => {
                setSubTab("deploy_basic");
                setDocType("deployment");
              }}
              className={"px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer " + (
                subTab === "deploy_basic" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              )}
            >
              デプロイ・法務
            </button>
            <button
              onClick={() => {
                setSubTab("pr_strategy");
                setDocType("pr_plan");
              }}
              className={"px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer " + (
                subTab === "pr_strategy" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              )}
            >
              PR・広報戦略
            </button>
          </div>
        </div>

        {/* ドキュメントタブボタン一覧 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {docMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setDocType(item.id)}
              className={"p-2 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between min-h-[58px] " + (
                docType === item.id
                  ? "bg-[#3B627F] text-white border-[#3B627F] shadow-sm ring-2 ring-[#3B627F]/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={"text-[10px] font-bold px-1.5 py-0.2 rounded font-mono " + (
                  docType === item.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {item.badge}
                </span>
                <span className={"text-[9px] font-sans " + (docType === item.id ? "text-teal-200" : "text-slate-400")}>
                  {item.cat}
                </span>
              </div>
              <p className="text-xs font-bold truncate mt-1">
                {item.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* PR動画構成案クイックショートカットカード */}
      {subTab === "pr_strategy" && (
        <PRShortsHelperCard />
      )}

      {/* 本番前 2大チェックリスト操作盤 */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-800 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <CheckSquare size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>本番デプロイ・実運用直前 2大必須チェックリスト</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                本番ローンチ直前用
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              インフラ構築・外部API契約・公安警察事前相談から、全22項目の実動テスト項目まで網羅的に自己検品できます。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => {
              setActiveChecklistTab("deploy");
              setShowChecklistModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <CheckSquare size={14} />
            <span>📋 ① 本番デプロイ 19大マスターリスト</span>
          </button>

          <button
            onClick={() => {
              setActiveChecklistTab("operation");
              setShowChecklistModal(true);
            }}
            className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <Search size={14} />
            <span>🔍 ② 本番前動作確認 22大テストリスト</span>
          </button>
        </div>
      </div>

      {/* ドキュメント出力・PDF印刷操作盤 */}
      <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print-hidden animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
            <Download size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 font-sans">
              公式ドキュメント PDF出力・印刷操作盤
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              現在表示中のデプロイガイド、運用コスト設計書、PR戦略書を高品位PDFとして出力・保存します。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {docType !== "slides" && (
            <button
              onClick={() => handlePrintDocument(docType, smsCount, evaluationDateTab)}
              className="px-4 py-2 bg-[#3B627F] text-white hover:bg-[#1C2B3C] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} />
              <span>📄 表示中ドキュメントをPDF保存 / 印刷</span>
            </button>
          )}

          {docType === "slides" && (
            <button
              onClick={() => handleExportPptx()}
              className="px-3.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <Presentation size={13} />
              <span>PowerPoint (.pptx) エクスポート</span>
            </button>
          )}

          <button
            onClick={handleDownloadAuditCSV}
            className="px-3.5 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Download size={13} />
            <span>監査用サンプルCSV出力</span>
          </button>
        </div>
      </div>

      {/* セキュリティ適合性マトリクス表示 */}
      {docType === "matrix" && (
        <RiskMitigationMatrix />
      )}

      {/* スライドビューアまたはMarkdown表示 */}
      {docType === "slides" ? (
        <PolicePresentationSlideViewer 
          slides={POLICE_PRESENTATION_SLIDES} 
          scenarios={POLICE_PRESENTATION_SCENARIOS}
          onOpenScenarioDoc={() => {
            setDocType("scenario");
            window.scrollTo({ top: 300, behavior: "smooth" });
          }}
        />
      ) : docType === "cost_estimate" ? (
        <div className="space-y-6">
          <CostSimulators
            smsCount={smsCount}
            setSmsCount={setSmsCount}
            costTab={costTab}
            setCostTab={setCostTab}
          />
          <div className="p-6 bg-white border border-slate-200 rounded-2xl prose prose-slate max-w-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-[#3B627F]/20 border-t-[#3B627F] rounded-full animate-spin" />
                <p className="text-xs text-slate-500">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              <Markdown>{markdown}</Markdown>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6 prose prose-slate max-w-none font-sans">
          {docType === "evaluation" && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-4 not-prose">
              {(["2026-09-05", "2026-08-24", "2026-08-15"] as const).map((dateVal) => (
                <button
                  key={dateVal}
                  onClick={() => setEvaluationDateTab(dateVal)}
                  className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer " + (
                    evaluationDateTab === dateVal ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {dateVal === "2026-09-05" ? "最新評価版 (9/5)" : dateVal === "2026-08-24" ? "第2版 (8/24)" : "初版 (8/15)"}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-[#3B627F]/20 border-t-[#3B627F] rounded-full animate-spin" />
              <p className="text-xs text-slate-500">ドキュメントを読み込み中...</p>
            </div>
          ) : (
            <Markdown>{markdown}</Markdown>
          )}
        </div>
      )}

      {/* 2大チェックリストモーダル */}
      <DeploymentChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        activeTab={activeChecklistTab}
      />
    </div>
  );
};


export const AdminDeploymentGuidePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [docType, setDocType] = React.useState<"deployment" | "cost_estimate" | "cost_list_detailed" | "permit" | "police" | "consult" | "matrix" | "slides" | "scenario" | "requirements" | "evaluation" | "pr_plan" | "legal_guide">("deployment");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-light/50 backdrop-blur-sm">
        <BottleLoader />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 font-sans">
      <div className="mb-4 print-hidden">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 font-serif text-black">
          <ArrowLeft size={16} />
          <span>管理画面へ戻る</span>
        </Link>
      </div>
      <AdminDeploymentGuideBlock docType={docType} setDocType={setDocType} />
    </div>
  );
};
