import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { regionData } from '../../lib/regionData';

interface RegionValue {
  province: string;
  city: string;
  district: string;
}

interface RegionCascaderProps {
  value?: RegionValue;
  onChange: (value: RegionValue) => void;
  label?: string;
  error?: string;
}

export const RegionCascader = ({ value, onChange, label, error }: RegionCascaderProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'province' | 'city' | 'district'>('province');
  const [selectedProvince, setSelectedProvince] = useState<string>(value?.province || '');
  const [selectedCity, setSelectedCity] = useState<string>(value?.city || '');

  const provinces = regionData;

  const cities = useMemo(
    () => provinces.find((p) => p.value === selectedProvince)?.children || [],
    [selectedProvince],
  );

  const districts = useMemo(
    () => cities.find((c) => c.value === selectedCity)?.children || [],
    [cities, selectedCity],
  );

  const displayText = value?.district
    ? `${provinces.find((p) => p.value === value.province)?.label || ''} / ${cities.find((c) => c.value === value.city)?.label || ''} / ${districts.find((d) => d.value === value.district)?.label || ''}`
    : '请选择省/市/区';

  const handleProvinceSelect = (prov: string) => {
    setSelectedProvince(prov);
    setSelectedCity('');
    setStep('city');
    onChange({ province: prov, city: '', district: '' });
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setStep('district');
    onChange({ province: selectedProvince, city, district: '' });
  };

  const handleDistrictSelect = (district: string) => {
    onChange({ province: selectedProvince, city: selectedCity, district });
    setOpen(false);
    setStep('province');
  };

  const handleTriggerClick = () => {
    setOpen(!open);
    setStep('province');
    setSelectedProvince(value?.province || '');
    setSelectedCity(value?.city || '');
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold text-black dark:text-white">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={handleTriggerClick}
          className={cn(
            'w-full px-4 py-2.5 bg-[#f5f5f7] dark:bg-white/[0.06] border-0 rounded-xl text-sm text-left transition-all',
            !value?.district ? 'text-[#86868b]' : 'text-black dark:text-white',
            error && 'ring-2 ring-red-500',
            open && 'ring-2 ring-black/10 dark:ring-white/10',
          )}
        >
          {displayText}
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 rounded-xl shadow-xl z-50 max-h-60 overflow-auto">
            <div className="flex border-b border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setStep('province')}
                className={cn('flex-1 py-2 text-xs font-bold text-center', step === 'province' && 'border-b-2 border-black dark:border-white')}
              >
                {selectedProvince ? provinces.find((p) => p.value === selectedProvince)?.label : '省份'}
              </button>
              <button
                type="button"
                onClick={() => cities.length > 0 && setStep('city')}
                className={cn('flex-1 py-2 text-xs font-bold text-center', step === 'city' && 'border-b-2 border-black dark:border-white', cities.length === 0 && 'text-[#d2d2d7]')}
                disabled={cities.length === 0}
              >
                {selectedCity ? cities.find((c) => c.value === selectedCity)?.label : '城市'}
              </button>
              <button
                type="button"
                disabled
                className={cn('flex-1 py-2 text-xs font-bold text-center', step === 'district' && 'border-b-2 border-black dark:border-white')}
              >
                区县
              </button>
            </div>
            <div className="p-1">
              {step === 'province' &&
                provinces.map((prov) => (
                  <button
                    key={prov.value}
                    type="button"
                    onClick={() => handleProvinceSelect(prov.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#f5f5f7] dark:hover:bg-white/5 transition-colors',
                      selectedProvince === prov.value && 'bg-black/5 dark:bg-white/10',
                    )}
                  >
                    {prov.label}
                  </button>
                ))}
              {step === 'city' &&
                cities.map((city) => (
                  <button
                    key={city.value}
                    type="button"
                    onClick={() => handleCitySelect(city.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#f5f5f7] dark:hover:bg-white/5 transition-colors',
                      selectedCity === city.value && 'bg-black/5 dark:bg-white/10',
                    )}
                  >
                    {city.label}
                  </button>
                ))}
              {step === 'district' &&
                districts.map((dist) => (
                  <button
                    key={dist.value}
                    type="button"
                    onClick={() => handleDistrictSelect(dist.value)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#f5f5f7] dark:hover:bg-white/5 transition-colors"
                  >
                    {dist.label}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium" role="alert">{error}</p>}
    </div>
  );
};
