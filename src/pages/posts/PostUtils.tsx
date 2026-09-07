import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp, ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, hash]);
  return null;
};

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrolledElementsRef = React.useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    const toggleVisibility = (e?: Event) => {
      const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const lenis = (window as any).lenis;
      const lenisScroll = lenis ? lenis.scroll : 0;
      const maxScroll = Math.max(winScroll, lenisScroll);

      // 1. イベント発生源が特定の内部スクロールコンテナか判定
      if (e && e.target && e.target !== document && e.target !== window) {
        const target = e.target as HTMLElement;
        if (target && target.scrollTop !== undefined) {
          const isScrollable = target.scrollHeight > target.clientHeight;
          if (isScrollable && target.scrollTop > 300) {
            scrolledElementsRef.current.add(target);
          } else if (target.scrollTop <= 150) {
            scrolledElementsRef.current.delete(target);
          }
        }
      }

      // 2. 登録済みコンテナのスクロール状態を評価
      let anyContainerScrolled = false;
      scrolledElementsRef.current.forEach(el => {
        if (el.isConnected) {
          if (el.scrollTop > 300) {
            anyContainerScrolled = true;
          } else if (el.scrollTop <= 150) {
            scrolledElementsRef.current.delete(el);
          }
        } else {
          scrolledElementsRef.current.delete(el);
        }
      });

      // 3. ヒステリシス (Hysteresis) 制御。
      // 一度表示されたら 150px 以下（かつ他コンテナも150px以下）になるまで消えないように固定。
      // これにより、iOSの慣性スクロール・バウンスによる一瞬のマイナス値や値の微細なブレによる「点滅」を完全に防止。
      setIsVisible(prev => {
        if (prev) {
          const stillScrolled = maxScroll > 150 || anyContainerScrolled || scrolledElementsRef.current.size > 0;
          return stillScrolled;
        } else {
          return maxScroll > 300 || anyContainerScrolled;
        }
      });
    };

    // キャプチャフェーズで登録することで全コンテナのスクロールを統合監視
    window.addEventListener('scroll', toggleVisibility, { capture: true, passive: true });

    // 初期状態チェック
    toggleVisibility();

    // 遅延したLenisインスタンス起動への追従
    let lenisHandler: any = null;
    let boundLenis: any = null;
    
    const bindLenis = () => {
      const lenis = (window as any).lenis;
      if (lenis && !boundLenis) {
        boundLenis = lenis;
        lenisHandler = () => toggleVisibility();
        lenis.on('scroll', lenisHandler);
        return true;
      }
      return false;
    };

    if (!bindLenis()) {
      const timeoutId = setTimeout(bindLenis, 1000);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', toggleVisibility, true);
        if (boundLenis && lenisHandler) {
          boundLenis.off('scroll', lenisHandler);
        }
      };
    }

    return () => {
      window.removeEventListener('scroll', toggleVisibility, true);
      if (boundLenis && lenisHandler) {
        boundLenis.off('scroll', lenisHandler);
      }
    };
  }, []);

  const scrollToTop = () => {
    // 1. window / Lenis のスクロールを最上部へ戻す
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // 2. スクロールを検知していたすべての内部コンテナ（管理画面のスクロール領域など）もまとめて最上部へ戻す
    scrolledElementsRef.current.forEach(el => {
      if (el && el.isConnected) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-brand-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all font-bold cursor-pointer"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// --- SEO Preview & Print Modal ---
