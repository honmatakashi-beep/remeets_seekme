import React from "react";

export const RiskMitigationMatrix: React.FC = () => {
  return (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-950 leading-relaxed font-sans flex items-start gap-2.5">
            <span className="text-base select-none">🛡️</span>
            <div>
              <strong>セキュリティ適合性監査マトリクス：</strong>
              ReMEETsのすべての利用動線（会員登録からメッセージ投函、クイズゲート、メッセージ開通、事件防止まで）に対し、想定されるストーカー行為や不正アビューズ脅威をリストアップ。一次防衛策（システムによるバリデーションバリケード）と二次防衛策（Gemini AIによるセマンティック文脈監視）の二重自動フィルタおよび、司法照会用のログ保存の仕組みを完全に公開しています。
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-[#3B627F]/40 rounded-3xl shadow-md bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#487799]/10 text-[#3B627F] border-b-2 border-[#3B627F]/40 font-bold">
                  <th className="p-4 border-r border-[#3B627F]/30 rounded-tl-2xl">防御フェーズ</th>
                  <th className="p-4 border-r border-[#3B627F]/30">想定脅威（アビューズ）</th>
                  <th className="p-4 border-r border-[#3B627F]/30">プログラム防衛策（バリデーション等）</th>
                  <th className="p-4 border-r border-[#3B627F]/30">AIモデレーション（Gemini審査等）</th>
                  <th className="p-4 rounded-tr-2xl border-b border-[#3B627F]/40 font-mono text-[11px]">監査用ログ・痕跡データ (Forensic)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3B627F]/30 font-sans">
                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">① プロフィール設定</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">本名フルネーム登録による個人特定危険</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    アカウント登録・ニックネーム設定時に、日本人の典型的な姓名辞書データベースと照合。一致度が高過ぎるフルネーム（例：漢字2字＋漢字2字等）は警告し、イニシャルやあだ名へ変更を促します。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    自己紹介文などの自由入力エリアを自動判定。「本名」「住所」「SNSハンドル」が含まれている比率をAI判定し、不具合警告。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    登録時のグローバルIP・UA・登録タイミングスタンプを永続セキュリティ保存。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">② メッセージボトル投函（基本）</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">メッセージ内の「実名・連絡先交換」によるプラットフォーム外への誘導・ハラスメント</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    文字入力ボックスフックに、メール/電話Regex、LINE/インスタ等SNSアカウントの検知Regexをバインド。外部手段の直接掲載自体を仕組みから厳格に弾きます。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    <strong>【レッドアラート格納】</strong><br/>
                    「L!NE」「L_I_N_E」などの伏字や、SNSを示唆する回避文章をGemini AIが文脈解釈。「未承認」に落とし一般漂流から1秒で完全シャット。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    AIが判定したアラート文面、危険度判定ログ、ボトル投函元の会員アカウント情報を完全ログ化。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">② メッセージボトル投函（他人特定）</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">標的のお相手以外の第三者プライバシー権利侵害・特定情報の掲載</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    宛先を規定の「お名前」「都道府県」「出会った当時の関係性」などの曖昧なデータに制約。具体的なアパート名、個別地番、職場名称などは入力不可。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    「想い出メッセージ」にお相手のプライバシーや実質的なストーキングに繋がる極めて狭い情報を記述していないかをAIモデレーション検知。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    投函緯度経度・IP履歴などセキュリティログを自動追跡保管。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">③ 想い出クイズの設定</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">クイズ文面を悪用した誹謗中傷、嫌がらせ、ネットいじめ</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    質問の入力ボックス内にNGワード（誹謗・性的侮辱表現など）を監視する文字バリデーションをコール。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    質問全体のセンチメント（感情強度）判定。執拗な執着、脅迫、恋愛感情の強制的な強要を発見した場合に自動的に対象ボトルの一般流出を一時停止（漂流停止）。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    クイズ問題データ、設定者アカウントデータ、不承認検知履歴を管理者向け監査として完全保存。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">④ お相手検索行為</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">第三者が宛先に対して手当たり次第に総当たり検索しストーキングを試行</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    一定時間に繰り返される異なる氏名、または多拠点の都道府県切り替え無差別検索動作に対してレートペナルティ（お名前検索の回数制限）を設定。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    特定のアカウントによる総当たり型のクエリ動作、不正ボットに近い高サイクルログを自動検知して管理パネル通報。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    検索の監査ログ（`search_logs`）の完全暗号化保存（パーマリンク）。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">⑤ クイズ解答試行</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">あてずっぽうなどクイズの総当たり解答によるメッセージの不正な解凍（個人情報リーク）</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    同じボトル、または同じIP/セッションから一定回数（基本は5回）連続で回答を誤った場合に、<strong>プログラム的にメッセージの回答権を24時間完全にロックアウト</strong>。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    不自然な多回数失敗ボトルの検知。バーストした過剰なアタックセッションを検疫。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    失敗時の試行ワード履歴、元セッション・IP情報を保存。管理者によるアカウント拒否権と連動。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">⑥ 連絡先開示（セキュアブリッジ）</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">なりすまし突破成功後のストーカー・嫌がらせ接触、事件化</td>
                  <td className="p-4 text-black/70 leading-relaxed font-sans text-xs border-r border-[#3B627F]/20">
                    連絡先開示手続きに進む前に、<strong>18歳以上（高校生を除く）</strong>、<strong>ストーカーや無断面識を目的としない安全第一の利用宣誓</strong>への電子的合意を完全無効化不可能なフェーズゲートとして設置。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    不適切な利用の兆候や多回数照合試行をAI分析。執着・悪意が認められた場合に即時遮断。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    同意した電子的宣誓ログ（合意タイムスタンプ、IPアドレス、ユーザー識別子）を「証拠開示用」として管理者サーバーデータベースに高セキュリティ保全。
                  </td>
                </tr>
              </tbody>
                </table>
              </div>
            </div>
  );
};
