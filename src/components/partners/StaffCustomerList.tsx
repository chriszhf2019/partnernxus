import { useState } from 'react';
import { Target, Users, Phone, Calendar, TrendingUp, Plus, Search, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { StaffCustomer } from '../../types';

interface StaffCustomerListProps {
  customers: StaffCustomer[];
  staffId?: string;
  onAddCustomer: (customer: Omit<StaffCustomer, 'id'>) => void;
}

export const StaffCustomerList = ({ customers, staffId, onAddCustomer }: StaffCustomerListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    industry: '',
    contactPerson: '',
    contactPhone: '',
    annualRevenue: 0,
    relationshipStart: new Date().toISOString().split('T')[0],
    keyProducts: [] as string[],
    newProduct: '',
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesStaff = !staffId || c.staffId === staffId;
    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStaff && matchesSearch;
  });

  const addProduct = () => {
    if (newCustomer.newProduct && !newCustomer.keyProducts.includes(newCustomer.newProduct)) {
      setNewCustomer({ ...newCustomer, keyProducts: [...newCustomer.keyProducts, newCustomer.newProduct], newProduct: '' });
    }
  };

  const removeProduct = (product: string) => {
    setNewCustomer({ ...newCustomer, keyProducts: newCustomer.keyProducts.filter(p => p !== product) });
  };

  const handleAddCustomer = () => {
    if (!newCustomer.customerName || !newCustomer.industry) return;
    
    onAddCustomer({
      staffId: staffId || '',
      customerName: newCustomer.customerName,
      industry: newCustomer.industry,
      contactPerson: newCustomer.contactPerson,
      contactPhone: newCustomer.contactPhone,
      annualRevenue: newCustomer.annualRevenue,
      relationshipStart: newCustomer.relationshipStart,
      keyProducts: newCustomer.keyProducts,
    });
    
    setShowAddModal(false);
    setNewCustomer({
      customerName: '',
      industry: '',
      contactPerson: '',
      contactPhone: '',
      annualRevenue: 0,
      relationshipStart: new Date().toISOString().split('T')[0],
      keyProducts: [],
      newProduct: '',
    });
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.annualRevenue, 0);
  const totalCustomers = customers.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            重点客户
          </CardTitle>
          <CardDescription>管理合作伙伴人员负责的重点客户</CardDescription>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          添加客户
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">客户数量</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{totalCustomers}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">客户年营收</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="搜索客户名称、行业或联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Target className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无重点客户记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{customer.customerName}</h3>
                      <Badge variant="info">{customer.industry}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {customer.contactPerson}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.contactPhone}
                      </div>
                      <div>年营收: {customer.annualRevenue.toLocaleString()}元</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {customer.relationshipStart}建立合作
                      </div>
                    </div>
                    {customer.keyProducts.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-neutral-500">重点产品:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.keyProducts.map((product, index) => (
                            <Badge key={index} variant="default" className="text-xs">{product}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">添加重点客户</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">客户名称 *</label>
                  <Input
                    value={newCustomer.customerName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                    placeholder="输入客户公司名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">行业 *</label>
                  <Input
                    value={newCustomer.industry}
                    onChange={(e) => setNewCustomer({ ...newCustomer, industry: e.target.value })}
                    placeholder="如：金融、制造、医疗"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">联系人</label>
                    <Input
                      value={newCustomer.contactPerson}
                      onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                      placeholder="联系人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">联系电话</label>
                    <Input
                      value={newCustomer.contactPhone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, contactPhone: e.target.value })}
                      placeholder="联系电话"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">年营收（元）</label>
                    <Input
                      type="number"
                      value={newCustomer.annualRevenue}
                      onChange={(e) => setNewCustomer({ ...newCustomer, annualRevenue: parseInt(e.target.value) || 0 })}
                      placeholder="客户年营收"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-1">合作开始日期</label>
                    <Input
                      type="date"
                      value={newCustomer.relationshipStart}
                      onChange={(e) => setNewCustomer({ ...newCustomer, relationshipStart: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">重点产品</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCustomer.newProduct}
                      onChange={(e) => setNewCustomer({ ...newCustomer, newProduct: e.target.value })}
                      placeholder="输入产品名称"
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                    />
                    <Button variant="outline" size="sm" onClick={addProduct}>
                      添加
                    </Button>
                  </div>
                  {newCustomer.keyProducts.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {newCustomer.keyProducts.map((product, index) => (
                        <Badge key={index} variant="info" className="flex items-center gap-1">
                          {product}
                          <button onClick={() => removeProduct(product)} className="hover:text-neutral-700">&times;</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </Button>
                <Button onClick={handleAddCustomer} disabled={!newCustomer.customerName || !newCustomer.industry}>
                  确认添加
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
