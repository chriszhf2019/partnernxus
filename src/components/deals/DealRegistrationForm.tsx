import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, ArrowLeft, Send, Search, X, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useConfig } from '../../contexts/ConfigContext';
import { partnerService } from '../../services/partner-service';
import { dealService } from '../../services/deal-service';
import type { Partner } from '../../types';
import { Button } from '../ui/Button';

// Pinyin initial map for common Chinese surnames/characters
const PINYIN: Record<string, string> = {
  '北':'bj','京':'jj','上':'sh','海':'hh','广':'gz','州':'zz','深':'sz','圳':'zz','杭':'hz','苏':'sz',
  '天':'tj','津':'tj','重':'cq','庆':'cq','成':'cd','都':'dd','武':'wh','汉':'wh','南':'nj',
  '西':'xa','安':'xa','郑':'zz','长':'cc','沙':'cs','沈':'sy','阳':'yy','大':'dl','连':'dl','青':'qd',
  '厦':'xm','门':'xm','福':'fz','宁':'nb','波':'nb','合':'hf','肥':'hf','济':'jn','昆':'km',
  '明':'km','贵':'gy','兰':'lz','银':'yc','川':'sc','哈':'heb','尔':'heb','滨':'heb',
  '网':'wl','联':'ll','信':'xx','通':'tt','科':'kj','技':'jj','有':'yx','限':'xx','公':'gs','司':'ss',
  '华':'hh','为':'hw','恒':'hs','硕':'ss','鑫':'xd','众':'zz','达':'dd','御':'yq','乾':'qq','智':'zq',
  '能':'nn','仑':'ll','精':'jc','诚':'cc','新':'xy','研':'yy','云':'yy','从':'cw','威':'ww',
  '流':'ll','软':'rr','件':'jj','贸':'mm','易':'yy','微':'ww','息':'xx',
};

function pinyinInitials(name: string): string {
  let result = '';
  for (const char of name) {
    result += PINYIN[char] || char.toLowerCase();
  }
  return result;
}

function matchPartner(name: string, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  // Direct Chinese character match
  if (name.includes(query)) return true;
  // Pinyin initials match
  if (pinyinInitials(name).includes(q)) return true;
  // Each character's pinyin first letter
  const initials = [...name].map(c => PINYIN[c]?.[0] || '').join('');
  if (initials.includes(q)) return true;
  return false;
}

