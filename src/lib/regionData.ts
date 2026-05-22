export interface RegionNode {
  value: string;
  label: string;
  children?: RegionNode[];
}

export const regionData: RegionNode[] = [
  {
    value: 'beijing', label: '北京市', children: [
      { value: 'beijing', label: '北京市', children: [
        { value: 'dongcheng', label: '东城区' }, { value: 'xicheng', label: '西城区' },
        { value: 'chaoyang', label: '朝阳区' }, { value: 'haidian', label: '海淀区' },
        { value: 'fengtai', label: '丰台区' }, { value: 'shijingshan', label: '石景山区' },
      ]},
    ],
  },
  {
    value: 'shanghai', label: '上海市', children: [
      { value: 'shanghai', label: '上海市', children: [
        { value: 'huangpu', label: '黄浦区' }, { value: 'xuhui', label: '徐汇区' },
        { value: 'changning', label: '长宁区' }, { value: 'jingan', label: '静安区' },
        { value: 'putuo', label: '普陀区' }, { value: 'pudong', label: '浦东新区' },
      ]},
    ],
  },
  {
    value: 'guangdong', label: '广东省', children: [
      { value: 'guangzhou', label: '广州市', children: [
        { value: 'tianhe', label: '天河区' }, { value: 'yuexiu', label: '越秀区' },
        { value: 'haizhu', label: '海珠区' }, { value: 'baiyun', label: '白云区' },
      ]},
      { value: 'shenzhen', label: '深圳市', children: [
        { value: 'nanshan', label: '南山区' }, { value: 'futian', label: '福田区' },
        { value: 'luohu', label: '罗湖区' }, { value: 'baoan', label: '宝安区' },
      ]},
      { value: 'dongguan', label: '东莞市', children: [
        { value: 'nancheng', label: '南城区' }, { value: 'dongcheng_gd', label: '东城区' },
      ]},
    ],
  },
  {
    value: 'zhejiang', label: '浙江省', children: [
      { value: 'hangzhou', label: '杭州市', children: [
        { value: 'xihu', label: '西湖区' }, { value: 'shangcheng', label: '上城区' },
        { value: 'gongshu', label: '拱墅区' }, { value: 'binjiang', label: '滨江区' },
      ]},
      { value: 'ningbo', label: '宁波市', children: [
        { value: 'haishu', label: '海曙区' }, { value: 'yinzhou', label: '鄞州区' },
      ]},
    ],
  },
  {
    value: 'jiangsu', label: '江苏省', children: [
      { value: 'nanjing', label: '南京市', children: [
        { value: 'xuanwu', label: '玄武区' }, { value: 'gulou', label: '鼓楼区' },
        { value: 'jianye', label: '建邺区' }, { value: 'qinhuai', label: '秦淮区' },
      ]},
      { value: 'suzhou', label: '苏州市', children: [
        { value: 'gusu', label: '姑苏区' }, { value: 'huqiu', label: '虎丘区' },
        { value: 'wuzhong', label: '吴中区' }, { value: 'xiangcheng', label: '相城区' },
      ]},
      { value: 'wuxi', label: '无锡市', children: [
        { value: 'liangxi', label: '梁溪区' }, { value: 'binhu', label: '滨湖区' },
      ]},
    ],
  },
  {
    value: 'sichuan', label: '四川省', children: [
      { value: 'chengdu', label: '成都市', children: [
        { value: 'jinjiang', label: '锦江区' }, { value: 'qingyang', label: '青羊区' },
        { value: 'wuhou', label: '武侯区' }, { value: 'gaoxin', label: '高新区' },
      ]},
    ],
  },
  {
    value: 'hubei', label: '湖北省', children: [
      { value: 'wuhan', label: '武汉市', children: [
        { value: 'wuchang', label: '武昌区' }, { value: 'hankou', label: '汉口区' },
        { value: 'hanyang', label: '汉阳区' }, { value: 'guanggu', label: '光谷区' },
      ]},
    ],
  },
  {
    value: 'shandong', label: '山东省', children: [
      { value: 'jinan', label: '济南市', children: [
        { value: 'lixia', label: '历下区' }, { value: 'shizhong_sd', label: '市中区' },
      ]},
      { value: 'qingdao', label: '青岛市', children: [
        { value: 'shinan', label: '市南区' }, { value: 'shibei', label: '市北区' },
        { value: 'laoshan', label: '崂山区' },
      ]},
    ],
  },
  {
    value: 'fujian', label: '福建省', children: [
      { value: 'fuzhou', label: '福州市', children: [
        { value: 'gulou_fj', label: '鼓楼区' }, { value: 'taijiang', label: '台江区' },
      ]},
      { value: 'xiamen', label: '厦门市', children: [
        { value: 'siming', label: '思明区' }, { value: 'huli', label: '湖里区' },
      ]},
    ],
  },
  {
    value: 'henan', label: '河南省', children: [
      { value: 'zhengzhou', label: '郑州市', children: [
        { value: 'jinshui', label: '金水区' }, { value: 'zhongyuan', label: '中原区' },
      ]},
    ],
  },
  {
    value: 'hunan', label: '湖南省', children: [
      { value: 'changsha', label: '长沙市', children: [
        { value: 'yuelu', label: '岳麓区' }, { value: 'furong', label: '芙蓉区' },
      ]},
    ],
  },
  {
    value: 'shaanxi', label: '陕西省', children: [
      { value: 'xian', label: '西安市', children: [
        { value: 'yanta', label: '雁塔区' }, { value: 'beilin', label: '碑林区' },
        { value: 'weiyang', label: '未央区' }, { value: 'xincheng', label: '新城区' },
      ]},
    ],
  },
];
