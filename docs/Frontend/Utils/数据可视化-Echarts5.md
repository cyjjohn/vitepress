# 数据可视化-Echarts5

## 1.ECharts 初体验

> div容器必须要有高度，宽度可选

```html
<div id="main" style="height: 400px"></div>
<script src="../libs/echarts-5.3.3.js"></script>
<script>
  // 1.基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById("main"));

  // 2.指定图表的配置项和数据
  var option = {
    title: {
      text: "ECharts 入门示例",
    },
    tooltip: {},
    legend: {
      data: ["销量"],
    },
    xAxis: {
      data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
    },
    yAxis: {},
    series: [
      {
        name: "销量",
        type: "bar",
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
  };

  // 3.使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
</script>

```

最精简 配置版

```js
var option = {
  xAxis: {
    data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
  },
  yAxis: {},
  series: [
    {
      name: "销量",
      type: "bar",
      data: [5, 20, 36, 10, 10, 20],
    },
  ],
};
```

## 2.切换渲染引擎 和 主题色

```js
echarts.init(document.getElementById("main"), null, {renderer: "svg"});

echarts.init(document.getElementById("main"), "dark", {renderer: "svg"});
```

## 3.配置项（组件）

### 1.Grid 组件

```json
{
  "backgroundColor": "rgba(255, 0, 0, 0.1)",
  "grid": {
    "show": true,
    "backgroundColor": "rgba(255, 0, 0, 0.1)",
    "left": 0,
    "right": 0,
    "top": 0,
    "bottom": 0,
    "containLabel": true
  }
}
```

### 2.x，y坐标系 组件

```js
xAxis: {
  show: true,
  name: "类目坐标",
  type: "category", // 类目坐标才有data选项  
  data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],

  axisLine: { // 坐标轴轴线相关设置。
    show: true,
    lineStyle: {
      color: "red",
      width: 3,
    },
  },

  axisLabel: { // 坐标轴刻度标签的相关设置。
    show: true,
    color: "green",
    fontSize: 16,
  },
  
  axisTick: {  // 坐标轴刻度相关设置。
    show: true,
    length: 10,
    lineStyle: {
      color: "blue",
      width: 3,
    },
  },
    
  splitLine: { // 坐标轴在 grid 区域中的分隔线。
    show: true,
    lineStyle: {
      color: "orange",
      width: 1,
    },
  }, 
},
```

### 3.series 系列

### 1.data 支持的编写方式

```js
series: [
  {
    name: "产品销量柱形图",
    type: "bar",
    label: {
      show: true,
    },
    data: [
      {
        value: 5,
        name: "衬衫",
      },
      {
        value: 20,
        name: "羊毛衫",
      },
      {
        value: 36,
        name: "雪纺衫",
      },
      {
        value: 10,
        name: "裤子",
      },
      {
        value: 10,
        name: "高跟鞋",
      },
      {
        value: 20,
        name: "袜子",
      },
    ],
  },
],
```

### 2.type 图表类型(bar、pie)

折线图 和 条型图

```js
series: [
  {
    name: "产品销量柱形图", // 数据系列的名称
    type: "line",           // 数据系列的类型，是折线图

    data: [5, 20, 36, 10, 10, 20], // 数据数组，每个元素代表一个数据点的值
  },
],
```

饼图

```js
series: [
  {
    name: "产品销量柱形图", // 数据系列的名称
    type: "pie",             // 数据系列的类型，是饼图

    center: ["50%", "50%"],  // 饼图的中心（圆心）坐标。这里是图表的正中间位置
    // 第一个值为横坐标相对于容器宽度的百分比，第二个值为纵坐标相对于容器高度的百分比

    radius: ["20%", "85%"],  // 饼图的半径。第一个值是内半径，第二个值是外半径
    // 这里的百分比是相对于容器高宽中较小的一项

    roseType: "area",        // 玫瑰图模式，使用面积模式，通过半径展现数据大小

    data: [                  // 数据数组，每个对象代表一个数据项
      {
        value: 5,
        name: "衬衫",        // 数据项名称
      },
      {
        value: 20,
        name: "羊毛衫",
      },
      {
        value: 36,
        name: "雪纺衫",
      },
      {
        value: 10,
        name: "裤子",
      },
      {
        value: 10,
        name: "高跟鞋",
      },
      {
        value: 20,
        name: "袜子",
      },
    ],
  },
],
```

