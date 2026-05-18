import type { Partner, PartnerTier, PartnerStatus, PartnerType, PartnerContact } from '../types';
import * as XLSX from 'xlsx';

interface ExcelRow {
  'Reseller Level'?: string;
  propartnerID?: string;
  'Account Name'?: string;
  'Account Name (Local)'?: string;
  Salutation?: string;
  'First Name'?: string;
  'Last Name'?: string;
  Title?: string;
  Phone?: string;
  Mobile?: string;
  Email?: string;
  'Billing Street'?: string;
  'Billing City'?: string;
  'Billing State'?: string;
  'Billing Country'?: string;
  'Billing Zip/Postal Code'?: string;
  'Account Owner'?: string;
  AccountType?: string;
  'ProPartner View'?: string;
  'ProPartner ID'?: string;
  'ProPartner Status'?: string;
  'Primary contact'?: boolean | string;
}

const TIER_MAP: Record<string, PartnerTier> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  diamond: 'Diamond',
  premier: 'Premier',
  registered: 'Registered',
  standard: 'Standard',
};

const STATUS_MAP: Record<string, PartnerStatus> = {
  approved: 'Cooperating',
  active: 'Cooperating',
  declined: 'Inactive',
  archived: 'Inactive',
  inactive: 'Inactive',
  prospective: 'Prospective',
};

const TYPE_MAP: Record<string, PartnerType> = {
  reseller: 'Reseller',
  isv: 'ISV',
  oem: 'OEM',
  service: 'Service',
  vad: 'VAD',
  var: 'VAR',
  si: 'SI',
  consultant: 'Service',
  'system integrator': 'SI',
  'global system integrator': 'SI',
  'cloud provider': 'Service',
};

const PROVINCE_TO_REGION: Record<string, string> = {
  '北京': '华北', '天津': '华北', '河北': '华北', '山西': '华北', '内蒙古': '华北',
  '上海': '华东', '江苏': '华东', '浙江': '华东', '安徽': '华东', '福建': '华东', '江西': '华东', '山东': '华东',
  '广东': '华南', '广西': '华南', '海南': '华南',
  '湖北': '华中', '湖南': '华中', '河南': '华中',
  '重庆': '西部', '四川': '西部', '贵州': '西部', '云南': '西部', '西藏': '西部',
  '陕西': '西北', '甘肃': '西北', '青海': '西北', '宁夏': '西北', '新疆': '西北',
  '辽宁': '东北', '吉林': '东北', '黑龙江': '东北',
};

const PINYIN_REGION_MAP: Record<string, string> = {
  beijing: '华北', tianjin: '华北', hebei: '华北', shanxi: '华北', neimenggu: '华北',
  shanghai: '华东', jiangsu: '华东', zhejiang: '华东', anhui: '华东', fujian: '华东', jiangxi: '华东', shandong: '华东',
  guangdong: '华南', guangxi: '华南', hainan: '华南',
  hubei: '华中', hunan: '华中', henan: '华中',
  chongqing: '西部', sichuan: '西部', guizhou: '西部', yunnan: '西部', xizang: '西部',
  shaanxi: '西北', gansu: '西北', qinghai: '西北', ningxia: '西北', xinjiang: '西北',
  liaoning: '东北', jilin: '东北', heilongjiang: '东北',
};

function resolveTier(level?: string, view?: string): PartnerTier {
  const candidate = (view || level || '').toLowerCase().trim();
  for (const [key, tier] of Object.entries(TIER_MAP)) {
    if (candidate.includes(key)) return tier;
  }
  return 'Registered';
}

function resolveStatus(status?: string | boolean): PartnerStatus {
  if (typeof status === 'boolean') return status ? 'Cooperating' : 'Prospective';
  const s = (status || '').toLowerCase().trim();
  return STATUS_MAP[s] || 'Cooperating';
}

function resolveType(accountType?: string, view?: string): PartnerType {
  const v = ((view || accountType) || '').toLowerCase().trim();
  for (const [key, t] of Object.entries(TYPE_MAP)) {
    if (v.includes(key)) return t;
  }
  return 'Reseller';
}

