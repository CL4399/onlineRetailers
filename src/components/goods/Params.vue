<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数!" :closable="false" show-icon type="warning"></el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象  -->
          <!-- clearable让选择的分类可以清空 -->
          <!-- change-on-select 让选择器能够选择二级级分类 -->
          <el-cascader
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="cateChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab  页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  @close="handleClose(i, scope.row)"
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  @close="handleClose(i, scope.row)"
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed"
      width="50%"
    >
      <!-- 添加参数或者属性的form表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+ titleText"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      width="50%"
    >
      <!-- 添加参数或者属性的form表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'params',
  data() {
    return {
      cateList: [],
      //                   级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //                    级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //                    被激活的页签名称
      activeName: 'many',
      //                    动态参数数据
      manyTableData: [],
      //                    静态参数的数据
      onlyTableData: [],
      //                    控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      //                     添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      //                      添加表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' }
        ]
      },
      //                      控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //                       修改的表单数据对象
      editForm: {},
      //                        修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //                    获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      //                      将数据赋值给cateList
      this.cateList = res.data
      // console.log(res.data)
    },
    //                        级联选择框变化会触发这个函数
    cateChanged() {
      //                        调用获取参数列表函数
      this.getParamsData()
    },
    //                        Tab页签点击事件的处理函数
    handleTabClick() {
      //                      调用获取参数列表函数
      this.getParamsData()
      console.log(this.activeName)
    },
    //                       获取参数的列表数据的函数
    async getParamsData() {
      // console.log(this.selectedCateKeys)
      //                     证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      //                    证明选中的是三级分类
      // console.log(this.selectedCateKeys)
      //                    根据所选分类的id和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      //   console.log(res.data)
      //   通过forEach循环将res.data里面的attr_vals属性原来的字符串形式的数据，变成数组的形式
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //                   控制new tag文本框的显示与隐藏
        item.inputVisible = false
        //                    文本框中输入的值，默认为空
        item.inputValue = ''
      })
      // console.log(res.data)
      /*
        获取到的数据用if判断，如果是动态参数就存在manyTableData里面，
        如果是静态参数就存到onlyTableData里面
      */
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //                        监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //                        点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    //                        点击按钮展示修改对话框
    async showEditDialog(id) {
      //                       查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //                        监听修改对话框的关闭事件（清空表单）
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //                        点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //                        文本框失去焦点或者按下enter键都会触发
    handleInputConfirm(row) {
      //                      判断inputValue是否为空
      //                      trim的作用是去除字符串两端的空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //                      如果没有return就说明输入了内容，并且需要进行后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //                      需要发起请求保存新的tag
      this.saveAttrVals(row)
    },
    //                        根据id删除对应的参数项
    async removeParams(id) {
      //                      根据id删除对应的参数或属性
      //                      弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '请问是否要删除该' + this.titleText,
        '删除提示',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //                      如果用户点击确认，则confirmResult 为'confirm'
      //                      如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      //                      没有取消删除,发送请求完成删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数数据失败')
      }
      this.$message.success('删除' + this.titleText + '数据成功')
      this.cateChanged()
    },
    //                         点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //                        让文本框自动获得焦点
      /*
        $nextTick  方法的作用，就是当页面上元素被重新渲染后，才会指定回调函数中的代码
        因为当inputVisible = true的时候文本框还没出来，所以需要用$nextTick这个方法，
        当这个方法被执行时就代表文本框被渲染出来了，此时就可以用input的focus方法直接获取焦点了

     */
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //                          删除对应的参数选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    //                          将对attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          /*
            【注】因为我们在获取attr_vals参数的时候将字符串的数据格式改为了数组
            所以我们在提交参数的时候需要将数组数据格式变回字符串的格式
            所以是row.attr_vals.join(' ')
          */
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      }
      this.$message.success('修改参数项成功')
    }
  },
  computed: {
    //                      如果按钮需要禁用，则返回true否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //                      当前选中的三级分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //                      动态计算添加参数对话框的标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang='stylus' scoped>
.cat_opt {
  margin-top: 15px;
}

.el-tag {
  margin-left: 5px;
}

.input-new-tag {
  width: 120px;
}
</style>
