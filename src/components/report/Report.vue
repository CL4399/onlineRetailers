<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 2、为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1、  导入echarts（可视化数据图表库）
import echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'report',
  data() {
    return {
      //        根据接口文档需求，需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  //         vue生命周期mounted，此时页面上的DOM已经被渲染出来了，就可以初始化图表了
  async mounted() {
    // 3、基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 获取折线图数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }
    // 4、准备数据和配置项
    const result = _.merge(res.data, this.options)
    // 5、展示数据
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="stylus" scoped></style>
