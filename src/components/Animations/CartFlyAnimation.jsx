import React, { useEffect, useState } from 'react';
import './CartFlyAnimation.css';

/**
 * 加入购物车飞行动画组件
 * 物品从起始位置飞到购物车
 * @param {string} item - 显示的物品emoji
 * @param {Object} startPos - 起始位置 {x, y}
 * @param {Object} endPos - 结束位置 {x, y}
 * @param {string} style - 动画样式: bounce, slide, parabola
 * @param {function} onComplete - 动画完成回调
 */
function CartFlyAnimation({ item = '🦫', startPos, endPos, style = 'bounce', onComplete }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!startPos || !endPos) return;
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [startPos, endPos, onComplete]);

  if (!isAnimating || !startPos || !endPos) return null;

  const deltaX = endPos.x - startPos.x;
  const deltaY = endPos.y - startPos.y;

  const getAnimationClass = () => {
    switch (style) {
      case 'bounce':
        return 'fly-bounce';
      case 'slide':
        return 'fly-slide';
      case 'parabola':
        return 'fly-parabola';
      default:
        return 'fly-bounce';
    }
  };

  return (
    <div
      className={`cart-fly-item ${getAnimationClass()}`}
      style={{
        '--start-x': `${startPos.x}px`,
        '--start-y': `${startPos.y}px`,
        '--delta-x': `${deltaX}px`,
        '--delta-y': `${deltaY}px`,
        left: startPos.x,
        top: startPos.y,
      }}
    >
      {item}
    </div>
  );
}

export default CartFlyAnimation;