export const DealRegistrationForm = () => {
  const { t } = useLanguage();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [showPartnerList, setShowPartnerList] = useState(false);
  const [formData, setFormData] = useState({
    partnerId: '', partnerName: '', customerId: '', customerName: '', customerIndustry: '', projectTitle: '',
    dealValue: '', closeDate: '', description: '',
    region: '华东', salesStage: config.salesStages[0] || '', salesName: '', salesTeam: '',
  });
  const [products, setProducts] = useState<{ name: string; qty: number }[]>([]);

  useEffect(() => {
    partnerService.list().then(r => setPartners(r.items || [])).catch(() => {});
  }, []);

  const update = (f: string, v: string) => setFormData(p => ({ ...p, [f]: v }));

  const filteredPartners = partnerSearch
    ? partners.filter(p => matchPartner(p.name, partnerSearch))
    : partners.slice(0, 20);
  const nextStep = () => setStep(Math.min(step + 1, 3));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handlePartnerSelect = (id: string) => {
    const p = partners.find(x => x.id === id);
    setFormData(prev => ({
      ...prev, partnerId: id,
      partnerName: p?.name || '',
      region: p?.region || prev.region,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerId || !formData.customerName || !formData.projectTitle || !formData.dealValue) {
      setError('请填写所有必填项（合作伙伴、客户、项目名称、金额）');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const productSummary = products.length > 0 ? products.map(p => `${p.name}×${p.qty}`).join('; ') : '';
      await dealService.create({
        partnerId: formData.partnerId,
        partnerName: formData.partnerName,
        partnerType: partners.find(p => p.id === formData.partnerId)?.type || 'Reseller',
        title: formData.projectTitle,
        customerId: formData.customerId || '',
        customerName: formData.customerName,
        customerIndustry: formData.customerIndustry || '',
        value: Number(formData.dealValue),
        region: formData.region,
        productType: productSummary,
        salesName: formData.salesName,
        salesTeam: formData.salesTeam,
        description: formData.description || `阶段: ${formData.salesStage}${productSummary ? ' | 产品: ' + productSummary : ''}`,
        expectedCloseDate: formData.closeDate,
        stage: 'Registered',
        status: 'Pending',
        createdDate: new Date().toISOString().split('T')[0],
        lastActivityDate: new Date().toISOString().split('T')[0],
        lifecycle: [{ stage: 'Registered', date: new Date().toISOString().split('T')[0], description: '合作伙伴提交报备', actor: formData.salesName || '系统' }],
      });
      setStep(4); // success
    } catch (err: any) {
      setError(`提交失败: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('deals.success')}</h2>
        <p className="text-neutral-500 max-w-md mx-auto">{t('deals.successDesc')}</p>
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="secondary" onClick={() => navigate('/deals')}>返回商机列表</Button>
          <Button variant="brand" onClick={() => { setStep(1); setProducts([]); setFormData({ partnerId:'',partnerName:'',customerId:'',customerName:'',customerIndustry:'',projectTitle:'',dealValue:'',closeDate:'',description:'',salesStage:config.salesStages[0]||'',region:'华东',salesName:'',salesTeam:''}); }}>继续报备</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between px-2">
          {[1,2,3].map((s, idx) => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all',
                step === s ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md scale-110' :
                step > s ? 'bg-emerald-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400')}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className={cn('text-xs font-semibold uppercase tracking-wider hidden sm:block', step >= s ? 'text-neutral-900 dark:text-white' : 'text-neutral-400')}>
                {t(`deals.step${s}`)}
              </span>
              {idx < 2 && <div className={cn('h-0.5 flex-1 mx-4 rounded-full', step > s ? 'bg-emerald-500' : 'bg-neutral-100 dark:bg-neutral-800')} />}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2 relative">
                    <label className="text-xs font-semibold text-neutral-500">合作伙伴 <span className="text-red-500">*</span></label>
                    {formData.partnerId ? (
                      <div className="flex items-center gap-2 h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <span className="text-sm flex-1">{formData.partnerName} <span className="text-neutral-400 text-xs">({partners.find(p=>p.id===formData.partnerId)?.tier})</span></span>
                        <button onClick={() => { setFormData(p => ({...p, partnerId:'', partnerName:''})); setPartnerSearch(''); }} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input className="w-full h-10 pl-9 pr-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                            placeholder="搜索合作伙伴（输入名称/拼音首字母）"
                            value={partnerSearch} onFocus={() => setShowPartnerList(true)} onBlur={() => setTimeout(() => setShowPartnerList(false), 200)}
                            onChange={e => { setPartnerSearch(e.target.value); setShowPartnerList(true); }} />
                        </div>
                        {showPartnerList && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl">
                            {filteredPartners.length === 0 ? (
                              <p className="px-3 py-4 text-sm text-neutral-400 text-center">无匹配结果</p>
                            ) : (
                              filteredPartners.map(p => (
                                <button key={p.id} type="button"
                                  onMouseDown={() => { handlePartnerSelect(p.id); setPartnerSearch(''); setShowPartnerList(false); }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-between">
                                  <span>{p.name}</span>
                                  <span className="text-xs text-neutral-400">{p.tier} · {p.region}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">客户名称 <span className="text-red-500">*</span></label>
                    <input className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="例如：广东省人民医院" value={formData.customerName} onChange={e => update('customerName', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">项目名称 <span className="text-red-500">*</span></label>
                    <input className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="项目名称" value={formData.projectTitle} onChange={e => update('projectTitle', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">区域</label>
                    <select value={formData.region} onChange={e => update('region', e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                      {config.regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">当前阶段</label>
                    <select value={formData.salesStage} onChange={e => update('salesStage', e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                      {config.salesStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">销售负责人</label>
                    <input className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="姓名" value={formData.salesName} onChange={e => update('salesName', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">销售团队</label>
                    <input className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="例如：医疗事业部" value={formData.salesTeam} onChange={e => update('salesTeam', e.target.value)} />
                  </div>
                </div>
                {/* Product Line Items */}
                <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-500">产品清单</label>
                    <button type="button" onClick={() => setProducts([...products, { name: config.productTypes[0] || '', qty: 1 }])} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"><Plus className="w-3 h-3" />添加产品</button>
                  </div>
                  {products.length === 0 && <p className="text-xs text-neutral-400">暂未添加产品，可选填</p>}
                  {products.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={p.name} onChange={e => { const n = [...products]; n[i] = { ...n[i], name: e.target.value }; setProducts(n); }}
                        className="flex-1 h-9 px-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
                        {config.productTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                      </select>
                      <input type="number" min="1" value={p.qty} onChange={e => { const n = [...products]; n[i] = { ...n[i], qty: Number(e.target.value) || 1 }; setProducts(n); }}
                        className="w-20 h-9 px-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-center" placeholder="数量" />
                      <button type="button" onClick={() => setProducts(products.filter((_, j) => j !== i))} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">商机金额 ({config.currency}) <span className="text-red-500">*</span></label>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">{config.currency === 'USD' ? '$' : '¥'}</span>
                    <input className="w-full h-10 pl-7 pr-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10" placeholder="0.00" type="number" value={formData.dealValue} onChange={e => update('dealValue', e.target.value)} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">预计关闭日期</label>
                    <input className="w-full h-10 px-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10" type="date" value={formData.closeDate} onChange={e => update('closeDate', e.target.value)} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-500">描述</label>
                    <textarea className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none" rows={4} placeholder="简述项目范围和目标..." value={formData.description} onChange={e => update('description', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <h4 className="text-sm font-semibold mb-3">Review Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-neutral-400">Partner</span><p className="font-medium">{formData.partnerName || '-'}</p></div>
                    <div><span className="text-neutral-400">Customer</span><p className="font-medium">{formData.customerName || '-'}</p></div>
                    <div><span className="text-neutral-400">Project</span><p className="font-medium">{formData.projectTitle || '-'}</p></div>
                    <div><span className="text-neutral-400">Value</span><p className="font-medium">{config.currency === 'USD' ? '$' : '¥'}{formData.dealValue || '0'}</p></div>
                    <div><span className="text-neutral-400">Region</span><p className="font-medium">{formData.region}</p></div>
                    <div><span className="text-neutral-400">Stage</span><p className="font-medium">{formData.salesStage}</p></div>
                    {products.length > 0 && (
                      <div className="col-span-2"><span className="text-neutral-400">Products</span><p className="font-medium">{products.map(p => `${p.name}×${p.qty}`).join(', ')}</p></div>
                    )}
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-1 px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('deals.prev')}
                </button>
              ) : <div />}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                  {t('deals.next')} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                  {submitting ? '提交中...' : t('deals.submit')} <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tips Sidebar */}
      <div className="col-span-12 lg:col-span-4">
        <div className="p-6 bg-neutral-900 dark:bg-neutral-800 rounded-2xl text-white">
          <h3 className="text-sm font-semibold mb-4">报备提示</h3>
          <div className="space-y-4 text-sm">
            <p className="text-neutral-400">1. 确保<strong className="text-white">客户名称</strong>与工商注册一致。</p>
            <p className="text-neutral-400">2. 选择正确的<strong className="text-white">合作伙伴</strong>，关联后将自动填充区域。</p>
            <p className="text-neutral-400">3. 商机金额以人民币(¥)为单位。</p>
            <p className="text-neutral-400">4. 提交后渠道经理将在 48 小时内审核。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