### 3.label( 优先级 )

```js
series: [
  {
    name: "产品销量柱形图", // 数据系列的名称
    type: "bar",             // 数据系列的类型，是柱状图

    label: {                 // 系列图形上的文本标签
      show: true,            // 显示标签
      position: [10, 10],    // 标签的位置，可以是数组或者字符串，具体取决于图表类型和需求
      color: "white",        // 标签文字的颜色
      fontSize: "20px",      // 标签文字的字体大小
    },

    data: [                  // 数据数组
      {
        value: 5,            // 数据值

        label: {             // 单个数据项的文本标签
          show: false,       // 不显示标签，该设置优先级高于系列的设置
        },
      },
      // 其他数据项...
    ],
  },
],
```

### 4.itemStyle 图形默认色

```js
series: [
  {
    name: "产品销量柱形图", // 数据系列的名称
    type: "bar",             // 数据系列的类型，是柱状图

    itemStyle: {             // 整个系列的图形样式
      color: "red",          // 柱的颜色
      // borderColor: "orange", // 柱的边框颜色
      // borderWidth: 4,        // 柱的边框宽度
      // opacity: 0.4,          // 柱的透明度
    },

    data: [                  // 数据数组
      {
        value: 5,            // 数据值
        itemStyle: {         // 单个数据项的图形样式
          color: "green",    // 单个数据项的颜色，优先级高于系列的样式
        },
      },
      // 其他数据项...
    ],
  },
],
```

### 5.emphasis 高亮色

鼠标悬浮到图形元素上时，高亮的样式。

```js
series: [
  {
    name: "产品销量柱形图", // 数据系列的名称
    type: "bar",             // 数据系列的类型，这里是柱状图

    emphasis: {              // 图形高亮的配置
      label: {               // 高亮时的标签配置
        // show: false,      // 可以控制高亮标签的显示与隐藏
        color: "gold",       // 高亮时标签的颜色
      },
    },

    data: [                  // 数据数组
      {
        value: 5,            // 数据值

        emphasis: {          // 单个数据项的高亮配置
          label: {
            // show: false,  // 单个数据项高亮标签的显示与隐藏
            color: "green",  // 单个数据项高亮时标签的颜色
          },
        },
      },
      // 其他数据项...
    ],
  },
],
```

### 4.title 组件

```js
title: {
  text: "Echart 5.x 条形图",  // 图表的标题文本
  left: 20,                   // 标题组件相对于容器左侧的偏移像素
  top: 10,                    // 标题组件相对于容器顶部的偏移像素
},
```

### 5.legend 图例组件

pie

```js
legend: {
  show: true,       // 是否显示图例组件

  // width: 50,     // 图例组件的宽度，默认自适应
  itemWidth: 20,    // 图例标记的图形宽度

  // icon: "circle", // 图例项的图形标记类型
  // top: 10,       // 图例组件离容器顶部的距离
  // bottom: 0,     // 图例组件离容器底部的距离

  formatter: function (name) {
    return name + "  {countSty|40%}"; // 使用富文本语法来格式化图例项的文本
  },

  textStyle: {
    color: "red",   // 图例文本的颜色
    rich: {         // 用于自定义富文本样式
      countSty: {
        color: "red", // 自定义样式 countSty 的颜色
      },
    },
  },
},
```

### 6.tooltip 组件

```js
tooltip: {
  show: true,        // 是否显示提示框组件
  trigger: "axis",   // 触发类型，'axis' 表示提示框会随着轴线触发，通常用于折线图、柱状图等
  axisPointer: {
    type: "line",    // 指示器类型，默认为 'line'
                     // 可选值还有 'shadow'、'cross'，其中：
                     // 'line'  表示线条
                     // 'shadow' 表示阴影区域
                     // 'cross' 表示十字准星
  },
},
```

### 7.Color的渐变色

对象配置方式（ 推荐 ）

```js
color: {
  type: "linear", // 线性渐变
  x: 0,           // 起始点的 x 坐标
  y: 0,           // 起始点的 y 坐标
  x2: 0,          // 终止点的 x 坐标
  y2: 1,          // 终止点的 y 坐标
  colorStops: [
    {
      offset: 0, // 渐变起始位置
      color: "red", // 起始颜色
    },
    {
      offset: 1, // 渐变结束位置
      color: "blue", // 结束颜色
    },
  ],
}
```

