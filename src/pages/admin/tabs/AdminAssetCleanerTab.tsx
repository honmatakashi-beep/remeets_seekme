import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Image as ImageIcon, RefreshCw, CheckSquare, Square, 
  AlertTriangle, ShieldCheck, HardDrive, ZoomIn, X, Check, Filter
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface AssetImage {
  id: string;
  filename: string;
  dir: string;
  fullPath: string;
  ext: string;
  sizeBytes: number;
  sizeFormatted: string;
  mtime: string;
  isUsed: boolean;
  usedInFiles: string[];
  previewUrl: string;
}

export const AdminAssetCleanerTab: React.FC = () => {
  const { token } = useAuth();
  const [images, setImages] = useState<AssetImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'unused' | 'used'>('unused');
  
  // Deleting state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Lightbox Preview Modal
  const [lightboxImage, setLightboxImage] = useState<AssetImage | null>(null);

  // Summary stats
  const [stats, setStats] = useState({
    totalCount: 0,
    unusedCount: 0,
    usedCount: 0,
    totalFormatted: '0 Bytes',
    unusedFormatted: '0 Bytes'
  });

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeToken = token || localStorage.getItem('token');
      const res = await fetch('/api/admin/assets/images', {
        headers: {
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`サーバーから不正なレスポンスが返されました (HTTP ${res.status})。サーバーが再起動中か確認してください。`);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `サーバーエラー (${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        setImages(data.images);
        setStats({
          totalCount: data.totalCount,
          unusedCount: data.unusedCount,
          usedCount: data.usedCount,
          totalFormatted: data.totalFormatted,
          unusedFormatted: data.unusedFormatted
        });
        // Clear selections
        setSelectedIds(new Set());
      }
    } catch (err: any) {
      console.error("Asset fetch error:", err);
      setError(err.message || '画像の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [token]);

  // Filtered images list
  const filteredImages = images.filter(img => {
    if (filterMode === 'unused') return !img.isUsed;
    if (filterMode === 'used') return img.isUsed;
    return true;
  });

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Select all unused
  const selectAllUnused = () => {
    const unused = images.filter(i => !i.isUsed).map(i => i.id);
    setSelectedIds(new Set(unused));
    setFilterMode('unused');
  };

  // Select all currently filtered
  const selectAllFiltered = () => {
    const allFiltered = filteredImages.map(i => i.id);
    setSelectedIds(new Set(allFiltered));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Execute Deletion
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    setDeleteConfirmOpen(false);

    const targets = images
      .filter(img => selectedIds.has(img.id))
      .map(img => ({ dir: img.dir, filename: img.filename }));

    try {
      const activeToken = token || localStorage.getItem('token');
      const res = await fetch('/api/admin/assets/images/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ files: targets })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`✅ ${data.deletedCount} 件の画像（${data.reclaimedFormatted}）を正常に物理削除しました。`);
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchImages();
      } else {
        alert(data.error || '削除処理に失敗しました');
      }
    } catch (err: any) {
      alert(`削除エラー: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedImages = images.filter(img => selectedIds.has(img.id));
  const selectedBytes = selectedImages.reduce((sum, img) => sum + img.sizeBytes, 0);
  const selectedFormatted = (selectedBytes / (1024 * 1024)).toFixed(1) + ' MB';

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <HardDrive size={14} />
              <span>Asset Cleaner & Media Storage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              画像アセット管理 ＆ 選択クリーンアップ
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              サイト内に保存されているすべての画像データをプレビュー確認し、コード内で使われていない不要な試作イラストや旧デザイン画像をワンクリックで安全に物理削除できます。
            </p>
          </div>

          <button
            onClick={fetchImages}
            disabled={loading}
            className="self-start md:self-center px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>最新状態に更新</span>
          </button>
        </div>

        {/* Storage Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">全保存画像</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-white">{stats.totalCount} <span className="text-xs font-normal text-slate-400 font-sans">枚</span></div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">容量: {stats.totalFormatted}</span>
          </div>

          <div className="bg-rose-500/10 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20">
            <span className="text-[11px] text-rose-300 font-bold block mb-1">🗑️ 未使用（削除推奨）</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-rose-400">{stats.unusedCount} <span className="text-xs font-normal text-rose-300/70 font-sans">枚</span></div>
            <span className="text-[10px] text-rose-300/80 font-mono mt-0.5 block">削減可能: {stats.unusedFormatted}</span>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 font-bold block mb-1">✅ 稼働中（使用中）</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-400">{stats.usedCount} <span className="text-xs font-normal text-emerald-300/70 font-sans">枚</span></div>
            <span className="text-[10px] text-emerald-300/80 font-mono mt-0.5 block">サイト上で表示中</span>
          </div>

          <div className="bg-indigo-500/10 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/20">
            <span className="text-[11px] text-indigo-300 font-bold block mb-1">現在選択中</span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-indigo-300">{selectedIds.size} <span className="text-xs font-normal text-indigo-300/70 font-sans">枚</span></div>
            <span className="text-[10px] text-indigo-300/80 font-mono mt-0.5 block">対象サイズ: {selectedFormatted}</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 text-sm font-bold flex items-center gap-3 shadow-md"
          >
            <Check className="text-emerald-600 shrink-0" size={20} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterMode('unused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'unused'
                ? "bg-white text-rose-700 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🗑️ 未使用のみ</span>
            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px]">
              {stats.unusedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('used')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'used'
                ? "bg-white text-emerald-700 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>✅ 使用中のみ</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full text-[10px]">
              {stats.usedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'all'
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>すべて</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {stats.totalCount}
            </span>
          </button>
        </div>

        {/* Selection & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.unusedCount > 0 && (
            <button
              onClick={selectAllUnused}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <CheckSquare size={14} />
              <span>未使用画像を全選択 ({stats.unusedCount})</span>
            </button>
          )}

          <button
            onClick={selectAllFiltered}
            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            表示中を全選択
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={deselectAll}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              選択解除
            </button>
          )}

          {/* Delete Trigger Button */}
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={selectedIds.size === 0 || isDeleting}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
              selectedIds.size > 0
                ? "bg-rose-600 hover:bg-rose-700 active:scale-95 text-white animate-pulse"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Trash2 size={15} />
            <span>選択した {selectedIds.size} 件を削除</span>
          </button>
        </div>
      </div>

      {/* Image Gallery Grid */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="animate-spin text-indigo-600 mx-auto" size={32} />
          <p className="text-sm text-slate-500 font-bold">画像アセットをスキャンしています...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 space-y-2">
          <AlertTriangle className="mx-auto text-rose-600" size={32} />
          <p className="font-bold text-sm">{error}</p>
          <button onClick={fetchImages} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">再試行</button>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <ImageIcon className="text-slate-300 mx-auto" size={48} />
          <p className="text-base font-bold text-slate-700">該当する画像はありません</p>
          <p className="text-xs text-slate-400">フィルター条件を変更するか、最新状態に更新してください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredImages.map((img) => {
            const isSelected = selectedIds.has(img.id);

            return (
              <div
                key={img.id}
                onClick={() => toggleSelect(img.id)}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden flex flex-col cursor-pointer group hover:shadow-lg relative ${
                  isSelected
                    ? "border-rose-500 ring-4 ring-rose-500/15 shadow-md scale-[1.01]"
                    : img.isUsed
                    ? "border-slate-200/90 hover:border-emerald-300"
                    : "border-slate-200/90 hover:border-rose-300"
                }`}
              >
                {/* Checkbox Top Left Overlay */}
                <div className="absolute top-3 left-3 z-20">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-md ${
                      isSelected
                        ? "bg-rose-600 text-white"
                        : "bg-white/90 backdrop-blur-sm text-slate-400 hover:text-slate-700 border border-slate-300"
                    }`}
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                </div>

                {/* Status Badge Top Right Overlay */}
                <div className="absolute top-3 right-3 z-20">
                  {img.isUsed ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur-sm text-white shadow-md flex items-center gap-1">
                      <ShieldCheck size={11} />
                      <span>使用中</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/90 backdrop-blur-sm text-white shadow-md flex items-center gap-1">
                      <Trash2 size={11} />
                      <span>未使用・削除可</span>
                    </span>
                  )}
                </div>

                {/* Image Preview Container */}
                <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden group">
                  <img
                    src={img.previewUrl}
                    alt={img.filename}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(img);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    title="拡大プレビュー"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>

                {/* Image Details Bottom Card */}
                <div className="p-3.5 flex-1 flex flex-col justify-between bg-white text-left space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={img.filename}>
                      {img.filename}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
                      <span>{img.dir}</span>
                      <span className="font-bold text-slate-700">{img.sizeFormatted}</span>
                    </div>
                  </div>

                  {/* Usage detail */}
                  <div className="pt-2 border-t border-slate-100 text-[10px]">
                    {img.isUsed ? (
                      <div className="space-y-0.5">
                        <span className="text-emerald-700 font-bold block">参照ファイル ({img.usedInFiles.length}件):</span>
                        <div className="text-slate-500 line-clamp-2 font-mono">
                          {img.usedInFiles.map(f => f.replace(/^src\//, '')).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-rose-600 font-medium block">
                        ※どこからも参照されていません（安全に削除可能）
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-rose-200 text-left space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    選択した {selectedIds.size} 件の画像を削除しますか？
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    削除されたファイルはサーバー上から物理的に消去され、元に戻すことはできません。
                  </p>
                </div>
              </div>

              {/* Selected items breakdown */}
              <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>削除対象の画像数:</span>
                  <span className="text-rose-600">{selectedIds.size} 枚</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>解放されるディスク容量:</span>
                  <span className="text-rose-600">{selectedFormatted}</span>
                </div>

                {selectedImages.some(i => i.isUsed) && (
                  <div className="p-2.5 bg-amber-100/80 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2 mt-2">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>⚠️ 選択した画像の中に【使用中】の画像が含まれています。削除するとサイト上の表示が破損する可能性があります。</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isDeleting ? <RefreshCw className="animate-spin" size={14} /> : <Trash2 size={14} />}
                  <span>完全に削除する</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[13000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            >
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white">
                <div>
                  <h4 className="text-sm font-bold truncate max-w-md">{lightboxImage.filename}</h4>
                  <p className="text-xs text-slate-400 font-mono">{lightboxImage.dir} • {lightboxImage.sizeFormatted}</p>
                </div>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 flex items-center justify-center bg-black/50 overflow-auto max-h-[70vh]">
                <img
                  src={lightboxImage.previewUrl}
                  alt={lightboxImage.filename}
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {lightboxImage.isUsed ? (
                    <span className="text-emerald-400 font-bold">✅ サイト内で使用中</span>
                  ) : (
                    <span className="text-rose-400 font-bold">🗑️ 未使用（削除可能）</span>
                  )}
                </span>
                <button
                  onClick={() => {
                    toggleSelect(lightboxImage.id);
                    setLightboxImage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    selectedIds.has(lightboxImage.id)
                      ? "bg-slate-700 text-slate-200"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {selectedIds.has(lightboxImage.id) ? "選択を解除" : "削除対象に選択"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