function resolveRegion(city?: string, state?: string): string {
  const search = `${city || ''} ${state || ''}`.toLowerCase();
  for (const [province, region] of Object.entries(PROVINCE_TO_REGION)) {
    if (search.includes(province)) return region;
  }
  for (const [eng, region] of Object.entries(PINYIN_REGION_MAP)) {
    if (search.includes(eng)) return region;
  }
  return '其他';
}

function resolveLocation(city?: string, state?: string): string {
  const parts = [state, city].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '未知';
}

function isPrimaryContact(raw: boolean | string | undefined): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') return raw.toLowerCase() === 'true';
  return false;
}

interface CompanyGroup {
  name: string;
  localName: string;
  propartnerID: string;
  tier: PartnerTier;
  status: PartnerStatus;
  type: PartnerType;
  manager: string;
  location: string;
  region: string;
  city: string;
  state: string;
  contacts: PartnerContact[];
}

export interface ImportResult {
  partners: Partner[];
  totalRows: number;
  uniqueCompanies: number;
  skippedRows: number;
  errors: string[];
}

export function parseExcelFile(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(
          (n) => n.includes('reseller') || n.includes('acct')
        ) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        if (rows.length === 0) {
          reject(new Error('Excel 文件中没有数据行'));
          return;
        }

        const companyMap = new Map<string, CompanyGroup>();
        const errors: string[] = [];
        let skippedRows = 0;

        const companyKey = (row: ExcelRow): string => {
          return (row['Account Name'] || row['Account Name (Local)'] || '').trim() ||
                 `${row['Billing City'] || ''}-${row['Billing State'] || ''}-${row['Account Owner'] || ''}`;
        };

        rows.forEach((row, idx) => {
          const key = companyKey(row);
          if (!key) {
            skippedRows++;
            return;
          }

          const contact: PartnerContact = {
            salutation: row.Salutation,
            firstName: (row['First Name'] || '').trim(),
            lastName: (row['Last Name'] || '').trim(),
            title: (row.Title || '').trim(),
            phone: (row.Phone || '').trim(),
            mobile: (row.Mobile || '').trim(),
            email: (row.Email || '').trim(),
            isPrimary: isPrimaryContact(row['Primary contact']),
          };

          if (!companyMap.has(key)) {
            const city = row['Billing City'] || '';
            const state = row['Billing State'] || '';

            companyMap.set(key, {
              name: row['Account Name'] || row['Account Name (Local)'] || key,
              localName: row['Account Name (Local)'] || '',
              propartnerID: (row.propartnerID || row['ProPartner ID'] || '').trim(),
              tier: resolveTier(row['Reseller Level'], row['ProPartner View']),
              status: resolveStatus(row['ProPartner Status']),
              type: resolveType(row.AccountType, row['ProPartner View']),
              manager: (row['Account Owner'] || row['Primary contact'] || '').toString().trim() || '未分配',
              location: resolveLocation(city, state),
              region: resolveRegion(city, state),
              city,
              state,
              contacts: [],
            });
          }

          const company = companyMap.get(key)!;

          if (contact.firstName || contact.lastName) {
            company.contacts.push(contact);
          }

          if (contact.isPrimary) {
            const primaryManager = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
            if (primaryManager) company.manager = primaryManager;
          }
        });

        const partners: Partner[] = [];
        companyMap.forEach((group) => {
          partners.push({
            id: group.propartnerID || `imported-${partners.length}`,
            name: group.localName || group.name,
            logo: '',
            tier: group.tier,
            status: group.status,
            type: group.type,
            manager: group.manager,
            location: group.location,
            region: group.region,
            startDate: '',
            years: 0,
            prevTier: group.tier,
            tags: [group.type, group.region].filter(Boolean),
            winRate: 0,
            contacts: group.contacts,
          });
        });

        resolve({
          partners,
          totalRows: rows.length,
          uniqueCompanies: partners.length,
          skippedRows: skippedRows + (rows.length - companyMap.size),
          errors,
        });
      } catch (err) {
        reject(new Error(`解析 Excel 文件失败: ${err instanceof Error ? err.message : '未知错误'}`));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsArrayBuffer(file);
  });
}