调用 API 生成

```js
color: new echarts.graphic.LinearGradient(
  0,  // x0: 起始点的 x 坐标
  0,  // y0: 起始点的 y 坐标
  0,  // x1: 终止点的 x 坐标
  1,  // y1: 终止点的 y 坐标
  [
    {
      offset: 0, // 颜色渐变的起始点
      color: "#20FF89", // 在起始点的颜色
    },
    {
      offset: 1, // 颜色渐变的终止点
      color: "rgba(255, 255, 255, 0)", // 在终止点的颜色（透明）
    },
  ],
  false // 是否全局坐标，默认为 false
),
```

## 4.图表实战

### 1.柱形图

```js
var option = {
  backgroundColor: "rgb(40,46,72)", // 修正为 "rgb"
  grid: {
    left: "5%",
    right: "6%",
    top: "30%",
    bottom: "5%",
    containLabel: true, // grid 区域是否包含坐标轴的刻度标签
  },
  tooltip: {}, // 默认启用的提示框组件
  xAxis: {
    name: "月份",
    axisLine: {
      show: true,
      lineStyle: {
        color: "#42A4FF",
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: "white",
    },
    data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月"],
  },
  yAxis: {
    name: "个",
    nameTextStyle: {
      color: "white",
      fontSize: 13,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#42A4FF",
      },
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: "#42A4FF",
      },
    },
    axisLabel: {
      color: "white",
    },
  },
  series: [
    {
      name: "销量",
      type: "bar",
      barWidth: 17,
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#01B1FF" }, // 0% 处的颜色
            { offset: 1, color: "#033BFF" }, // 100% 处的颜色
          ],
          global: false, // 缺省为 false
        },
      },
      data: [500, 2000, 3600, 1000, 1000, 2000, 4000],
    },
  ],
};
```

### 2.折线图

```js
var option = {
  backgroundColor: "rgb(40,46,72)", // 请注意此处原始代码有拼写错误，应该是 "rgb" 而不是 "rbg"
  grid: {
    left: "5%",
    right: "1%",
    top: "20%",
    bottom: "15%",
    containLabel: true, // grid 区域是否包含坐标轴的刻度标签
  },
  legend: {
    bottom: "5%",
    itemGap: 20,
    itemWidth: 13,
    itemHeigth: 12,
    textStyle: {
      color: "#64BCFF",
    },
    icon: "rect",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
      lineStyle: {
        color: "#20FF89",
      },
    },
  },
  xAxis: [
    {
      type: "category",
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: "#64BCFF",
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      data: [
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月"
      ],
    },
  ],
  yAxis: [
    {
      type: "value",
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: true,
        color: "#64BCFF",
      },
    },
  ],
  series: [
    {
      name: "正常",
      type: "line",
      smooth: true, // 是否平滑曲线显示。
      symbolSize: 5, // 标记的大小
      showSymbol: false,
      itemStyle: {
        color: "#20FF89",
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(
          0, 0, 0, 1,
          [
            { offset: 0, color: "#20FF89" },
            { offset: 1, color: "rgba(255, 255, 255, 0)" }
          ],
          false
        ),
      },
      data: [200, 200, 191, 234, 290, 330, 310, 201, 154, 190, 330, 410],
    },
    {
      name: "异常",
      type: "line",
      smooth: true,
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        color: "#EA9502",
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#EA9502" },
            { offset: 1, color: "rgba(255, 255, 255, 0)" }
          ],
        },
      },
      data: [500, 300, 202, 258, 280, 660, 320, 202, 308, 280, 660, 420],
    },
  ],
};
```

### 3.饼图

