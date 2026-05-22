import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, ArrowLeft, Plus, Trash2, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RegionCascader } from '../ui/RegionCascader';
import { TIER_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS, INDUSTRY_OPTIONS } from '../../lib/partner-labels';
import { partnerService } from '../../services/partner-service';
import type { Partner, PartnerContact } from '../../types';

const emptyContact: PartnerContact = {
  firstName: '', lastName: '', title: '', department: '', phone: '', mobile: '', email: '', isPrimary: false,
};

export const PartnerFormPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', unifiedSocialCreditCode: '', type: 'Reseller' as Partner['type'],
    tier: 'Registered' as Partner['tier'], status: 'Prospective' as Partner['status'],
    startDate: new Date().toISOString().split('T')[0], industry: '金融',
    province: '', city: '', district: '', registeredAddress: '',
    cooperationScope: '', isCorePartner: false, manager: '',
    location: '', region: '', tags: [] as string[],
  });

  const [contacts, setContacts] = useState<PartnerContact[]>([{ ...emptyContact, isPrimary: true }]);

  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const addContact = () => setContacts((prev) => [...prev, { ...emptyContact }]);
  const updateContact = (i: number, f: keyof PartnerContact, v: string) =>
    setContacts((prev) => prev.map((c, j) => (j === i ? { ...c, [f]: v } : c)));
  const removeContact = (i: number) => setContacts((prev) => prev.filter((_, j) => j !== i));

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { toast('error', '请输入合作伙伴名称'); return; }
    setSaving(true);
    try {
      const partner: Omit<Partner, 'id'> = {
        name: form.name, logo: '', tier: form.tier, status: form.status, type: form.type,
        manager: form.manager, location: form.location || [form.province, form.city].filter(Boolean).join(' '),
        region: form.region || '华北', startDate: form.startDate, years: 0, prevTier: form.tier,
        tags: form.tags, winRate: 0, contacts: contacts.filter((c) => c.lastName || c.firstName),
        unifiedSocialCreditCode: form.unifiedSocialCreditCode, industry: form.industry,
        registeredAddress: form.registeredAddress, cooperationScope: form.cooperationScope,
        isCorePartner: form.isCorePartner, province: form.province, city: form.city, district: form.district,
      };
      const created = await partnerService.create(partner);
      toast('success', `合作伙伴「${created.name}」创建成功`);
      navigate(`/partners/${created.id}`);
    } catch (err: any) {
      toast('error', `创建失败: ${err.message || '请重试'}`);
    } finally {
      setSaving(false);
    }
  }, [form, contacts, navigate, toast]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/partners')} className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('profile.backToList')}
        </button>
        <Button variant="brand" size="sm" onClick={handleSubmit} loading={saving}>
          <Save className="w-4 h-4" /> 创建合作伙伴
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新增合作伙伴</CardTitle>
          <span className="text-xs text-neutral-400">填写基本信息后点击创建</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="合作伙伴名称 *" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="请输入公司全称" />
            <Input label="统一社会信用代码" value={form.unifiedSocialCreditCode} onChange={(e) => updateField('unifiedSocialCreditCode', e.target.value)} placeholder="18位信用代码" />
            <Select label="合作伙伴类型" options={TYPE_OPTIONS} value={form.type} onChange={(e) => updateField('type', e.target.value)} />
            <Select label="合作伙伴等级" options={TIER_OPTIONS} value={form.tier} onChange={(e) => updateField('tier', e.target.value)} />
            <Select label="合作伙伴状态" options={STATUS_OPTIONS} value={form.status} onChange={(e) => updateField('status', e.target.value)} />
            <Input label="加入日期" type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} />
            <Select label="所属行业" options={INDUSTRY_OPTIONS} value={form.industry} onChange={(e) => updateField('industry', e.target.value)} />
            <RegionCascader label="所在地区" value={{ province: form.province, city: form.city, district: form.district }}
              onChange={(v) => { updateField('province', v.province); updateField('city', v.city); updateField('district', v.district); }} />
            <Input label="渠道经理" value={form.manager} onChange={(e) => updateField('manager', e.target.value)} placeholder="负责人姓名" />
            <Input label="所在区域" value={form.region} onChange={(e) => updateField('region', e.target.value)} placeholder="华北/华东/华南/西部" />
            <div className="md:col-span-2">
              <Input label="注册地址" value={form.registeredAddress} onChange={(e) => updateField('registeredAddress', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">合作范围</label>
              <textarea className="w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/20" rows={2} value={form.cooperationScope} onChange={(e) => updateField('cooperationScope', e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="core" checked={form.isCorePartner} onChange={(e) => updateField('isCorePartner', e.target.checked)} className="w-4 h-4 rounded" />
              <label htmlFor="core" className="text-sm cursor-pointer select-none">核心合作伙伴</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>联系人信息</CardTitle>
          <Button variant="ghost" size="sm" onClick={addContact}><Plus className="w-4 h-4" /> 添加联系人</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.map((c, i) => (
              <div key={i} className={c.isPrimary ? 'p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/20' : 'p-4 rounded-xl border border-neutral-200 dark:border-neutral-800'}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">联系人 #{i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="radio" name="primary" checked={c.isPrimary} onChange={() => setContacts((prev) => prev.map((x, j) => ({ ...x, isPrimary: j === i })))} />
                      主要联系人
                    </label>
                    {contacts.length > 1 && (
                      <button onClick={() => removeContact(i)} className="p-1 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input value={c.lastName} onChange={(e) => updateContact(i, 'lastName', e.target.value)} placeholder="姓" />
                  <Input value={c.firstName} onChange={(e) => updateContact(i, 'firstName', e.target.value)} placeholder="名" />
                  <Input value={c.department || ''} onChange={(e) => updateContact(i, 'department', e.target.value)} placeholder="部门" />
                  <Input value={c.title} onChange={(e) => updateContact(i, 'title', e.target.value)} placeholder="职位" />
                  <Input value={c.phone} onChange={(e) => updateContact(i, 'phone', e.target.value)} placeholder="手机号" />
                  <Input value={c.email} onChange={(e) => updateContact(i, 'email', e.target.value)} placeholder="邮箱" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate('/partners')}>取消</Button>
        <Button variant="brand" onClick={handleSubmit} loading={saving}><Save className="w-4 h-4" /> 创建合作伙伴</Button>
      </div>
    </div>
  );
};
