import sys

new_code = """      <AnimatePresence>
        {showMypageEkycModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] border border-zinc-200 shadow-2xl p-6 md:p-8 w-full max-w-lg space-y-6 relative text-black"
            >
              {/* Close Button */}
              {mypageEkycStep !== 4 && (
                <button
                  type="button"
                  onClick={() => setShowMypageEkycModal(false)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 p-1 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}

              {/* Step 1: 案内 & メリット説明 */}
              {mypageEkycStep === 1 && (
                <div className="space-y-5 py-2 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full uppercase font-sans">
                      TRUSTDOCK INTEGRATION
                    </span>
                    <h3 className="text-lg font-serif font-bold text-zinc-900 pt-1">
                      公的本人確認手続き (eKYC)
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      過去のボトルも一括認証！出会い系目的排除と安全担保のための認証
                    </p>
                  </div>

                  <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-sans">
                      <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                      <span>本人確認を完了するメリット</span>
                    </h4>
                    <ul className="space-y-2 text-[11px] text-zinc-700 font-sans leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-teal-600 shrink-0">✔</span>
                        <span><strong>過去・未来すべての手紙にバッジ適用</strong>：これまで流したすべてのボトルメールに自動的に「🛡️ 本人確認済」マークが適用され、お相手への信頼度が最大化されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-teal-600 shrink-0">✔</span>
                        <span><strong>出会い・荒らしの完全排除</strong>：悪意ある使い捨てアカウント（複アカ・サクラ）を排除した真剣なユーザーであることを証明します。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-teal-600 shrink-0">✔</span>
                        <span><strong>チャット制限の解除</strong>：将来お相手とやり取りを開始する際も、二重署名やeKYCを繰り返す必要なく、非常にスムーズに開通できます。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-zinc-200/80 p-4 rounded-2xl space-y-2 bg-zinc-50/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-sans">審査・認証・プラットフォーム手数料</span>
                      <span className="font-extrabold text-zinc-900 font-sans">600円 (税込)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-sans">対応書類</span>
                      <span className="text-zinc-700 font-sans">マイナンバーカード / 免許証 / パスポート</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setMypageEkycStep(2)}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck size={16} />
                      <span>本人確認手続きに進む（審査手数料：600円）</span>
                    </button>
                    <p className="text-[10px] text-zinc-400 text-center font-sans">
                      ※ 認証および決済が完了するまで課金は発生しません。
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: eKYC フォーム入力 */}
              {mypageEkycStep === 2 && (
                <div className="space-y-4 py-2 text-left">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      公的書類の撮影・情報の入力
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      法令に基づく年齢確認と本人照合を行います。
                    </p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">提出書類の選択</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'license', label: '運転免許証' },
                          { id: 'mynumber', label: 'マイナンバー' },
                          { id: 'passport', label: 'パスポート' }
                        ].map(doc => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setMypageEkycDocType(doc.id as any)}
                            className={`py-2 px-1 text-[11px] rounded-lg border font-bold text-center transition-all cursor-pointer ${
                              mypageEkycDocType === doc.id
                                ? 'bg-teal-50 border-teal-500 text-teal-800 font-black shadow-2xs'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">氏名（漢字・本名）</label>
                        <input
                          type="text"
                          value={mypageEkycName}
                          onChange={e => setMypageEkycName(e.target.value)}
                          placeholder="例：山田 太郎"
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-teal-500 text-black bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">生年月日（年齢照合用）</label>
                        <input
                          type="date"
                          value={mypageEkycBirthdate}
                          onChange={e => setMypageEkycBirthdate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-teal-500 text-black bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block">公的証明書（表面および裏面）の画像アップロード</label>
                      <div className="border-2 border-dashed border-zinc-200 hover:border-teal-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-zinc-50/50">
                        <Upload size={20} className="mx-auto text-zinc-400 mb-1" />
                        <span className="text-[11px] font-bold text-zinc-600 block">表面・裏面の写真を撮影して添付</span>
                        <span className="text-[9px] text-zinc-400 block font-mono mt-0.5">※ JPEG, PNG形式のみ / 最大10MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMypageEkycStep(1)}
                      className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 font-bold rounded-lg text-xs transition-all cursor-pointer text-zinc-600 text-center"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!mypageEkycName || !mypageEkycBirthdate) {
                          alert('氏名と生年月日を入力してください（テスト用自動入力も利用できます）。');
                          return;
                        }
                        setMypageEkycStep(3);
                      }}
                      className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all shadow-md text-center cursor-pointer"
                    >
                      審査＆決済画面へ
                    </button>
                  </div>

                  {/* テスト自動入力ショートカット */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMypageEkycName(user?.fullName || "山田 太郎");
                        setMypageEkycBirthdate("1995-05-15");
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline bg-transparent border-none cursor-pointer"
                    >
                      🛠️ デバッグ：テスト用情報を自動入力
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: クレジットカード決済 */}
              {mypageEkycStep === 3 && (
                <div className="space-y-4 py-2 text-left">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      安全なStripeクレジットカード決済
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      審査・認証プラットフォーム手数料のお支払い
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 block">公的本人確認 eKYC審査手数料</span>
                      <span className="text-[10px] text-zinc-400 font-mono block">TRUSTDOCK Verification Service</span>
                    </div>
                    <span className="text-lg font-black text-zinc-950 font-mono">¥600</span>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">カード番号</label>
                      <input
                        type="text"
                        value={mypagePayCardNumber}
                        onChange={e => setMypagePayCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 font-mono text-black bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">有効期限 (MM/YY)</label>
                        <input
                          type="text"
                          value={mypagePayCardExpiry}
                          onChange={e => setMypagePayCardExpiry(e.target.value)}
                          placeholder="12/29"
                          maxLength={5}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 font-mono text-black bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 block">セキュリティコード (CVC)</label>
                        <input
                          type="text"
                          value={mypagePayCardCvc}
                          onChange={e => setMypagePayCardCvc(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 font-mono text-black bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 block">カード名義人</label>
                      <input
                        type="text"
                        value={mypagePayCardName}
                        onChange={e => setMypagePayCardName(e.target.value)}
                        placeholder="TARO YAMADA"
                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-zinc-950 text-black bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMypageEkycStep(2)}
                      className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 font-bold rounded-lg text-xs transition-all cursor-pointer text-zinc-600 text-center"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!mypagePayCardNumber || !mypagePayCardExpiry || !mypagePayCardCvc || !mypagePayCardName) {
                          alert('クレジットカード情報をすべて入力してください（テスト用カードでの自動入力も利用できます）。');
                          return;
                        }
                        setMypageEkycStep(4);
                        setMypageEkycProgress(0);
                        const interval = setInterval(() => {
                          setMypageEkycProgress(prev => {
                            if (prev >= 100) {
                              clearInterval(interval);
                              setMypageEkycStep(5);
                              setUser(prevUser => prevUser ? { ...prevUser, ageVerified: true, isEkycApproved: true } : null);
                              return 100;
                            }
                            return prev + 10;
                          });
                        }, 200);
                      }}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-all shadow-md text-center cursor-pointer"
                    >
                      安全に決済して申請を送信
                    </button>
                  </div>

                  <div className="text-center font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        setMypagePayCardNumber("4242 4242 4242 4242");
                        setMypagePayCardExpiry("12/29");
                        setMypagePayCardCvc("123");
                        setMypagePayCardName(user?.fullName || "TARO YAMADA");
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline bg-transparent border-none cursor-pointer"
                    >
                      🛠️ デバッグ：テスト用カード情報を自動入力
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: 照合審査中 */}
              {mypageEkycStep === 4 && (
                <div className="space-y-6 py-4 text-center animate-pulse">
                  <div className="flex justify-center">
                    <RefreshCw className="animate-spin text-teal-600" size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      公的本人確認（eKYC）審査中...
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                      TRUSTDOCKシステムと接続し、身分証明書の画像解析およびリアルタイム顔写真照合を行っています。
                    </p>
                  </div>
                  <div className="space-y-1 max-w-xs mx-auto">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>VERIFYING STATUS</span>
                      <span>{mypageEkycProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full transition-all duration-150"
                        style={{ width: `${mypageEkycProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: 完了 */}
              {mypageEkycStep === 5 && (
                <div className="space-y-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <ShieldCheck size={36} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-zinc-900">
                      本人確認（eKYC）審査完了！
                    </h3>
                    <p className="text-xs text-zinc-600 font-sans max-w-sm mx-auto leading-relaxed">
                      公的本人確認が完了しました！これより、過去に投函したすべてのボトルメールおよび今後送るすべての手紙に自動的に「🛡️ 本人確認済」マークが適用されます。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMypageEkycModal(false);
                      setMypageEkycStep(1);
                    }}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                  >
                    閉じる
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

const SafetyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>

    <div className="glass-card p-8 md:p-16 text-black space-y-12 bg-white rounded-3xl border border-brand-border shadow-sm">
      <div className="flex items-center gap-4 border-b border-brand-border/60 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-black">安心安全な再会への取り組み</h1>
          <p className="text-xs text-neutral-500 font-sans mt-1">ストーカーや荒らし、なりすましを徹底排除する「２段階」安全防御アーキテクチャ</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-black font-serif border-b border-brand-border pb-2">「２段階」安全防御アーキテクチャの比較</h2>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          ReMEETsでは、会員登録時にLINEまたはGoogleのソーシャル認証を必須とすることで、使い捨てメールによる不正アカウント作成を強力に遮断しています。さらに、より確実で安全な再会、なりすましやストーカー行為を完全に防ぎ、お相手に100%の誠意を伝えたい方のために、公的本人確認（第2層：eKYC＋Stripe決済担保）オプションを提供しています。
        </p>

        <div className="overflow-x-auto rounded-2xl border border-brand-border shadow-xs bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border">
                <th className="p-4 font-bold text-brand-dark/80 w-1/4 font-serif">比較項目</th>
                <th className="p-4 font-bold text-slate-700 w-3/8 font-serif">無料の確認（通常認証）</th>
                <th className="p-4 font-bold text-emerald-950 w-3/8 bg-emerald-50/50 border-l border-emerald-100 font-serif">公的本人確認（eKYC）【有償】</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4 font-bold text-brand-dark/80 bg-slate-50/20 font-sans">利用料金</td>
                <td className="p-4 font-bold text-slate-600 font-sans">
                  <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">￥0 (永続無料)</span>
                  <p className="text-[11px] text-slate-500 font-normal mt-1">メッセージ送受信、検索、クイズ作成などすべての基本機能を無料でご利用可能です。</p>
                </td>
                <td className="p-4 font-bold text-emerald-900 bg-emerald-50/20 border-l border-emerald-100 font-sans">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">1回 ￥600 (仮売上方式)</span>
                  <p className="text-[11px] text-emerald-800/80 font-normal mt-1">Stripeで仮確保。本人確認に不合格またはキャンセルとなった場合は、システムが即座に全額自動返金処理を行うため、不当な負担はありません。</p>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-brand-dark/80 bg-slate-50/20 font-sans">本人照合方法</td>
                <td className="p-4 text-slate-600 font-sans">
                  LINE/Googleなどの外部連携SNSアカウントによる基本ログイン認証。
                </td>
                <td className="p-4 text-emerald-900 bg-emerald-50/20 border-l border-emerald-100 font-sans">
                  公的身分証明書（運転免許証・マイナンバーカード等）の顔写真と、カメラでの自撮りによるリアルタイム高精度eKYC照合。
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-brand-dark/80 bg-slate-50/20 font-sans">悪意ある試行対策</td>
                <td className="p-4 text-slate-600 font-sans">
                  思い出クイズへの回答制限（スロットリング制限）などシステム監視。
                </td>
                <td className="p-4 text-emerald-900 bg-emerald-50/20 border-l border-emerald-100 font-sans">
                  600円の有償決済をバリアとすることで、ひやかし・ストーカー等による「手当たり次第のクイズ回答試行」を物理的・心理的に遮断。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-black font-serif border-b border-brand-border pb-2">公的本人確認（eKYC）の重要性と役割</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/40 space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <UserCheck size={18} />
            </div>
            <h3 className="font-bold text-xs text-emerald-950 font-serif">なりすまし登録の完全排除</h3>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed font-sans">
              公的な身分証明書（運転免許証・マイナンバーカード等）と顔写真による自撮りリアルタイム照合（eKYC）を行うため、偽名や第三者へのなりすまし登録を完全に封じ込めます。お相手が「本物のあの人」であるという絶対の確実性を保証します。
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200/40 space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Coins size={18} />
            </div>
            <h3 className="font-bold text-xs text-emerald-950 font-serif">嫌がらせ・ストーカーの排除</h3>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed font-sans">
              600円（税込）というごく僅かなファイナンシャル・バリア（経済的ハードル）を設けることで、匿名でのひやかし目的や、粘着質なストーカー等による「手当たり次第のクイズ回答試行」といった悪意ある行動を物理的・心理的に100%遮断します。
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200/40 space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <RefreshCw size={18} />
            </div>
            <h3 className="font-bold text-xs text-emerald-950 font-serif">失敗時は即時・全額自動返金</h3>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed font-sans">
              Stripeの「オーソリ（仮売上）」を採用。確認手続きの開始時に600円の決済枠を一時確保しますが、本人確認に不合格となった場合は、システムが即座に全額自動返金します。不当な金銭負担は一切ありません。
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
);

const TermsContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第1条（適用）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        本規約は、当サービスが提供する再会支援プラットフォームの利用条件を定めるものであり、すべての会員ユーザーに適用されます。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第2条（利用資格・年齢制限）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        本サービスは、かつての友人や恩師, 同僚など, 面識のある特定の個人との安全な再会・再結合のみを目的としており、不特定多数の交際をあっせんするものではありません。
        18歳未満の方、および高校生の方は、本サービスを一切利用することはできません。年齢確認誓約を偽った登録が発覚した場合、直ちにアカウントを永久凍結します。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第3条（禁止事項）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
      </p>
      <ul className="list-disc pl-5 mt-2 space-y-1 leading-relaxed text-xs text-black font-sans">
        <li>面識のない第三者へのストーキング、張り込み、またはプライバシー妨害行為</li>
        <li>「想い出クイズ」にランダムまたは総当たりで解答して第三者の手紙を盗み見る行為</li>
        <li>嫌がらせ、脅迫、または名誉毀損に類する一切のメッセージ送信</li>
        <li>売春、援助交際、パパ活等の不適切な勧誘、金銭の授受を伴う交渉行為</li>
        <li>LINE IDや電話番号等の他者の個人特定情報を本人の意に反して公開・配布する行為</li>
      </ul>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第4条（安全対策と自動通報）</h3>
      <p className="leading-relaxed text-xs text-black font-sans font-sans">
        本サービスでは、不適切な投稿やメッセージ送信をリアルタイムに検知する自動モデレーション・レートリミッター機構、および管理者・他ユーザーへの自動通報機能を備えています。
        規約違反が検知された場合、事前の警告なく対象投稿 of 非表示化やアカウントアタック行為のIP制限、アカウント凍結等を実施します。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第5条（著作権・免責）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        本サービスに投稿されたメッセージや創作内容について、当社は一切の法的責任、権利保証等を行いません。ユーザー間の紛争および万一のトラブルについてはユーザー本人の責任にて解決するものとします。
      </p>
    </section>
  </div>
);

const PrivacyContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">1. 個人情報の収集・年齢確認</h3>
      <p className="leading-relaxed text-xs text-black font-sans">当社は、本サービスの提供にあたり、ユーザーから以下の情報を収集することがあります。</p>
      <ul className="list-disc pl-5 mt-3 space-y-1.5 leading-relaxed text-xs text-black font-sans">
        <li>アカウント登録時のメールアドレス、ユーザー名、生年月日</li>
        <li>SNSアカウント（LINE、Google等）連携の識別用IDトークン</li>
        <li>eKYCプロセスにおける公的身分証明書の真贋情報（当サーバー側には生画像は保存されません）</li>
      </ul>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">2. 利用目的</h3>
      <p className="leading-relaxed text-xs text-black font-sans">収集した個人情報は、以下の目的でのみ利用します。</p>
      <ul className="list-disc pl-5 mt-3 space-y-1.5 leading-relaxed text-xs text-black font-sans">
        <li>本人確認・年齢確認（18歳未満の利用防止）および多重アカウント（サクラ）の防止</li>
        <li>「想い出ボトル」のマッチング通知、再開チャット機能の提供</li>
        <li>重大な規約違反者、不審なスパムアクセスに対するセキュリティ対策およびアクセス制限</li>
      </ul>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">3. 第三者への開示・提供の制限</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        法令に基づく照合令状や、捜査関係事項照会書による開示要請があった場合を除き、当社はユーザーの個人情報を第三者に売却、開示、共有することはありません。
      </p>
    </section>
  </div>
);

const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 bg-white rounded-3xl border border-brand-border shadow-sm">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-black border-b border-brand-border/60 pb-6 mb-8">利用規約</h1>
      <TermsContent />
    </div>
  </div>
);

const PrivacyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 bg-white rounded-3xl border border-brand-border shadow-sm">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-black border-b border-brand-border/60 pb-6 mb-8">プライバシーポリシー</h1>
      <PrivacyContent />
    </div>
  </div>
);

const GuidelinesPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 bg-white rounded-3xl border border-brand-border shadow-sm space-y-6">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-black border-b border-brand-border/60 pb-6 mb-4">コミュニティガイドライン</h1>
      <p className="text-xs text-neutral-600 leading-relaxed font-sans">
        ReMEETsは、かつての大切な人たちとの温かい思い出を安全に再会・再現するためのプライベートな空間です。すべてのユーザーが心地よく利用できるように、以下のマナーとガイドラインを厳格に遵守してください。
      </p>
      <section className="space-y-3">
        <h3 className="font-bold font-serif text-neutral-900 text-sm">🌸 1. 純粋な思い出の場とするマナー</h3>
        <p className="text-xs text-neutral-600 leading-relaxed pl-4 font-sans font-sans">
          思い出の出来事や感謝を伝えるボトルには、お相手を中傷する文面や、個人を特定し不利益を被るような記述を絶対に含めないでください。言葉遣いは丁寧で温かみのある表現を心がけましょう。
        </p>
      </section>
      <section className="space-y-3">
        <h3 className="font-bold font-serif text-neutral-900 text-sm">🔒 2. ストーカー・出会い系目的利用 of 即時凍結</h3>
        <p className="text-xs text-neutral-600 leading-relaxed pl-4 font-sans font-sans">
          面識のない他人のアカウントへのいたずらアクセス、執拗なメッセージ送信、不適切な金銭を伴う関係の勧誘は、検知システムおよび24時間の管理者監査によって直ちにアカウント凍結処分となります。
        </p>
      </section>
    </div>
  </div>
);

const CompanyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 bg-white rounded-3xl border border-brand-border shadow-sm space-y-8">
      <h1 className="text-2xl md:text-3xl font-serif font-bold text-black border-b border-brand-border/60 pb-6 mb-4">特定商取引法に基づく表記</h1>
      <div className="divide-y divide-zinc-100 text-xs text-black">
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">サービス名</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">ReMEETs (リミーツ)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">運営会社名</span>
          <span className="md:col-span-2 text-neutral-900 font-medium font-medium">ReMEETs 運営プロジェクト委員会 / 代表：中野 俊輔</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">郵便番号・所在地</span>
          <span className="md:col-span-2 text-neutral-900 font-medium font-medium">〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル 2F-B (バーチャルオフィス契約)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">電話番号</span>
          <span className="md:col-span-2 text-neutral-900 font-medium font-medium">050-3183-8842 (受付時間：平日 10:00〜17:00 / 録音対応)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">メールアドレス</span>
          <span className="md:col-span-2 text-neutral-900 font-medium font-medium">support@remeets.link</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">商品の販売価格</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">
            お相手とのチャット開通手数料：1部屋 600円（税込 / 買い切り型）<br />
            ※アカウント作成、思い出ボトルの投函、公的本人確認（eKYC）手続き自体の登録費用は完全無料（0円）です。
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">お支払い方法</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">Stripeシステム（クレジットカード決済 / Visa、MasterCard、American Express等）</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">商品引渡し時期</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">クレジットカードによる仮売上確保および公的本人確認（eKYC）審査の合格をもって、即時システム上でチャットルームが有効化（解凍）されます。</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">返品・キャンセルについて</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">本人確認（eKYC）に不合格となった場合、または再会一致フローがキャンセルとなった場合は、Stripeシステムにより即座に「仮売上」が自動取り消し（全額返金）されるため、実質のご負担はありません。成立確定・チャット開通後の任意の退会および不成立以外での返金には応じかねます。</span>
        </div>
      </div>
    </div>
  </div>
);

const PricingPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>

    <div className="glass-card p-8 md:p-16 text-black space-y-12 bg-white rounded-3xl border border-brand-border shadow-sm">
      <div className="flex items-center gap-4 border-b border-brand-border/60 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
          <Coins size={32} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-black">利用料金のご案内</h1>
          <p className="text-xs text-neutral-500 font-sans mt-1">安心安全な再会プラットフォームを維持するための明確な料金体系について</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        
        {/* Left Column: Core Functions & Identity Verification (0 Yen) */}
        <div className="p-6 bg-white border border-brand-border/80 rounded-2xl space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-[10px] font-bold rounded-lg uppercase tracking-wider font-sans">
              <UserCheck size={12} className="text-neutral-500" />
              <span>基本機能・安全登録</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-neutral-900 font-serif">アカウント登録 ＆ 本人確認手続き</h2>
            <div className="flex items-baseline gap-1 border-b border-neutral-100 pb-3">
              <span className="text-5xl font-bold font-serif text-neutral-900 font-serif">0</span>
              <span className="text-base font-bold text-neutral-800 font-sans">円</span>
              <span className="text-[10px] text-neutral-400 font-sans font-normal ml-2">（完全無料 / 登録時費用なし）</span>
            </div>
            
            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              ReMEETsのすべての基本機能（会員登録、ボトルの検索、思い出レターの無制限投函、クイズ回答）に加え、<strong>安全利用のための「公的本人確認（eKYC）」や「SMS携帯番号認証」の登録手続き自体も、一切費用をかけず無料（0円）</strong>で行うことができます。
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <div>
                  <span className="font-bold text-neutral-800 block text-xs">会員登録・ボトル投函・クイズ検索</span>
                  <span className="text-[10px] text-neutral-500">いつでも、何通でも、思い出をボトルに詰めて無料で海へ流せます。</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <div>
                  <span className="font-bold text-neutral-800 block text-xs">公的eKYC本人確認（登録時）</span>
                  <span className="text-[10px] text-neutral-500">運転免許証やマイナンバーカードを用いた厳格な身元証明の登録費用は0円。</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <div>
                  <span className="font-bold text-neutral-800 block text-xs">SMS携帯番号認証（登録時）</span>
                  <span className="text-[10px] text-neutral-500">なりすましや複数アカ悪用を防ぐためのSMS送受信・登録費用も0円。</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 mt-4 font-sans">
            ※本人確認はアカウント作成時、またはメッセージを解凍する前のいつでも、完全に無料で行うことができます。
          </div>
        </div>

        {/* Right Column: Chat Opening (600 Yen) */}
        <div className="p-6 bg-rose-50/10 border-2 border-rose-300 rounded-3xl space-y-6 flex flex-col justify-between overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] px-4 py-1.5 rounded-bl-2xl font-bold font-sans tracking-wide">
            お相手との再会一致時のみ
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg uppercase tracking-wider font-sans">
              <Zap size={12} className="text-rose-500" />
              <span>思い出のボトル解凍</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-rose-950 font-serif">お相手とのチャット開通</h2>
            <div className="flex items-baseline gap-1 border-b border-rose-100 pb-3">
              <span className="text-5xl font-bold font-serif text-rose-600 font-serif">600</span>
              <span className="text-base font-bold text-rose-800 font-sans">円</span>
              <span className="text-[10px] text-neutral-500 font-sans font-normal ml-2">（1部屋の開通あたり / 税込 / 月額費用なし）</span>
            </div>

            <p className="text-xs text-neutral-800 leading-relaxed font-sans font-medium">
              思い出のクイズに完全一致（お互いが正答）し、実際にメッセージを送り合える<strong>「チャットルーム（対話部屋）」を開通する瞬間のみ、一度だけお支払いいただく</strong>手数料です。
            </p>

            <div className="space-y-3 bg-white p-3 rounded-2xl border border-rose-100 text-xs">
              <div className="font-bold text-rose-900 flex items-center gap-1.5 font-sans">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>月額料金は完全0円（買い切り型）</span>
              </div>
              <p className="text-[10px] text-neutral-600 leading-normal pl-5">
                開通したルーム内でのメッセージ往復、テキスト送信、再会の日程調整に、その後の追加料金は一切発生しません。
              </p>
              
              <div className="font-bold text-rose-900 flex items-center gap-1.5 font-sans">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>不成立時は全額自動返金（成功報酬型）</span>
              </div>
              <p className="text-[10px] text-neutral-600 leading-normal pl-5">
                本人確認審査に不合格となった場合やマッチングがキャンセルされた場合は、仮売上が即座に自動取り消しされます。
              </p>
            </div>
          </div>

          <div className="text-[10px] text-rose-800/90 bg-rose-500/5 p-2.5 rounded-xl border border-rose-100 mt-4 leading-relaxed font-sans">
            ※チャット開通（ボトル解凍）に伴う手数料決済には、Stripeによる安全なクレジットカード決済がご利用いただけます。
          </div>
        </div>

      </div>

      {/* Donation / Supporters Section (別枠) */}
      <section className="p-6 md:p-8 bg-gradient-to-br from-[#487799]/5 to-rose-50/20 border border-[#487799]/20 rounded-3xl relative overflow-hidden space-y-6 font-sans">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#487799]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#487799]/15 flex items-center justify-center text-[#487799] shrink-0">
              <Heart size={24} className="text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-black font-serif">【別枠】サイト安全維持のためのサポーター寄付金</h3>
              <p className="text-[10px] text-neutral-500 font-sans">温かい想い出の交差点を、広告なしで末永く守り続けるための任意の応援プログラム</p>
            </div>
          </div>
          <div className="inline-flex self-start sm:self-auto px-3 py-1 bg-[#487799]/10 text-[#487799] text-xs font-bold rounded-full font-serif">
            任意 / 1口 300円〜
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 font-sans">
          <div className="md:col-span-3 space-y-3 text-xs text-neutral-700 leading-relaxed font-sans">
            <p>
              ReMEETsは、目障りなバナー広告や、異性紹介事業のような「不健全なポイント誘導」を完全に排除し、<strong>「純粋で温かい思い出の再会」</strong>に特化した安全なコミュニケーションプラットフォームです。
            </p>
            <p>
              すべてのボトル監視、不審者やストーカーのアラート隔離、公的な法務適合を維持するために、高価な「AIによるセマンティック安全検閲エンジン（Gemini）」や「高度なセキュリティ暗号サーバー」を24時間ノンストップで稼働させています。
            </p>
            <p className="font-bold text-[#487799]">
              もしReMEETsの理念に共感いただき、「このサービスが続いてほしい」「大切な思い出の場を守りたい」と願っていただける場合は、任意の寄付サポーターとしての温かいご支援をお願いしています。
            </p>
          </div>

          <div className="md:col-span-2 bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-[#487799]/20 space-y-4 font-sans">
            <h4 className="font-bold text-xs text-[#487799] flex items-center gap-1.5 font-serif">
              <Sparkles size={14} className="text-amber-500" />
              <span>サポーター様へのささやかなお礼（特典）</span>
            </h4>
            <ul className="text-[11px] text-neutral-600 space-y-2.5 font-sans">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">🎖️</span>
                <span>
                  <strong>サポーターバッジの付与</strong>
                  <span className="block text-[10px] text-neutral-500 mt-0.5 font-sans">プロフィールや投函ボトルに「温かい支援者」を示す特別なエンブレムが表示されます。</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">🌸</span>
                <span>
                  <strong>特製思い出ボトルの解放</strong>
                  <span className="block text-[10px] text-neutral-500 mt-0.5 font-sans">ボトル投函時、情緒ある美しい「桜」「さざ波」などの限定ボトル外観が選べるようになります。</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#487799]/5 border border-[#487799]/10 p-4 rounded-2xl text-xs text-[#334e63] font-sans">
          <strong>サポーター寄付の仕組み：</strong>
          寄付金はマイページの「サポーター応援窓口」より、クレジットカードを通じて安全にいつでもお支払いいただけます。寄付は完全な任意であり、寄付を行わない場合でも、基本的なサービス利用への差別や制限は一切ございません。
        </div>
      </section>

      {/* Breakdown Transparency Section */}
      <section className="space-y-4 bg-neutral-50 p-6 md:p-8 rounded-3xl border border-neutral-200/60 font-sans">
        <h3 className="text-base font-serif font-bold text-black flex items-center gap-2 font-serif">
          <Coins size={18} className="text-[#487799]" />
          <span>開通時の手数料（600円）が安全維持に充てられる仕組み（透明な価格内訳）</span>
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
          ReMEETsの最大の特徴は「安全の担保」です。
          一般的な無料SNSとは異なり、メッセージ開通時の600円は、不審者やいたずらの多重登録を技術的に防ぐための外部認証機関やセキュリティシステムの実費にすべて充当されています。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-sans">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-center space-y-1 shadow-xs">
            <span className="text-neutral-400 text-[11px] font-bold block font-sans">1. eKYC身元検証実費</span>
            <span className="text-sm font-bold font-mono text-neutral-800">約 150 〜 250 円</span>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans">
              専門eKYC機関によるAI画像認識および目視ダブル監査 of API従量料金（チャット開通時のみ発生）
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-center space-y-1 shadow-xs">
            <span className="text-neutral-400 text-[11px] font-bold block font-sans">2. 安全通信 ＆ 決済手数料</span>
            <span className="text-sm font-bold font-mono text-neutral-800 font-mono">約 30 〜 40 円</span>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans">
              認証SMS（Twilio等）の送信通信料、およびStripe等のセキュア決済基本手数料
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-center space-y-1 shadow-xs">
            <span className="text-neutral-400 text-[11px] font-bold block font-sans">3. セキュリティ監査 ＆ AI監視</span>
            <span className="text-sm font-bold font-mono text-neutral-800 font-mono">約 310 〜 420 円</span>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans">
              Gemini API安全モデレーション（悪質勧誘、ストーカー予防）のリアルタイム文脈監視費
            </p>
          </div>
        </div>
      </section>

      {/* Refund Policy Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center font-sans">
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-neutral-900 flex items-center gap-2 font-serif">
            <RefreshCw size={20} className="text-emerald-600" />
            <span>安心の「全額自動返金」システム</span>
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed font-sans">
            「お金を払ったのに、本人確認審査に落ちてしまったり、相手とマッチングしなかったら損をしてしまうのでは？」という心配は一切不要です。
          </p>
          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-emerald-900 space-y-2 text-xs font-sans">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800 font-sans">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>不合格時・未成立時の仮売上即時自動取消フロー</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed font-sans">
              ReMEETsでは決済ボタンを押した段階では「仮売上（オーソリ）」としてStripeに登録されます。eKYC審査に不合格となった場合、またはマッチング確認が不成立となった場合には、システム側から即座に決済取消（全額自動返金）が実行されます。
            </p>
          </div>
        </div>

        <div className="bg-rose-50/5 border border-rose-200 p-6 rounded-3xl space-y-4 font-sans">
          <h4 className="font-serif font-bold text-xs text-rose-800 flex items-center gap-1.5 font-serif">
            <HelpCircle size={15} />
            <span>よくあるご質問（手数料・寄付関連）</span>
          </h4>
          <div className="space-y-3 font-sans text-xs">
            <div>
              <span className="font-bold text-rose-950 block font-sans">Q. 支払い後の追加費用や自動更新はありますか？</span>
              <span className="text-neutral-600 mt-0.5 block leading-relaxed font-sans">
                いいえ、一切ありません。月額の定額費用などは一切なく、お相手とのチャットルームを開通した時の1回きりの買い切り手数料（600円）のみです。
              </span>
            </div>
            <div>
              <span className="font-bold text-[#112435] block font-sans">Q. SNS連携ログイン（LINE/Google）と決済は連動しますか？</span>
              <span className="text-neutral-600 mt-0.5 block leading-relaxed font-sans">
                はい。お客様のLINEやGoogle等のSNSログイン識別情報とStripeの決済番号はシステム内で厳重に暗号リンクされ一元管理されます。
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);"""

# Read with binary-mode decoding error safety
with open("src/App.tsx", "rb") as f:
    content_bytes = f.read()

content_str = content_bytes.decode("utf-8", errors="replace")
lines = content_str.splitlines(keepends=True)

start_idx = 3187
end_idx = 4491

print(f"Original length of lines: {len(lines)}")
print(f"Replacing lines {start_idx+1} to {end_idx+1}")

lines[start_idx:end_idx+1] = [new_code + "\n"]

print(f"New length of lines: {len(lines)}")

output_bytes = "".join(lines).encode("utf-8", errors="replace")

with open("src/App.tsx", "wb") as f:
    f.write(output_bytes)

print("Replacement successful.")