```js
// =====准备数据=====
let pieDatas = [
  { value: 100, name: "广州占比", percentage: "5%", color: "#34D160" },
  { value: 200, name: "深圳占比", percentage: "4%", color: "#027FF2" },
  { value: 300, name: "东莞占比", percentage: "8%", color: "#8A00E1" },
  { value: 400, name: "佛山占比", percentage: "10%", color: "#F19610" },
  { value: 500, name: "中山占比", percentage: "20%", color: "#6054FF" },
  { value: 600, name: "珠海占比", percentage: "40%", color: "#00C6FF" },
];

// 将 pieDatas 格式的 数据映射为 系列图所需要的数据格式
var data = pieDatas.map((item) => {
  return {
    value: item.value,
    name: item.name,
    itemStyle: {
      color: item.color,
    },
  };
});

// 求出总数
let total = pieDatas.reduce((a, b) => {
  return a + b.value * 1;
}, 0);

// =====指定图表的配置项和数据=====
var option = {
  backgroundColor: "rgb(40,46,72)",
  title: {
    text: `充电桩总数`,
    top: "50%",
    left: "50%",
    padding: [-20, 0, 0, -45],
    textStyle: {
      fontSize: 19,
      color: "white",
    },
    subtext: `{totalSty|${total}}`,
    subtextStyle: {
      rich: {
        totalSty: {
          fontSize: 19,
          color: "white",
          width: 90,
          align: "center",
        },
      },
    },
  },
  legend: {
    orient: "vertical",
    right: "10%",
    top: "18%",
    itemGap: 20,
    itemWidth: 16,
    itemHeigth: 16,
    icon: "rect",
    formatter: function (name) {
      var currentItem = pieDatas.find((item) => item.name === name);
      return (
        "{nameSty|" +
        currentItem.name +
        "}\n" +
        "{numberSty|" +
        currentItem.value +
        "个 }" +
        "{preSty|" +
        currentItem.percentage +
        "}"
      );
    },
    textStyle: {
      rich: {
        nameSty: {
          fontSize: 12,
          color: "#FFFFFF",
          padding: [10, 14],
        },
        numberSty: {
          fontSize: 12,
          color: "#40E6ff",
          padding: [0, 0, 0, 14],
        },
        preSty: {
          fontSize: 12,
          color: "#40E6ff",
        },
      },
    },
  },
  series: [
    {
      type: "pie",
      center: ["50%", "50%"],
      radius: ["30%", "75%"],
      label: {
        show: false,
      },
      data: data,
      roseType: "area",
    },
  ],
};
```

### 4.地图

### 1.geo 地理坐标系组件

1.引入 geo_json

2.注册需要的地图 GeoJSON （在调 setOption 之前注册即可）

3.配置显示地图

```html
<!-- 引入 ECharts 和 GeoJSON 数据 -->
<script src="../libs/echarts-5.3.3.js"></script>
<script src="./geojson/china_json.js"></script>
<script src="./geojson/gd_geojson.js"></script>
<script src="./geojson/南昌.js"></script>

<script>
  // 注册地图
  echarts.registerMap("cn", { geoJSON: china_json });
  echarts.registerMap("gd", { geoJSON: gd_geojson });

  // 初始化图表
  var myChart = echarts.init(document.getElementById("main"), null, {
    renderer: "svg",
  });

  // 配置选项
  var option = {
    backgroundColor: "rgba(40,46,72, 0.2)",
    grid: {
      show: true,
      backgroundColor: "rgba(0, 0, 255, 0.2)",
    },
    geo: [
      {
        map: "南昌", // 可以切换为 "cn" 或 "gd"，取决于需要显示的地图
      },
    ],
    // series: [], // 此处可添加数据系列配置
  };

  // 设置选项
  myChart.setOption(option);
</script>
```

### 2.map series

1.引入 geo_json

2.注册需要的地图 GeoJSON （支持注册多个，也需要引入多个）

3.配置显示地图

```js
var option = {
  geo: {
    map: "cn", // 地图类型：cn、gd、南昌
    roam: false, // 是否开启鼠标缩放和平移漫游。默认不开启。
    label: {
      // 图形上的文本标签，可用于说明图形的一些数据信息，比如值，名称等。
      show: false,
    },
    aspectScale: 0.75, // 这个参数用于 scale 地图的长宽比，如果设置了 projection 则无效。
    // =======地图着色=========
    itemStyle: {
      areaColor: "#023677", // 地图区域的颜色。
      borderColor: "#1180c7", // 图形的描边颜色。
    },
    emphasis: {
      itemStyle: {
        areaColor: "#4499d0",
      },
      label: {
        color: "white",
      },
    },
    // =======地图着色=========
  },
  series: [],
};
```

### 3.itemStyle着色

areaColor

borderColor

