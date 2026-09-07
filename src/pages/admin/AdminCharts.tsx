import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { cn, PREFECTURES } from "../../lib/utils";

export const RegionalMatrix = ({ data }: { data: any[] }) => {
  // Mapping of prefectures to regions
  const regionMapping: { [key: string]: string } = {
    '北海道': 'hokkaido',
    '青森県': 'tohoku', '岩手県': 'tohoku', '宮城県': 'tohoku', '秋田県': 'tohoku', '山形県': 'tohoku', '福島県': 'tohoku',
    '茨城県': 'kanto', '栃木県': 'kanto', '群馬県': 'kanto', '埼玉県': 'kanto', '千葉県': 'kanto', '東京都': 'kanto', '神奈川県': 'kanto',
    '新潟県': 'chubu', '富山県': 'chubu', '石川県': 'chubu', '福井県': 'chubu', '山梨県': 'chubu', '長野県': 'chubu', '岐阜県': 'chubu', '静岡県': 'chubu', '愛知県': 'chubu',
    '三重県': 'kansai', '滋賀県': 'kansai', '京都府': 'kansai', '大阪府': 'kansai', '兵庫県': 'kansai', '奈良県': 'kansai', '和歌山県': 'kansai',
    '鳥取県': 'chugoku', '島根県': 'chugoku', '岡山県': 'chugoku', '広島県': 'chugoku', '山口県': 'chugoku',
    '徳島県': 'shikoku', '香川県': 'shikoku', '愛媛県': 'shikoku', '高知県': 'shikoku',
    '福岡県': 'kyushu', '佐賀県': 'kyushu', '長崎県': 'kyushu', '熊本県': 'kyushu', '大分県': 'kyushu', '宮崎県': 'kyushu', '鹿児島県': 'kyushu',
    '沖縄県': 'okinawa'
  };

  const regions = [
    { id: 'hokkaido', name: '北海道' },
    { id: 'tohoku', name: '東北' },
    { id: 'kanto', name: '関東' },
    { id: 'chubu', name: '中部' },
    { id: 'kansai', name: '関西' },
    { id: 'chugoku', name: '中国' },
    { id: 'shikoku', name: '四国' },
    { id: 'kyushu', name: '九州' },
    { id: 'okinawa', name: '沖縄' },
  ];

  const getRegionCount = (regionId: string) => {
    const safeData = Array.isArray(data) ? data : [];
    if (safeData.length === 0) return 0;
    let total = 0;
    safeData.forEach(d => {
      if (!d.region) return;
      
      let found = false;
      Object.keys(regionMapping).forEach(pref => {
        const prefShort = pref.replace(/[都府県]$/, '');
        const regionShort = d.region.replace(/[都府県]$/, '');
        
        if ((d.region.includes(pref) || pref.includes(d.region) || 
             regionShort.includes(prefShort) || prefShort.includes(regionShort)) && 
            regionMapping[pref] === regionId) {
          found = true;
        }
      });
      
      if (found) {
        total += d.count;
        return;
      }

      const regionLower = d.region.toLowerCase();
      if (regionLower.includes(regionId) || 
          (regionId === 'hokkaido' && d.region === '北海道') ||
          (regionId === 'tohoku' && d.region === '東北') ||
          (regionId === 'kanto' && d.region === '関東') ||
          (regionId === 'chubu' && d.region === '中部') ||
          (regionId === 'kansai' && d.region === '関西') ||
          (regionId === 'chugoku' && d.region === '中国') ||
          (regionId === 'shikoku' && d.region === '四国') ||
          (regionId === 'kyushu' && d.region === '九州') ||
          (regionId === 'okinawa' && d.region === '沖縄')) {
        total += d.count;
      }
    });
    return total;
  };

  const regionCounts = regions.map(r => ({ ...r, count: getRegionCount(r.id) }));
  const maxCount = Math.max(...regionCounts.map(r => r.count), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {regionCounts.map(r => {
        const intensity = r.count / maxCount;
        return (
          <div 
            key={r.id}
            className="p-4 rounded-2xl border border-brand-border flex flex-col items-center justify-center text-center transition-all hover:shadow-md"
            style={{ 
              backgroundColor: r.count > 0 ? `rgba(0, 77, 64, ${0.05 + intensity * 0.2})` : 'transparent',
              borderColor: r.count > 0 ? `rgba(0, 77, 64, ${0.1 + intensity * 0.3})` : ''
            }}
          >
            <span className="text-xs font-bold text-brand-dark/60 uppercase tracking-widest mb-1">{r.name}</span>
            <span className="text-2xl font-serif font-bold text-brand-dark">{r.count.toLocaleString()}</span>
            <span className="text-[10px] text-brand-dark/40 uppercase tracking-tighter mt-1">Activities</span>
          </div>
        );
      })}
    </div>
  );
};

