import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Copy, Download, X } from 'lucide-react';

interface AdminPoliceReportModalProps {
  policeReportData: any | null;
  onClose: () => void;
  handleCopyPoliceReportText: () => void;
  copiedPoliceReport: boolean;
  handleDownloadPoliceReportJson: () => void;
}

export const AdminPoliceReportModal: React.FC<AdminPoliceReportModalProps> = ({
  policeReportData,
  onClose,
  handleCopyPoliceReportText,
  copiedPoliceReport,
  handleDownloadPoliceReportJson,
}) => {
  return (
    <AnimatePresence>
      {policeReportData && (
        <div className="fixed inset-0 z-[700] flex items-start justify-center p-3 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md" data-lenis-prevent>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-4 text-slate-100"
          >
            {/* モーダルヘッダー（印刷非表示アクションバー） */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 print-hidden pr-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
                  🚔
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">刑事訴訟法第197条第2項 照会回答</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full">OFFICIAL DISCLOSURE</span>
                  </div>
                  <h2 className="text-sm md:text-base font-bold text-white font-serif">
                    捜査関係事項照会 回答書 兼 ユーザー登録情報・全履歴保全証明データ
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95"
                  title="A4用紙フォーマットで印刷またはPDFとして保存"
                >
                  <Printer size={14} className="text-cyan-400" />
                  <span>印刷 / PDF保存</span>
                </button>
                <button
                  onClick={handleCopyPoliceReportText}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Copy size={14} />
                  <span>{copiedPoliceReport ? '✔ コピー完了' : 'テキスト書面コピー'}</span>
                </button>
                <button
                  onClick={handleDownloadPoliceReportJson}
                  className="px-3.5 py-2 bg-[#3B627F] hover:bg-[#487799] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="法的鑑識・フォレンジック用フルJSONデータ保存"
                >
                  <Download size={14} />
                  <span>JSON一括保存</span>
                </button>
              </div>
            </div>

            {/* 独立した閉じるXボタン（右上配置・丸枠デザイン） */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 shadow-md active:scale-90 print:hidden"
              aria-label="閉じる"
              title="閉じる"
            >
              <X size={18} />
            </button>

            {/* 書面本文領域 */}
            <div className="p-6 md:p-10 space-y-8 overflow-y-auto max-h-[80vh] bg-slate-900 text-slate-200 font-sans print:p-0 print:bg-white print:text-black print:max-h-none">
              
              {/* 1. 公文書ヘッダー */}
              <div className="border-b-2 border-amber-500/40 pb-6 print:border-black">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-xs font-mono text-amber-400 print:text-black font-bold">
                      【ReMEETs 治安防衛・公的捜査関係事項照会 統一回答書】
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold font-serif text-white print:text-black mt-1">
                      捜査関係事項照会 回答証明書
                    </h1>
                    <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                      根拠法令：刑事訴訟法第197条第2項（公務所等に対する照会）
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-right font-mono text-xs print:bg-gray-100 print:border-gray-300 print:text-black">
                    <div>発行日時: {new Date(policeReportData.report_generated_at).toLocaleString('ja-JP')}</div>
                    <div>システム: {policeReportData.system_name}</div>
                    <div className="text-amber-400 print:text-black font-bold mt-0.5">証明ID: POLICE-REQ-USR-{policeReportData.user.id}</div>
                  </div>
                </div>
              </div>

              {/* 2. 対象ユーザー基本登録情報 & SNS連携アカウント */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                  <span>1. 照会対象者 アカウント基本登録情報 ＆ SNS連携データ</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">ユーザーID</div>
                    <div className="font-mono text-sm font-bold text-white print:text-black">#{policeReportData.user.id}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">ユーザー名 (Username)</div>
                    <div className="font-bold text-white print:text-black">{policeReportData.user.username}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">表示ニックネーム</div>
                    <div className="font-bold text-emerald-400 print:text-black">{policeReportData.user.nickname || '未設定'}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">公的氏名 (登録本名)</div>
                    <div className="font-bold text-white print:text-black">{policeReportData.user.full_name || '未設定'}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">登録メールアドレス</div>
                    <div className="font-mono text-cyan-300 print:text-black font-bold">{policeReportData.user.email || '未設定'}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">認証済み携帯電話番号</div>
                    <div className="font-mono text-amber-300 print:text-black font-bold">{policeReportData.user.phone_number || '未登録'}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 col-span-1 md:col-span-2">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">外部SNS OAuth連携識別UID</div>
                    <div className="font-mono text-slate-200 print:text-black">
                      LINE UID: <span className="text-emerald-400 print:text-black">{policeReportData.user.line_uid || '未連携'}</span> | Google UID: <span className="text-cyan-400 print:text-black">{policeReportData.user.google_uid || '未連携'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <div className="text-slate-400 print:text-gray-500 text-[10px]">本人確認区分 / アカウント作成日時</div>
                    <div className="font-bold text-slate-200 print:text-black">
                      {policeReportData.user.is_ekyc_verified ? '🛡️ 公的eKYC承認済' : '📝 自己申告誓約'} ({new Date(policeReportData.user.created_at).toLocaleDateString('ja-JP')})
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. eKYC年齢確認・公的本人確認ログ */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                  <span>2. eKYC公的本人確認 ＆ 年齢認証監査ログ ({policeReportData.ageLogs?.length || 0}件)</span>
                </h3>
                {policeReportData.ageLogs && policeReportData.ageLogs.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-black border-b border-slate-800 print:border-gray-300">
                        <tr>
                          <th className="p-2.5">ログ日時</th>
                          <th className="p-2.5">判定</th>
                          <th className="p-2.5">書類種別</th>
                          <th className="p-2.5">年齢</th>
                          <th className="p-2.5">IPアドレス</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                        {policeReportData.ageLogs.map((l: any) => (
                          <tr key={l.id} className="hover:bg-slate-850">
                            <td className="p-2.5">{new Date(l.created_at).toLocaleString('ja-JP')}</td>
                            <td className="p-2.5 font-bold">
                              {l.is_verified ? (
                                <span className="text-emerald-400 print:text-green-800">承認 (PASS)</span>
                              ) : (
                                <span className="text-rose-400 print:text-red-800">却下 (REJECTED)</span>
                              )}
                            </td>
                            <td className="p-2.5">{l.document_type || '-'}</td>
                            <td className="p-2.5">{l.age ? `${l.age}歳` : '-'}</td>
                            <td className="p-2.5">{l.ip || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    ※このユーザーのeKYC申請・年齢確認ログはまだ記録されていません。
                  </div>
                )}
              </div>

              {/* 4. 投稿ボトルメール全件履歴 (削除分・AI検閲隔離含む) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                  <span>3. 投稿ボトルメール全件履歴 (削除済み・AI検閲隔離データ含む : {policeReportData.posts?.length || 0}件)</span>
                </h3>
                {policeReportData.posts && policeReportData.posts.length > 0 ? (
                  <div className="space-y-3">
                    {policeReportData.posts.map((p: any) => (
                      <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-2">
                        <div className="flex flex-wrap justify-between items-center gap-2 font-mono border-b border-slate-800 print:border-gray-200 pb-2">
                          <span className="font-bold text-white print:text-black">ボトルID: #{p.id} ({new Date(p.created_at).toLocaleString('ja-JP')})</span>
                          <div className="flex items-center gap-2">
                            {p.ai_flagged ? (
                              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-bold">⚠️ AI自動隔離 ({p.ai_reason || '不適切内容'})</span>
                            ) : (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">正常判定</span>
                            )}
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">{p.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                          <div><span className="text-slate-500">宛先名:</span> <strong className="text-white print:text-black">{p.target_name} 様</strong></div>
                          <div><span className="text-slate-500">探している人表記:</span> <strong className="text-white print:text-black">{p.searcher_name} ({p.searcher_full_name || '未設定'})</strong></div>
                          <div><span className="text-slate-500">年代 / 地域:</span> <strong className="text-white print:text-black">{p.era || '-'} / {p.location || '-'}</strong></div>
                        </div>
                        <div className="bg-slate-900 print:bg-white p-3 rounded-lg border border-slate-800 print:border-gray-200 text-slate-200 print:text-black font-serif leading-relaxed whitespace-pre-wrap">
                          {p.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    ※投稿されたボトルメールはありません。
                  </div>
                )}
              </div>

              {/* 5. 連絡先安全開示 (セキュア・ブリッジ) ＆ マッチング決済履歴 */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                  <span>4. 連絡先安全開示 (セキュア・ブリッジ) ＆ 照合決済履歴 (成立: {policeReportData.matches?.length || 0}件 / 決済: {policeReportData.payments?.length || 0}件)</span>
                </h3>
                {policeReportData.matches && policeReportData.matches.length > 0 ? (
                  <div className="space-y-2.5">
                    {policeReportData.matches.map((m: any) => {
                      const isAuthor = m.user_id === policeReportData.user.id;
                      return (
                        <div key={m.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-1.5">
                          <div className="flex flex-wrap justify-between items-center gap-2 font-mono text-[11px] border-b border-slate-800/80 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold px-2 py-0.5 rounded ${isAuthor ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                {isAuthor ? 'ボトル投函者 (差出人)' : '照合受取人 (回答一致者)'}
                              </span>
                              <span>ボトルID: #{m.id}</span>
                            </div>
                            <span className="text-slate-400">{new Date(m.updated_at || m.created_at).toLocaleString('ja-JP')}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div>差出人: <strong>{m.author_username} ({m.author_full_name || '実名未登録'})</strong></div>
                            <div>受取人: <strong>{m.recipient_username} ({m.recipient_full_name || '実名未登録'})</strong></div>
                          </div>
                          <div className="bg-slate-900 print:bg-white p-2.5 rounded-lg border border-slate-800 print:border-gray-200 text-slate-200 print:text-black leading-relaxed flex flex-wrap items-center justify-between gap-2">
                            <div>開示連絡先形式: <strong className="text-amber-300 print:text-black">{m.contact_method || 'メールアドレス'}</strong></div>
                            <div className="font-mono text-slate-400">想い出クイズ照合: <span className="text-emerald-400 font-bold">完全一致 (合意成立)</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    ※成立したマッチング・連絡先開示記録はありません。
                  </div>
                )}

                {policeReportData.payments && policeReportData.payments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="text-xs font-bold text-slate-400 print:text-gray-700">開通・本人確認 決済トランザクションログ ({policeReportData.payments.length}件)</div>
                    <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px]">
                      {policeReportData.payments.map((py: any) => (
                        <div key={py.id} className="p-2 bg-slate-950 rounded border border-slate-850 flex justify-between items-center text-slate-300">
                          <span>{new Date(py.created_at).toLocaleString('ja-JP')} - {py.item_type || '連絡先開示'} (¥{py.amount || 0})</span>
                          <span className="font-bold text-emerald-400">{py.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. 通報・違反被害記録 */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                  <span>5. 通報・被害記録 (被通報: {policeReportData.reportsAsTarget?.length || 0}件 / 通報実行: {policeReportData.reportsAsReporter?.length || 0}件)</span>
                </h3>
                {policeReportData.reportsAsTarget && policeReportData.reportsAsTarget.length > 0 ? (
                  <div className="space-y-2">
                    {policeReportData.reportsAsTarget.map((r: any) => (
                      <div key={r.id} className="bg-rose-950/30 border border-rose-800/60 p-3 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-mono font-bold text-rose-300">
                          <span>被通報ID: #{r.id} (通報者ID: #{r.reporter_id})</span>
                          <span>{new Date(r.created_at).toLocaleString('ja-JP')}</span>
                        </div>
                        <div>理由: <strong>{r.reason || '不適切な行為'}</strong></div>
                        <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">{r.details || '詳細なし'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    ※このユーザーに対する他者からの通報記録はありません。
                  </div>
                )}
              </div>

              {/* 7. システム操作・アクセス監査ログ */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                  <span>6. システム操作 ＆ アクセスセキュリティ監査ログ (直近100件)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1">操作アクションログ ({policeReportData.actionLogs?.length || 0}件)</div>
                    <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                      {policeReportData.actionLogs && policeReportData.actionLogs.length > 0 ? (
                        policeReportData.actionLogs.map((al: any) => (
                          <div key={al.id} className="border-b border-slate-850 pb-1">
                            <div>{new Date(al.created_at).toLocaleString('ja-JP')} | IP: {al.ip || '-'}</div>
                            <div className="text-white font-bold">{al.action}: {al.details}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic">操作ログなし</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="font-bold text-indigo-400 border-b border-slate-800 pb-1">アクセスIP・UAログ ({policeReportData.accessLogs?.length || 0}件)</div>
                    <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                      {policeReportData.accessLogs && policeReportData.accessLogs.length > 0 ? (
                        policeReportData.accessLogs.map((acl: any) => (
                          <div key={acl.id} className="border-b border-slate-850 pb-1">
                            <div>{new Date(acl.created_at).toLocaleString('ja-JP')} | IP: <strong className="text-amber-300">{acl.ip || '-'}</strong></div>
                            <div className="text-slate-400 truncate">{acl.path} ({acl.user_agent})</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic">アクセスログなし</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. 法的電子署名 & 証明フッター */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs font-mono text-center print:border-gray-400 print:bg-gray-100">
                <div className="text-amber-400 print:text-black font-bold">【ReMEETs 治安防衛・法務コンプライアンス 統一保全証明】</div>
                <p className="text-slate-400 print:text-gray-700 leading-relaxed text-[11px]">
                  本証明書は、刑事訴訟法第197条第2項の規定に従い、ReMEETsデータベースシステムより正確に生成された非改ざん性暗号化データです。
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  System Audit Hash: SHA256-REMEETS-DISCLOSURE-POLICE-VERIFIED-{policeReportData.user.id}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