```js
var option = {
  geo: {
    map: "cn", // 地图类型：cn、gd、南昌
    roam: false, // 是否开启鼠标缩放和平移漫游。默认不开启。
    label: {
      // 图形上的文本标签，可用于说明图形的一些数据信息，比如值，名称等。
      show: false,
    },
    aspectScale: 0.75, // 这个参数用于 scale 地图的长宽比，如果设置了 projection 则无效。
    // =======地图着色=========
    itemStyle: {
      areaColor: "#023677", // 地图区域的颜色。
      borderColor: "#1180c7", // 图形的描边颜色。
    },
    emphasis: {
      itemStyle: {
        areaColor: "#4499d0",
      },
      label: {
        color: "white",
      },
    },
    // =======地图着色=========
  },
  series: [],
};
```

### 4.map data

```js
var data = [
  { name: "北京", value: 199 },
  { name: "天津", value: 42 },
  { name: "河北", value: 102 },
  { name: "山西", value: 81 },
  { name: "内蒙古", value: 47 },
  { name: "辽宁", value: 67 },
  { name: "吉林", value: 82 },
  { name: "黑龙江", value: 123 },
  { name: "上海", value: 24 },
  { name: "江苏", value: 92 },
  { name: "浙江", value: 114 },
  { name: "安徽", value: 109 },
  { name: "福建", value: 116 },
  { name: "江西", value: 91 },
  { name: "山东", value: 119 },
  { name: "河南", value: 137 },
  { name: "湖北", value: 116 },
  { name: "湖南", value: 114 },
  { name: "重庆", value: 91 },
  { name: "四川", value: 125 },
  { name: "贵州", value: 62 },
  { name: "云南", value: 83 },
  { name: "西藏", value: 9 },
  { name: "陕西", value: 80 },
  { name: "甘肃", value: 56 },
  { name: "青海", value: 10 },
  { name: "宁夏", value: 18 },
  { name: "新疆", value: 180 },
  { name: "广东", value: 123 },
  { name: "广西", value: 59 },
  { name: "海南", value: 14 },
];

var series = [
  {
    name: "cn地图",
    type: "map",
    map: "cn",
    // =====地图着色======
    itemStyle: {
      areaColor: "#023677",
      borderColor: "#1180c7",
    },
    emphasis: {
      itemStyle: { areaColor: "#4499d0" },
      label: { color: "white" },
    },
    select: {
      label: { color: "white" },
      itemStyle: { areaColor: "#4499d0" },
    },
    // =====地图着色======
    // ===== 添加数据(不需要地理坐标点，直接使用name) =====
    data: data
  },
];
```

### 5.visualmap

seriesIndex: [0]

inRange 指定选中范围的视觉元素样式

```js
var option = {
  // 1.视觉数据映射
  visualMap: [
    {
      // type: "continuous", // 连续型视觉映射组件 (默认)
      // type: "piecewise", // 分段型视觉映射组件
      left: "20%",
      seriesIndex: [0], // 指定取哪个系列的数据
      // 定义 在选中范围中 的视觉元素, 对象类型。
      inRange: {
        color: ["#04387b", "#467bc0"], // 映射组件和地图的颜色(一般和地图色相近)
      },
    },
  ],
};
```

### 5.散点图

### 1.地图上散点图的基本用法

1.配置地理坐标系组件（ 在 geo 配置）

2.散点图系列

3.散点图复用地图坐标系组件 ( geoIndex )

