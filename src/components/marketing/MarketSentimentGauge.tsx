import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Info, Zap } from 'lucide-react';

interface SentimentDriver {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
  impact: 'high' | 'medium' | 'low';
}

interface MarketSentimentGaugeProps {
  sentimentScore: number; // 0-100, 0=极度消极，50=中性，100=极度积极
  drivers: SentimentDriver[];
  title?: string;
  subtitle?: string;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  sentimentScore,
  drivers,
  title = '市场情绪分析',
  subtitle = 'AI 驱动的市场情绪洞察',
}) => {
  // 限制分数在 0-100 之间
  const score = Math.max(0, Math.min(100, sentimentScore));
  
  // 计算指针角度（-90 度到 90 度）
  const needleAngle = -90 + (score / 100) * 180;
  
  // 确定情绪等级
  const getSentimentLevel = (s: number) => {
    if (s >= 80) return { label: '极度积极', color: '#059669', bg: 'bg-emerald-500' };
    if (s >= 60) return { label: '积极', color: '#10b981', bg: 'bg-emerald-400' };
    if (s >= 40) return { label: '中性', color: '#f59e0b', bg: 'bg-amber-400' };
    if (s >= 20) return { label: '消极', color: '#ef4444', bg: 'bg-red-400' };
    return { label: '极度消极', color: '#dc2626', bg: 'bg-red-500' };
  };
  
  const sentiment = getSentimentLevel(score);
  
  // 获取驱动因素图标
  const getDriverIcon = (type: string) => {
    if (type === 'positive') return TrendingUp;
    if (type === 'negative') return TrendingDown;
    return Minus;
  };
  
  // 获取驱动因素颜色
  const getDriverColor = (type: string) => {
    if (type === 'positive') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (type === 'negative') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    return 'text-neutral-600 bg-neutral-50 dark:bg-neutral-800';
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        </div>
        <div className={cn('px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5', sentiment.bg, 'text-white')}>
          {score >= 60 ? <TrendingUp className="w-3.5 h-3.5" /> : score <= 40 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          {sentiment.label}
        </div>
      </div>

      {/* Gauge Container */}
      <div className="relative mb-6">
        <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Colored Segments */}
          <path
            d="M 20 100 A 80 80 0 0 1 60 35"
            fill="none"
            stroke="#dc2626"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 60 35 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 140 35"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 140 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#059669"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Tick Marks */}
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick, i) => {
            const angle = -90 + (tick / 100) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 70 * Math.cos(rad);
            const y1 = 100 + 70 * Math.sin(rad);
            const x2 = 100 + (i % 5 === 0 ? 80 : 75) * Math.cos(rad);
            const y2 = 100 + (i % 5 === 0 ? 80 : 75) * Math.sin(rad);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#a1a1aa"
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            );
          })}
          
          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="#18181b"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="#18181b" />
          </motion.g>
          
          {/* Score Labels */}
          <text x="20" y="115" fontSize="8" fill="#71717a" fontWeight="600">0</text>
          <text x="100" y="115" fontSize="8" fill="#71717a" fontWeight="600" textAnchor="middle">50</text>
          <text x="180" y="115" fontSize="8" fill="#71717a" fontWeight="600" textAnchor="end">100</text>
        </svg>
        
        {/* Center Score Display */}
        <div className="absolute inset-0 flex items-center justify-center pt-8">
          <div className="text-center">
            <motion.span
              key={score}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-neutral-900 dark:text-white"
            >
              {score}
            </motion.span>
            <p className="text-[10px] text-neutral-500 mt-0.5">情绪指数</p>
          </div>
        </div>
      </div>

      {/* Sentiment Drivers */}
      {drivers && drivers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">情绪驱动因素</span>
            <span className="text-xs text-neutral-400 ml-auto">AI 提取</span>
          </div>
          
          <div className="space-y-2">
            {drivers.map((driver, index) => {
              const DriverIcon = getDriverIcon(driver.type);
              const driverColor = getDriverColor(driver.type);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-all',
                    driverColor,
                    'border-transparent hover:border-neutral-200 dark:hover:border-neutral-700'
                  )}
                >
                  <div className={cn('w-6 h-6 rounded-md flex items-center justify-center shrink-0', driverColor)}>
                    <DriverIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {driver.text}
                    </p>
                    {driver.impact !== 'low' && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                          driver.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}>
                          {driver.impact === 'high' ? '高影响' : '中影响'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSentimentGauge;
