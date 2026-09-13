import PptxGenJS from "pptxgenjs";
import { POLICE_PRESENTATION_SCENARIOS, POLICE_PRESENTATION_SLIDES } from "../../pages/admin/data/policePresentationData";

  const addPptxCardDiagram = (pptx: any, pptxSlide: any, slide: any) => {
    const isDarkVisual = [3, 13, 15, 20, 21, 22].includes(slide.id);
    const bgCol = isDarkVisual ? '1A2735' : (slide.id === 30 ? 'ECFDF5' : 'FFFFFF');
    const lineCol = isDarkVisual ? '334155' : (slide.id === 30 ? '34D399' : 'E2E8F0');
    const textCol = isDarkVisual ? 'FAFAF8' : '1A2735';

    // Main Card Container (Right Column: x: 5.95, y: 1.45, w: 3.45, h: 3.65)
    pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
      x: 5.95,
      y: 1.45,
      w: 3.45,
      h: 3.65,
      fill: { color: bgCol },
      line: { color: lineCol, width: 1.2 }
    });

    // Tag labels per slide
    const tagLabels: Record<number, string> = {
      2: 'RE-MEET ARCHITECTURE',
      3: 'DRIFT CAPSULE',
      4: 'SOCIAL MISSION',
      5: 'TARGET GROUPS',
      6: 'FUNCTION: DRIFT',
      7: 'QUIZ GATE SHIELD',
      8: 'CONTACT BRIDGE',
      9: 'SOC REALTIME',
      10: 'SHADOW FILTER',
      11: 'CRYPTOGRAPHIC ENGINE',
      12: 'ZERO TRACE PRIVACY',
      13: 'SYSTEM TOPOLOGY',
      14: 'COMPARISON MATRIX',
      15: 'LEGAL & SECURITY DEEP DIVE',
      16: 'LEGAL OPINION',
      17: 'AUTHENTICATION LAW',
      18: 'IP BRUTE GUARD',
      19: 'NAME REGEX DEFENSE',
      20: 'STEALTH MASK',
      21: 'SEMANTIC AI FILTER',
      22: 'SHADOW SANDBOX',
      23: 'YOUTH PROTECTION',
      24: 'DIGITAL SIGNATURE',
      25: 'TICKET & AI DRAFT',
      26: 'PRICING & VERIFICATION',
      27: 'EKYC & STRIPE COUPLING',
      28: 'JUDICIAL ALIGNMENT',
      29: 'OPT-OUT AUDIT',
      30: 'GRAND SUMMARY'
    };

    const currentTag = tagLabels[slide.id] || `SECURITY PROTOCOL #${slide.id}`;

    // Top-right Tag Badge
    pptxSlide.addText(currentTag, {
      x: 6.0,
      y: 1.55,
      w: 3.3,
      h: 0.25,
      fontSize: 7.5,
      fontFace: 'Courier New',
      color: isDarkVisual ? '34D399' : '059669',
      bold: true,
      align: 'right'
    });

    // Detailed visual rendering per slide
    switch (slide.id) {
      case 2: // 名前の由来 (A - B 連携図)
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 6.2, y: 2.15, w: 0.65, h: 0.65, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1.5 } });
        pptxSlide.addText('A', { x: 6.2, y: 2.15, w: 0.65, h: 0.65, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: '1E293B', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addText('あなた', { x: 6.1, y: 2.85, w: 0.85, h: 0.25, fontSize: 7.5, align: 'center', color: '64748B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 6.95, y: 2.47, w: 1.45, h: 0, line: { color: '10B981', width: 2 } });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.1, y: 2.05, w: 1.15, h: 0.35, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('相互の記憶 ✦', { x: 7.1, y: 2.05, w: 1.15, h: 0.35, fontSize: 7, bold: true, color: '065F46', align: 'center', valign: 'middle', fontFace: 'Hiragino Kaku Gothic ProN' });
        pptxSlide.addText('Re-meet', { x: 7.1, y: 2.55, w: 1.15, h: 0.25, fontSize: 7, color: '64748B', align: 'center', fontFace: 'Courier New' });

        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 8.5, y: 2.15, w: 0.65, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('B', { x: 8.5, y: 2.15, w: 0.65, h: 0.65, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: '047857', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addText('懐かしい知人', { x: 8.35, y: 2.85, w: 0.95, h: 0.25, fontSize: 7.5, align: 'center', color: '047857', bold: true, fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('不特定の「出会い」を排除し、過去の知人との「再会（Re-meet）」に特化。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 3: // コンセプト (波間に漂流するカプセル)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.25, y: 2.05, w: 0.85, h: 0.85, fill: { color: '0F172A' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('✉️', { x: 7.25, y: 2.05, w: 0.85, h: 0.85, fontSize: 24, align: 'center', valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 7.9, y: 2.7, w: 0.35, h: 0.35, fill: { color: '10B981' } });
        pptxSlide.addText('16:9', { x: 7.9, y: 2.7, w: 0.35, h: 0.35, fontSize: 6.5, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle', fontFace: 'Courier New' });
        pptxSlide.addText('~ ~ ~ 海洋漂流ボトルカプセル ~ ~ ~', { x: 6.1, y: 3.05, w: 3.15, h: 0.3, fontSize: 7.5, color: '34D399', align: 'center', fontFace: 'Courier New' });
        pptxSlide.addText('投函から波間に漂流。記憶の暗号キーにより本人だけに届くボトルメール構造。', { x: 6.05, y: 3.45, w: 3.25, h: 1.3, fontSize: 8.5, align: 'center', color: 'CBD5E1', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 4: // 構築目的 (3大ソーシャルミッション)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🏠', { x: 6.1, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('孤立化防止', { x: 6.1, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '9F1239', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.2, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('👥', { x: 7.2, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('震災断絶回復', { x: 7.2, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '065F46', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.3, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 } });
        pptxSlide.addText('🏫', { x: 8.3, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('自発的隣人網', { x: 8.3, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '0369A1', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('家族・親族衰退期における、過去の恩師・同窓生とのセーフティネット再生。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 5: // ターゲットユーザー (2x2 グリッド)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🏫 学校の同窓生\n幼馴染・クラスメイト', { x: 6.15, y: 1.98, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.75, y: 1.95, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🏠 旧隣人・被災者\n転居・区画整理で断絶', { x: 7.8, y: 1.98, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.7, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('👥 元同僚・仕事仲間\n退職・異動後の再会', { x: 6.15, y: 2.73, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.75, y: 2.7, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🎖️ 恩師・指導者\n感謝を伝えたい相手', { x: 7.8, y: 2.73, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('信頼できるお相手にだけエピソードを届けたい安心なユーザーが集う空間。', { x: 6.05, y: 3.5, w: 3.25, h: 1.2, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 6: // 主要機能① (投函＆漂流フロー)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('① 国名+名前投函', { x: 6.1, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 7.02, y: 2.4, w: 0.2, h: 0, line: { color: '94A3B8', width: 1.5 } });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.24, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('② 漂流待機', { x: 7.24, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 8.16, y: 2.4, w: 0.2, h: 0, line: { color: '94A3B8', width: 1.5 } });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.38, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('③ クイズ開門', { x: 8.38, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });

        pptxSlide.addText('詳細住所不要。システム波間に漂流し、第三者から完全に遮断された空間。', { x: 6.05, y: 3.1, w: 3.25, h: 1.5, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 7: // 主要機能② (想い出クイズゲート)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.9, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('🔒 QUIZ VERIFICATION GATE', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '34D399', bold: true });
        pptxSlide.addText('二人だけの共有記憶に全問正答で開門', { x: 6.25, y: 2.35, w: 2.85, h: 0.4, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.95, w: 3.05, h: 0.45, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('✦ 表記ゆれ自動救済 (Levenshtein ≤ 2)  [ACTIVE]', { x: 6.25, y: 2.95, w: 2.85, h: 0.45, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, valign: 'middle' });

        pptxSlide.addText('共通の想い出が高精度認証キーとなり、第三者を遮断しつつ正当な再会を支援。', { x: 6.05, y: 3.6, w: 3.25, h: 1.2, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 8: // 主要機能③ (連絡先安全引き渡しモデル)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🤝 連絡先安全引き渡し（セキュア・ブリッジ）', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.3, y: 2.3, w: 2.75, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('開示連絡先: LINE ID: @sample_friend', { x: 6.35, y: 2.3, w: 2.65, h: 0.45, fontSize: 7.5, fontFace: 'Courier New', color: '047857', bold: true, valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.3, y: 2.85, w: 2.75, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🔒 連絡先安全引き渡し完結型設計で、\nトラブルや犯罪リスクをシステム構造上ゼロに。', { x: 6.35, y: 2.85, w: 2.65, h: 0.65, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', valign: 'middle' });

        pptxSlide.addText('🛡️ 緊急通報・ワンタップブロック機能常備', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 9: // 管理・運用① (セキュリティダッシュボード)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🚨', { x: 6.25, y: 2.05, w: 0.8, h: 0.5, fontSize: 18, align: 'center' });
        pptxSlide.addText('検知盾', { x: 6.25, y: 2.55, w: 0.8, h: 0.25, fontSize: 7, bold: true, color: 'E11D48', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('THREAT MONITOR', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '64748B', bold: true });
        pptxSlide.addText('不正突破：0件', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 11, fontFace: 'Hiragino Kaku Gothic ProN', color: 'E11D48', bold: true });
        pptxSlide.addText('24時間総当たり・不正通信自動監視', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('オペレーション・ダッシュボードにより不正接続を瞬時に検知・排除。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 10: // 管理・運用② (シャドウフラグ隔離)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.2, y: 2.05, w: 0.95, h: 0.75, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('悪質アクセス\nshadow: 1', { x: 6.2, y: 2.05, w: 0.95, h: 0.75, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: 'BE123C', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 7.2, y: 2.42, w: 0.95, h: 0, line: { color: '94A3B8', width: 1.5 } });
        pptxSlide.addText('⚡ 隔離', { x: 7.2, y: 2.15, w: 0.95, h: 0.25, fontSize: 7, color: 'BE123C', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.2, y: 2.05, w: 0.95, h: 0.75, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('一般ユーザー\n影響 0%', { x: 8.2, y: 2.05, w: 0.95, h: 0.75, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('つきまとい者の投稿は、本人には成功と見せかけ裏側で完全隔離。', { x: 6.05, y: 3.2, w: 3.25, h: 1.5, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 11: // 非機能① (最高レベルの暗号化)
        pptxSlide.addText('🔑 SHA-256 不可逆ストレッチ', { x: 6.1, y: 2.05, w: 3.15, h: 0.35, fontSize: 10, bold: true, color: '065F46', align: 'center', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.2, y: 2.5, w: 2.95, h: 0.45, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('salt_key_hash_5a9b8dc91e77...', { x: 6.25, y: 2.5, w: 2.85, h: 0.45, fontSize: 7.5, fontFace: 'Courier New', color: '334155', align: 'center', valign: 'middle' });
        pptxSlide.addText('想い出パスワードが平文で保存されることは一切ありません。不可逆変換により金融機関クラスの安全性を遵守。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 12: // 非機能② (即時オプトアウト)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🗑️', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 20, align: 'center', valign: 'middle' });

        pptxSlide.addText('OPT-OUT GUARANTEE', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('24時間以内物理削除の保証', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('物理サーバーからもデータを完全に消去', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('「忘れられる権利」および被探索者の断る権利を完全に保障。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 13: // システム構成 (3ブロック)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('SPA\nReact 18', { x: 6.1, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '34D399', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.2, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('Server\nExpress', { x: 7.2, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '6EE7B7', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.3, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('Security\nGemini AI', { x: 8.3, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '7DD3FC', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('サーバーサイドAPIプロキシ。APIキーはブラウザに一切露出しません。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 14: // 新奇出会いとの対比分析 (比較カード)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.65, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('一般的なマッチング ： 無差別（危険 ❌）', { x: 6.2, y: 1.95, w: 2.95, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: 'BE123C', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.75, w: 3.05, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('ReMEETs 再会モデル ： 既知限定（安全 ⭕）', { x: 6.2, y: 2.75, w: 2.95, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('見知らぬ人との出会いを完全に排除し、二者間の『強固な過去の面識・共有記憶』のみを紐解く確実な治安特化モデル。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 15: // 第2部表紙
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.25, y: 1.95, w: 0.85, h: 0.85, fill: { color: '064E3B' }, line: { color: '34D399', width: 1.5 } });
        pptxSlide.addText('🎖️', { x: 7.25, y: 1.95, w: 0.85, h: 0.85, fontSize: 22, align: 'center', valign: 'middle' });
        pptxSlide.addText('LEGAL & SECURITY DEEP DIVE', { x: 6.1, y: 2.95, w: 3.15, h: 0.25, fontSize: 8, fontFace: 'Courier New', color: '34D399', bold: true, align: 'center' });
        pptxSlide.addText('第2部：法規適合性と\n10大防衛アーキテクチャ', { x: 6.1, y: 3.3, w: 3.15, h: 0.8, fontSize: 11, fontFace: 'Hiragino Mincho ProN', color: 'FFFFFF', bold: true, align: 'center' });
        break;

      case 16: // 異性紹介事業非該当の証明
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.1, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1.2 } });
        pptxSlide.addText('✅ POLICE ADAPTATION', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '059669', bold: true });
        pptxSlide.addText('「異性紹介事業」非該当 判定', { x: 6.25, y: 2.35, w: 2.85, h: 0.35, fontSize: 11, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });
        pptxSlide.addText('警察公安・行政書面要件適合', { x: 6.25, y: 2.7, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857' });

        pptxSlide.addText('面識のない異性との交際仲介に該当せず、公安への届出手続きは完全不要。', { x: 6.05, y: 3.35, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 17: // 共有記憶認証法理
        pptxSlide.addText('🔓', { x: 6.1, y: 1.95, w: 3.15, h: 0.45, fontSize: 20, align: 'center' });
        pptxSlide.addText('既知の記憶 ＝ 暗号通信路の鍵', { x: 6.1, y: 2.45, w: 3.15, h: 0.35, fontSize: 10.5, fontFace: 'Hiragino Mincho ProN', color: '065F46', bold: true, align: 'center' });
        pptxSlide.addText('二人だけの記憶クイズが、「新規出会い」ではない事実を電子証明。無名による不当接触や変質者のアタックを起動段階で100%封殺。', { x: 6.05, y: 3.1, w: 3.25, h: 1.6, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 18: // 時間制限ロック
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.85, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('⏱️ LOCKOUT SYSTEM', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('5回連続誤答で24H完全ロック', { x: 6.25, y: 2.35, w: 2.85, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.35, y: 2.95, w: 2.65, h: 0.35, fill: { color: '0F172A' }, line: { color: 'BE123C', width: 1 } });
        pptxSlide.addText('STATUS: IP_LOCKOUT_ACTIVE', { x: 6.35, y: 2.95, w: 2.65, h: 0.35, fontSize: 7.5, fontFace: 'Courier New', color: 'FB7185', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('悪意ある回答推測（ブルートフォース）に対し、累計5回不正解答でアカウント＋IPを24時間完全ロック。', { x: 6.05, y: 3.55, w: 3.25, h: 1.2, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 19: // 常用姓名照合
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('👤', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 18, align: 'center', valign: 'middle' });

        pptxSlide.addText('フルネーム規制', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'E11D48', bold: true });
        pptxSlide.addText('「山田太郎」等の実名は警告', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('本名の直截露出から保護', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('日本の常用姓名辞書に基づき、実名・フルネーム露出トラブルを自動規制。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 20: // 連絡先ステルス
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.5, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('REGEX SCAN FILTER : BLOCKED', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7, fontFace: 'Courier New', color: 'FB7185', bold: true });
        pptxSlide.addText('LINE ID: my_id_123  → MASK_ID\nTEL: 090-1234-5678 → MASK_TEL\n\nRESULT: LINE ID: **** / TEL: ****', { x: 6.25, y: 2.35, w: 2.85, h: 1.0, fontSize: 7.5, fontFace: 'Courier New', color: '34D399' });

        pptxSlide.addText('連絡先情報の直接交換をリアルタイムに伏字(****)へ自動プログラム変換し完全無害化。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 21: // Gemini AI モデレーション
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.5, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('✨ Gemini Security Agent v2.5', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '34D399', bold: true });
        pptxSlide.addText('INPUT: "お前どこにいる？絶対探すからな"\n危険検知: 執着・脅迫性 98% [隔離]\n自動処置: 即時隔離作動', { x: 6.25, y: 2.35, w: 2.85, h: 1.0, fontSize: 7.5, fontFace: 'Courier New', color: '7DD3FC' });

        pptxSlide.addText('高度な文章理解で、心理的な付きまとい・暴力隠語をリアルタイムにセマンティック自動検知・隔離。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 22: // シャドウフィルタ
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.3, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('$ sys_shadow_scan\n$ ATTACK DETECTED !\n$ SHADOW_FLAG_ISOLATION: ON', { x: 6.25, y: 2.1, w: 2.85, h: 1.0, fontSize: 8, fontFace: 'Courier New', color: '34D399', bold: true });

        pptxSlide.addText('冷やかし・荒らしユーザーは孤立した空間に送られます。送信成功に見せかけ攻撃意欲を無音で根絶。', { x: 6.05, y: 3.5, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'CBD5E1', align: 'center' });
        break;

      case 23: // 青少年保護 (18+)
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 6.25, y: 2.1, w: 0.75, h: 0.75, fill: { color: 'FFF1F2' }, line: { color: 'F43F5E', width: 2 } });
        pptxSlide.addText('18+', { x: 6.25, y: 2.1, w: 0.75, h: 0.75, fontSize: 13, bold: true, color: 'E11D48', align: 'center', valign: 'middle', fontFace: 'Arial' });

        pptxSlide.addText('MINOR PROTECTION', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('高校生以下は完全不可', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 10, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('非行・児童虐待被害を徹底予防', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('青少年をネット犯罪被害から完璧にプロテクトする強固なコンプライアンス管理。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 24: // 電子的利用宣誓ゲート
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.4, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('🛡️ 電子的利用宣誓ゲート [PLEDGE_GATE]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });

        pptxSlide.addText('☑ 18歳以上（高校生除く）の利用であること\n☑ ストーカー・嫌がらせ・監視目的でないこと\n☑ 法令・利用ガイドライン遵守への完全合意', { x: 6.25, y: 2.25, w: 2.85, h: 0.65, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', leading: 14 });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.95, w: 2.85, h: 0.25, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('✓ AUDIT LOGGED (IP & Timestamp 永続保全)', { x: 6.25, y: 2.95, w: 2.85, h: 0.25, fontSize: 6.5, bold: true, color: '065F46', align: 'center', valign: 'middle', fontFace: 'Courier New' });

        pptxSlide.addText('連絡先開示直前の厳格な電子的利用宣誓。タイムスタンプ・接続元IPを監査保全。', { x: 6.05, y: 3.35, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });
        break;

      case 25: // チケット全履歴保全
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🎫 チケットスレッド永続化  [TICKET_DB]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '0369A1', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.25, w: 2.85, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('#REQ-1092: ユーザーからの通報・相談内容', { x: 6.3, y: 2.25, w: 2.75, h: 0.45, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '334155', valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.8, w: 2.85, h: 0.45, fill: { color: 'FAF5FF' }, line: { color: 'E9D5FF', width: 1 } });
        pptxSlide.addText('✨ Gemini AI コンプライアンス返信 [生成完了]', { x: 6.3, y: 2.8, w: 2.75, h: 0.45, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '7E22CE', valign: 'middle', bold: true });

        pptxSlide.addText('送受信全ログ完全永続化 ➔ 警察・司法証拠保全', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 26: // 明確な本人確認体系・料金分離 (無料グリーン & 600円オレンジ)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 3.15, h: 0.85, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('FREE TIER', { x: 6.2, y: 2.02, w: 1.8, h: 0.2, fontSize: 6.5, fontFace: 'Courier New', color: '047857', bold: true });
        pptxSlide.addText('年齢確認（18歳以上宣誓）', { x: 6.2, y: 2.22, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 2.15, w: 0.8, h: 0.35, fill: { color: '059669' } });
        pptxSlide.addText('無料', { x: 8.35, y: 2.15, w: 0.8, h: 0.35, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.95, w: 3.15, h: 0.85, fill: { color: 'FFF7ED' }, line: { color: 'F97316', width: 1.5 } });
        pptxSlide.addText('OFFICIAL eKYC', { x: 6.2, y: 3.02, w: 1.8, h: 0.2, fontSize: 6.5, fontFace: 'Courier New', color: 'C2410C', bold: true });
        pptxSlide.addText('公的身分証(eKYC)認証', { x: 6.2, y: 3.22, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 3.15, w: 0.8, h: 0.35, fill: { color: 'EA580C' } });
        pptxSlide.addText('600円', { x: 8.35, y: 3.15, w: 0.8, h: 0.35, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('🛡️ 明確な料金分離により消費者の誤認を防止し、法令を遵守。', { x: 6.05, y: 3.95, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 27: // eKYC・決済連携
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.65, fill: { color: 'FFF7ED' }, line: { color: 'FDBA74', width: 1 } });
        pptxSlide.addText('💳 Stripe 決済（600円仮売上）', { x: 6.25, y: 1.95, w: 2.1, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true, valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 2.1, w: 0.75, h: 0.35, fill: { color: 'FED7AA' } });
        pptxSlide.addText('仮売上確保', { x: 8.35, y: 2.1, w: 0.75, h: 0.35, fontSize: 6.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('▼', { x: 6.15, y: 2.65, w: 3.05, h: 0.25, fontSize: 8, color: '94A3B8', align: 'center' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.95, w: 3.05, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🆔 eKYC 審査（TRUSTDOCK等）', { x: 6.25, y: 2.95, w: 2.1, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 3.1, w: 0.75, h: 0.35, fill: { color: 'A7F3D0' } });
        pptxSlide.addText('自動分岐', { x: 8.35, y: 3.1, w: 0.75, h: 0.35, fontSize: 6.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('【承認】実請求＆バッジ点灯  /  【否認】即全額自動返金', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'C2410C', align: 'center', bold: true });
        break;

      case 28: // フォレンジックログ
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('📄 forensic_export.pdf  [SECURE]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', bold: true });

        pptxSlide.addText('要求番号: #REQ-2026-9912\n対象IP: 184.22.95.101\n認証合意: 一致 (VALID SIGN)', { x: 6.25, y: 2.25, w: 2.85, h: 0.7, fontSize: 7, fontFace: 'Courier New', color: '334155' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.35, y: 3.05, w: 2.65, h: 0.45, fill: { color: '1E293B' } });
        pptxSlide.addText('📥 捜査資料1キー抽出', { x: 6.35, y: 3.05, w: 2.65, h: 0.45, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('捜査事項照会書に数分で完全対応する証拠エクスポート体制。', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B', align: 'center' });
        break;

      case 29: // オプトアウト申請処理
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🛡️', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 20, align: 'center', valign: 'middle' });

        pptxSlide.addText('AUTO OPT-OUT', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '059669', bold: true });
        pptxSlide.addText('「二度と繋がらない」権利', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('全データ即時遮断', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('お相手との想い出を開門されたくない方の「再会を行わない権利」を完全に保障。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 30: // 総括
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.2, fill: { color: 'FFFFFF' }, line: { color: '34D399', width: 1.5 } });
        pptxSlide.addText('🏆', { x: 6.25, y: 2.15, w: 0.6, h: 0.7, fontSize: 22, align: 'center', valign: 'middle' });

        pptxSlide.addText('100% POLICE COMPLIANT', { x: 6.9, y: 2.1, w: 2.2, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '047857', bold: true });
        pptxSlide.addText('治安・防衛コンプライアンス適合証明', { x: 6.9, y: 2.35, w: 2.2, h: 0.5, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });

        pptxSlide.addText('警察公安、サイバー対策セクション、及び法規制の求めるあらゆる安全規範を完全に充足。', { x: 6.05, y: 3.4, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });
        break;

      default:
        break;
    }
  };

export const handleExportPptx = (slides = POLICE_PRESENTATION_SLIDES) => {
try {
      const pptx = new PptxGenJS() as any;
      pptx.layout = 'LAYOUT_16x9';

      slides.forEach((slide, index) => {
        const pptxSlide = pptx.addSlide();

        // 発表者用の口頭発表シナリオ・スライドノート(Notes)をスライドオブジェクトに埋め込む
        const scenarioText = POLICE_PRESENTATION_SCENARIOS[index];
        if (scenarioText) {
          pptxSlide.addNotes(scenarioText);
        }
        
        if (slide.layout === 'title') {
          pptxSlide.background = { fill: '1C2B3C' };
          
          pptxSlide.addText(slide.title, {
            x: 0.8,
            y: 1.5,
            w: 8.4,
            h: 2.2,
            fontSize: 26,
            fontFace: 'Hiragino Mincho ProN',
            color: 'FAFAF8',
            bold: true,
            align: 'left',
            valign: 'middle'
          });

          if (slide.subtitle) {
            pptxSlide.addText(slide.subtitle, {
              x: 0.8,
              y: 3.8,
              w: 8.4,
              h: 1.6,
              fontSize: 11,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: 'A5BFCF',
              align: 'left',
              valign: 'top'
            });
          }
        } else {
          pptxSlide.background = { fill: 'FAFAF8' };

          pptxSlide.addText(slide.category || "SECURITY AUDIT", {
            x: 0.8,
            y: 0.4,
            w: 8.4,
            h: 0.4,
            fontSize: 10,
            fontFace: 'Hiragino Kaku Gothic ProN',
            color: '7A8E9E',
            bold: true,
            align: 'left'
          });

          pptxSlide.addText(slide.title, {
            x: 0.8,
            y: 0.8,
            w: 8.4,
            h: 0.8,
            fontSize: 18,
            fontFace: 'Hiragino Mincho ProN',
            color: "1A2735",
            bold: true,
            align: "left"
          });

          // Bullet points on the left column (x: 0.6, y: 1.6, w: 5.2, h: 3.4)
          if (slide.points && slide.points.length > 0) {
            const bulletText = slide.points.map((pt: string) => "✦ " + pt).join("\n\n");
            pptxSlide.addText(bulletText, {
              x: 0.6,
              y: 1.6,
              w: 5.2,
              h: 3.4,
              fontSize: 10.5,
              fontFace: "Hiragino Kaku Gothic ProN",
              color: "2C3E50",
              align: "left",
              valign: "top"
            });
          }

          // Right visual card diagram (fully recreated from web preview)
          addPptxCardDiagram(pptx, pptxSlide, slide);
        }

        pptxSlide.addText("ReMEETs 治安・防衛コンプライアンス管理事務局", {
          x: 0.8,
          y: 5.2,
          w: 8.4,
          h: 0.3,
          fontSize: 8,
          fontFace: 'Hiragino Kaku Gothic ProN',
          color: '999999',
          align: 'left'
        });
      });

      pptx.writeFile({ fileName: '⑥ReMEETs警察・公安委員会事前相談用プレゼンテーションスライド.pptx' });
    } catch (e) {
      console.error(e);
      alert('PowerPointの生成中にエラーが発生しました。');
    }
  };

export const handleDownloadPPTX = handleExportPptx;