```js
var data = [
  { name: "北京", value: 199 },
  { name: "天津", value: 42 },
  { name: "河北", value: 102 },
  { name: "山西", value: 81 },
  { name: "内蒙古", value: 47 },
  { name: "辽宁", value: 67 },
  { name: "吉林", value: 82 },
  { name: "黑龙江", value: 123 },
  { name: "上海", value: 154 },
  { name: "江苏", value: 102 },
  { name: "浙江", value: 114 },
  { name: "安徽", value: 109 },
  { name: "福建", value: 116 },
  { name: "江西", value: 91 },
  { name: "山东", value: 119 },
  { name: "河南", value: 137 },
  { name: "湖北", value: 116 },
  { name: "湖南", value: 114 },
  { name: "重庆", value: 101 },
  { name: "四川", value: 125 },
  { name: "贵州", value: 62 },
  { name: "云南", value: 83 },
  { name: "西藏", value: 9 },
  { name: "陕西", value: 80 },
  { name: "甘肃", value: 56 },
  { name: "青海", value: 10 },
  { name: "宁夏", value: 18 },
  { name: "新疆", value: 120 },
  { name: "广东", value: 193 },
  { name: "广西", value: 59 },
  { name: "海南", value: 14 },
];

var option = {
  tooltip: {}, // 提示框组件
  geo: {
    map: "cn", // 地理坐标系
  },
  series: [
    // 地图上的数据
    {
      name: "cn地图",
      type: "map",
      map: "cn",
      data: data,
      itemStyle: {
        areaColor: "#023677",
        borderColor: "#1180c7",
      },
      emphasis: {
        itemStyle: {
          areaColor: "#4499d0",
        },
        label: {
          color: "white",
        },
      },
      select: {
        label: {
          color: "white",
        },
        itemStyle: {
          areaColor: "#4499d0",
        },
      },
    },
    // 散点图，复用地理坐标系
    {
      name: "散点图充电桩",
      type: "effectScatter",
      geoIndex: 0, // geo 支持数组
      coordinateSystem: "geo", // 使用地理坐标系，通过 geoIndex 指定相应的地理坐标系组件。
      data: [
        {
          name: "广东",
          value: [113.280637, 23.125178, 193],
        },
        {
          name: "北京",
          value: [116.405285, 39.904989, 199],
        },
      ],
      symbolSize: function (val) {
        return val[2] / 10;
      },
      itemStyle: {
        color: "yellow",
        shadowBlur: 10,
        shadowColor: "yellow",
      },
    },
  ],
};
```

### 2.地图散点图+地图的数据

```js
var data = [
  { name: "北京", value: 199 },
  { name: "天津", value: 42 },
  { name: "河北", value: 102 },
  { name: "山西", value: 81 },
  { name: "内蒙古", value: 47 },
  { name: "辽宁", value: 67 },
  { name: "吉林", value: 82 },
  { name: "黑龙江", value: 123 },
  { name: "上海", value: 154 },
  { name: "江苏", value: 102 },
  { name: "浙江", value: 114 },
  { name: "安徽", value: 109 },
  { name: "福建", value: 116 },
  { name: "江西", value: 91 },
  { name: "山东", value: 119 },
  { name: "河南", value: 137 },
  { name: "湖北", value: 116 },
  { name: "湖南", value: 114 },
  { name: "重庆", value: 101 },
  { name: "四川", value: 125 },
  { name: "贵州", value: 62 },
  { name: "云南", value: 83 },
  { name: "西藏", value: 9 },
  { name: "陕西", value: 80 },
  { name: "甘肃", value: 56 },
  { name: "青海", value: 10 },
  { name: "宁夏", value: 18 },
  { name: "新疆", value: 120 },
  { name: "广东", value: 193 },
  { name: "广西", value: 59 },
  { name: "海南", value: 14 },
];

var option = {
  tooltip: {}, // 提示框组件
  geo: {
    map: "cn", // 地理坐标系
  },
  series: [
    // 地图上的数据
    {
      name: "cn地图",
      type: "map",
      map: "cn",
      data: data,
      itemStyle: {
        areaColor: "#023677",
        borderColor: "#1180c7",
      },
      emphasis: {
        itemStyle: {
          areaColor: "#4499d0",
        },
        label: {
          color: "white",
        },
      },
      select: {
        label: {
          color: "white",
        },
        itemStyle: {
          areaColor: "#4499d0",
        },
      },
    },
    // 散点图，复用地理坐标系
    {
      name: "散点图充电桩",
      type: "effectScatter",
      geoIndex: 0, // geo 支持数组
      coordinateSystem: "geo", // 使用地理坐标系，通过 geoIndex 指定相应的地理坐标系组件。
      data: [
        {
          name: "广东",
          value: [113.280637, 23.125178, 193],
        },
        {
          name: "北京",
          value: [116.405285, 39.904989, 199],
        },
      ],
      symbolSize: function (val) {
        return val[2] / 10;
      },
      itemStyle: {
        color: "yellow",
        shadowBlur: 10,
        shadowColor: "yellow",
      },
    },
  ],
};
```

### 3.地图+散点图最终的案例

