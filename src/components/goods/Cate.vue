<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treetable"
        :data="cateList"
        :columns="columns"
        index-text="#"
        :show-index="true"
        :expand-type="false"
        :selection-type="false"
        :border="true"
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="cateClick(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateId(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
      width="50%"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分级分类:">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象  -->
          <!-- clearable让选择的分类可以清空 -->
          <!-- change-on-select 让选择器能够选择二级级分类 -->
          <el-cascader
            clearable
            change-on-select
            v-model="selecteKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分类编辑对话框 -->
    <el-dialog title="修改分类" :visible.sync="cateDialogVisible" width="50%">
      <el-form :model="CateRuleForm" :rules="cateRules" ref="CateRulesForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="CateRuleForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cateRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'cate',
  data() {
    return {
      //                        商品分类的数据列表，默认为空
      cateList: [],
      //                        总的数据条数
      total: 0,
      //                        查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //                         控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //                         添加分类表单的数据对象
      addCateForm: {
        //                       将要添加的分类名称
        cat_name: '',
        //                       父级分类的id
        cat_pid: 0,
        //                       分类等级默认添加的是一级分类
        cat_level: 0
      },
      //                         添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
        ]
      },
      //                        为tree-tabel指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //                    将当前列定义为模板列
          type: 'template',
          //                    表示当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          //                    将当前列定义为模板列
          type: 'template',
          //                    表示当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          //                    将当前列定义为模板列
          type: 'template',
          //                    表示当前列使用的模板名称
          template: 'opt'
        }
      ],
      //                        父级分类的列表数据
      parentCateList: [],
      //                         指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //                        选中的父级分类的id数组
      selecteKeys: [],
      //                        定义编辑分类对话框的显示与隐藏
      cateDialogVisible: false,
      //                        储存查询到的分类数据
      CateRuleForm: {},
      //                        修改分类名称的表单验证
      cateRules: {
        cat_name: [
          { required: true, message: '请输入分类名', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //                           获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // console.log(res.data)
      //                         把数据列表赋值给cateList
      this.cateList = res.data.result
      //                         把数据列表的总数据条数赋值给total
      this.total = res.data.total
    },
    //                           监听 pagesize改变事件
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    //                           监听 pagenum的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    //                           点击按钮显示添加分类对话框
    showAddCateDialog() {
      //                         先获取父级分类数据列表
      this.getParentCateList()
      //                         再展示对话框
      this.addCateDialogVisible = true
    },
    //                           获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    //                           级联选择项发生变化触发这个change函数
    parentCateChanged() {
      // console.log(this.selecteKeys)
      // 如果selecteKeys    数组中的    length > 0 说明选中了父级分类
      // 反之    就说明没有选中任何父级分类
      if (this.selecteKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selecteKeys[this.selecteKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selecteKeys.length
        // eslint-disable-next-line no-useless-return
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    //                           点击按钮添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //                           监听添加分离对话框的关闭事件
    addCateDialogClosed() {
      //                         清空form表单
      this.$refs.addCateFormRef.resetFields()
      //                         清空数组
      this.selecteKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    //                            点击按钮弹出分类编辑对话框
    async cateClick(id) {
      // console.log(this.cateList)
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.CateRuleForm = res.data
      // console.log(this.CateRuleForm)
      this.cateDialogVisible = true
    },
    //                  监听分类修改对话框的关闭事件
    editDialogClose() {
      this.$refs.CateRulesForm.resetFields()
    },
    //                            点击按钮修改分类信息并预验证
    cateRoleInfo() {
      this.$refs.CateRulesForm.validate(async valid => {
        if (!valid) return
        // console.log(this.editForm.roleId)
        //              发起修改分类信息的数据请求
        const { data: res } = await this.$http.put(
          `categories/${this.CateRuleForm.cat_id}`,
          {
            cat_name: this.CateRuleForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类信息失败!')
        }
        //                关闭对话框
        this.cateDialogVisible = false
        //                刷新数据列表
        this.getCateList()
        //                提示修改成功
        this.$message.success('更新用户信息成功!')
      })
    },
    //                  点击按钮弹出是否删除角色信息对话框
    async removeCateId(id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        '是否永久删除分类信息?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 点击确认返回confirm
      // 点击取消返回 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      //                刷新数据列表
      this.getCateList()
      this.$message.success('删除成功！')
    }
  }
}
</script>

<style lang='stylus' scoped>
.treetable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