export const FunnelChart = ({ data }: { data: any[] }) => {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 font-sans text-xs">ファネルデータがありません</div>;
  }

  return (
    <div className="space-y-6">
      {safeData.map((item, idx) => {
        const prevCount = idx > 0 ? safeData[idx-1]?.count || 1 : item.count || 1;
        const dropRate = idx > 0 ? ((1 - (item.count || 0) / prevCount) * 100).toFixed(1) : 0;
        const width = safeData[0]?.count ? Math.min(100, Math.max(0, ((item.count || 0) / safeData[0].count) * 100)) : 0;

        return (
          <div key={item.step} className="space-y-2">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">{item.step}</span>
                <div className="text-lg font-serif text-brand-dark">{item.count.toLocaleString()} <span className="text-xs font-serif text-brand-dark/50">件</span></div>
              </div>
              {idx > 0 && (
                <div className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  -{dropRate}% 離脱
                </div>
              )}
            </div>
            <div className="h-4 bg-brand-light/50 rounded-full overflow-hidden border border-brand-border/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="h-full bg-brand-primary rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              </motion.div>
            </div>
            <p className="text-[10px] text-brand-dark/60">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export const HeatmapChart = ({ data }: { data: any[] }) => {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length === 0) return <div className="h-64 flex items-center justify-center text-brand-dark/30 font-sans text-xs">アクセスログを集計中...</div>;
  
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Pre-process data into a 2D array
  const matrix = days.map((_, dIdx) => {
    return hours.map(hour => {
      const item = safeData.find(d => {
        const dDay = parseInt(d.day_of_week);
        const dHour = parseInt(d.hour_of_day);
        return dDay === dIdx && dHour === hour;
      });
      return item ? item.count : 0;
    });
  });

  const allCounts = matrix.flat();
  const maxCount = Math.max(...allCounts, 1);
  
  // Calculate totals
  const dayTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const hourTotals = hours.map(h => matrix.reduce((acc, row) => acc + row[h], 0));
  const grandTotal = dayTotals.reduce((a, b) => a + b, 0);

  if (grandTotal === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-brand-dark/30 border-2 border-dashed border-brand-border rounded-[32px] bg-brand-light/10">
      <Activity size={48} className="mb-4 opacity-20" />
      <p className="font-serif text-lg">直近30日間のアクティビティデータがありません</p>
      <p className="text-[10px] mt-2 uppercase tracking-[0.2em] opacity-40">No access logs recorded in JST</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Timezone: JST (UTC+9)</span>
          </div>
          <div className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} />
            Total Activity: {grandTotal.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <div className="min-w-[800px] p-1">
          <table className="w-full border-separate border-spacing-[1px] table-fixed">
            <thead>
              <tr>
                <th className="w-20 text-[11px] text-brand-dark/40 font-bold text-right pr-4 pb-4 uppercase tracking-tighter">Day</th>
                {hours.map(h => (
                  <th key={h} className="text-[10px] text-brand-dark/40 font-mono font-bold text-center pb-4">
                    {h.toString().padStart(2, '0')}
                  </th>
                ))}
                <th className="w-20 text-[11px] text-brand-dark/40 font-bold text-center pb-4 uppercase tracking-tighter">Total</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, dIdx) => (
                <tr key={dIdx}>
                  <td className="text-[12px] text-brand-dark/80 font-bold text-right pr-4 h-9 align-middle bg-brand-light/40 rounded-l-xl border-l border-y border-brand-border/30">
                    {days[dIdx]}曜日
                  </td>
                  {row.map((count, hIdx) => {
                    // Optimized square-root scale intensity for gorgeous visibility
                    const intensity = count > 0 ? 0.15 + (Math.sqrt(count) / Math.sqrt(maxCount)) * 0.85 : 0;
                    
                    let bgColor = 'rgba(93, 167, 177, 0.03)';
                    if (count > 0) {
                      bgColor = `rgba(93, 167, 177, ${intensity})`;
                    }

                    return (
                      <td key={hIdx} className="p-0">
                        <div 
                          className="h-9 rounded-md transition-all hover:scale-[1.1] hover:z-10 hover:shadow-xl group relative cursor-help border border-black/[0.04] flex items-center justify-center m-[1px]"
                          style={{ backgroundColor: bgColor }}
                        >
                          {count > 0 && (
                            <span className={`text-[8px] font-bold ${intensity > 0.65 ? 'text-white' : 'text-brand-dark/65'}`}>
                              {count > 99 ? '99+' : count}
                            </span>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-5 py-4 bg-brand-dark text-white text-[13px] rounded-[24px] opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-2xl whitespace-nowrap border border-white/10 transition-all transform translate-y-3 group-hover:translate-y-0 backdrop-blur-md">
                            <div className="font-bold border-b border-white/10 pb-2 mb-2 flex justify-between items-center gap-8">
                              <span className="text-brand-accent text-base">{days[dIdx]}曜日 {hIdx}:00</span>
                              <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">JST</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="opacity-60">アクセス数:</span>
                              <span className="text-brand-accent font-bold text-lg">{count.toLocaleString()} <span className="text-[11px] opacity-60 font-normal">PV</span></span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center align-middle pl-1">
                    <div className="text-[12px] font-mono font-bold text-brand-dark bg-brand-light/70 h-9 flex items-center justify-center rounded-r-xl border-r border-y border-brand-border/40 shadow-sm">
                      {dayTotals[dIdx].toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Footer: Hour Totals */}
              <tr>
                <td className="text-[11px] text-brand-dark/40 font-bold text-right pr-4 pt-6 uppercase tracking-tighter">Hourly</td>
                {hourTotals.map((total, hIdx) => (
                  <td key={hIdx} className="pt-6">
                    <div className="text-[10px] font-mono font-bold text-brand-dark/40 text-center">
                      {total > 999 ? `${(total/1000).toFixed(1)}k` : total}
                    </div>
                  </td>
                ))}
                <td className="pt-6 text-center">
                  <div className="text-[11px] font-mono font-bold text-brand-primary">
                    {grandTotal > 999 ? `${(grandTotal/1000).toFixed(1)}k` : grandTotal}
                  </div>
                </td>
              </tr>
            </tbody>
            </table>
          </div>
        </div>
      
      <div className="flex items-center justify-end gap-4 px-2">
        <div className="flex items-center gap-3 text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">
          <span>少ない</span>
          <div className="flex gap-1.5">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((lvl, i) => (
              <div 
                key={i} 
                className="w-5 h-5 rounded-md border border-black/[0.05]" 
                style={{ backgroundColor: lvl === 0 ? 'rgba(93, 167, 177, 0.03)' : `rgba(93, 167, 177, ${0.15 + lvl * 0.85})` }}
              />
            ))}
          </div>
          <span>多い</span>
        </div>
      </div>
    </div>
  );
};

// --- Admin Live System & Rate-Limit Controller Component ---


export const PageViewChart = ({ data }: { data: any[] }) => {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="path" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#666'}} 
          />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
          <Tooltip 
            cursor={{fill: 'transparent'}} 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
          />
          <Bar dataKey="count" fill="#004d40" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


