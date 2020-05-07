<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" width="90px" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" width="70px" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" width="140px" prop="add_time">
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[5, 10, 15, 20]"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'list',
  data() {
    return {
      //                查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //                商品列表数据
      goodsList: [],
      //                总数据条数
      total: 0
    }
  },
  created() {
    //                  根据分页获取对应的商品列表
    this.getGoodsList()
  },
  methods: {
    //                  根据分页获取对应数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.$message.success('获取商品列表成功！')
      // console.log(res.data)
      //                对获取到的数据进行拆分赋值，只取需要的
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //                  只有触发了这个函数就拿到新的size
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //                  只有触发了这个函数就拿到最新的页码值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    //                  点击按钮根据对应ID删除对应数据
    async removeById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('是否永久删除该商品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 点击确认返回confirm
      // 点击取消返回 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      //                刷新数据列表
      this.$message.success('删除成功！')
      this.getGoodsList()
    },
    //                  点击添加按钮跳转到添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='stylus' scoped></style>