```js
var mapName = "cn";
var data = [
  { name: "北京", value: 199 },
  { name: "天津", value: 42 },
  { name: "河北", value: 102 },
  { name: "山西", value: 81 },
  { name: "内蒙古", value: 47 },
  { name: "辽宁", value: 67 },
  { name: "吉林", value: 82 },
  { name: "黑龙江", value: 123 },
  { name: "上海", value: 154 },
  { name: "江苏", value: 102 },
  { name: "浙江", value: 114 },
  { name: "安徽", value: 109 },
  { name: "福建", value: 116 },
  { name: "江西", value: 91 },
  { name: "山东", value: 119 },
  { name: "河南", value: 137 },
  { name: "湖北", value: 116 },
  { name: "湖南", value: 114 },
  { name: "重庆", value: 101 },
  { name: "四川", value: 125 },
  { name: "贵州", value: 62 },
  { name: "云南", value: 83 },
  { name: "西藏", value: 9 },
  { name: "陕西", value: 80 },
  { name: "甘肃", value: 56 },
  { name: "青海", value: 10 },
  { name: "宁夏", value: 18 },
  { name: "新疆", value: 120 },
  { name: "广东", value: 193 },
  { name: "广西", value: 59 },
  { name: "海南", value: 14 }
];

var geoCoordMap = {};

/* 获取地图数据 */
myChart.showLoading();
var mapFeatures = echarts.getMap(mapName).geoJson.features;

mapFeatures.forEach(function (v) {
  // 地区名称
  var name = v.properties.name;
  // 地区经纬度
  geoCoordMap[name] = v.properties.cp;
});

myChart.hideLoading();
console.log("data=>", data);
console.log("geoCoordMap=>", geoCoordMap);

var convertData = function (data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var geoCoord = geoCoordMap[data[i].name];
    if (geoCoord) {
      res.push({
        name: data[i].name,
        value: [...geoCoord, data[i].value],
      });
    }
  }
  console.log("res=>", res);
  return res;
};

// 指定图表的配置项和数据
var option = {
  tooltip: {},
  visualMap: {
    left: "20%",
    seriesIndex: [0],
    inRange: {
      color: ["#04387b", "#467bc0"] // 蓝绿
    }
  },
  geo: {
    map: "cn",
    roam: false,
    label: { show: false },
    aspectScale: 0.75,
    itemStyle: {
      areaColor: "#023677",
      borderColor: "#1180c7"
    },
    emphasis: {
      itemStyle: { areaColor: "#4499d0" },
      label: { color: "white" }
    }
  },
  series: [
    {
      name: "cn地图",
      type: "map",
      map: "cn",
      data,
      itemStyle: {
        areaColor: "#023677",
        borderColor: "#1180c7"
      },
      emphasis: {
        itemStyle: { areaColor: "#4499d0" },
        label: { color: "white" }
      },
      select: {
        label: { color: "white" },
        itemStyle: { areaColor: "#4499d0" }
      }
    },
    {
      name: "散点图充电桩",
      type: "effectScatter",
      geoIndex: 0,
      coordinateSystem: "geo",
      data: convertData(data),
      symbolSize: function (val) {
        return val[2] / 10;
      },
      itemStyle: {
        color: "yellow",
        shadowBlur: 10,
        shadowColor: "yellow"
      },
      tooltip: {
        show: true,
        trigger: "item",
        formatter: function (params) {
          console.log(params);
          var data = params.data;
          return `${params.seriesName} <div style="margin:5px 0px;"/> ${data.name} ${data.value[2]}`;
        }
      }
    }
  ]
};

```

## 5.ECharts API

### 1.响应式图表

```js
// 响应式图表
window.addEventListener("resize", function () {
  console.log("resize");
  myChart.resize(); // 可以接收一个对象，传递修改后的宽和高
  // myChart.resize({ height: "600px" });
});
```

### 2.自动轮播提示框

```js
// 自动轮播图 bar
setInterval(function () {
  autoToolTip();
}, 1000);

let index = 0; // 0-5

function autoToolTip() {
  index++;
  if (index > 5) {
    index = 0;
  }
  
  // 显示提示框
  myChart.dispatchAction({
    type: "showTip",    // 触发的 action type
    seriesIndex: 0,     // 系列的索引
    dataIndex: index,   // 数据项的索引
    position: "top"     // 提示框位置
  });
}

```

### 3.图表点击事件(地图下钻)

```js
// 监听鼠标点击事件
myChart.on("click", function (event) {
  console.log(event);
  
  if (event.name === "广东") {
    option.geo.map = "gd";
    myChart.setOption(option);
  }
});
```