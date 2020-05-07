<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息!" center :closable="false" show-icon type="info"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        class="el-steps"
        :space="200"
        :active="activeindex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs
          v-model="activeindex"
          :tab-position="'left'"
          @tab-click="tabClicked"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>

            <!-- 级联选择器 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChanged"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--
                  action    表示图片要上传到的后台API地址
                  list-type 指定图片显示的方式
                  on-success 是只有图片上传成功就调用这个函数（用来进行图片上传成功之后的操作）
            -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'add',
  data() {
    return {
      //                      所有商品分类列表
      cateList: [],
      //                      步骤条与tab栏的激活索引
      activeindex: '0',
      //                      添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //                    商品所属的分类数组
        goods_cat: [],
        //                      图片的数组
        pics: [],
        //                      商品详情描述
        goods_introduce: '',
        attrs: []
      },
      //                      表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //                      级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //                         动态参数列表数组
      manyTabData: [],
      //                         静态属性列表数据
      onlyTabData: [],
      //                         图片上传的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //                          图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //                          存储图片预览路径
      previewPath: '',
      //                          控制图片预览对话框的显示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //                          获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败！')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    //                          级联选择器选中项变化，会触发这个函数
    handleChanged() {
      // console.log(this.addForm.goods_cat)
      //                        控制选择范围
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //                          让用户必须选择三级分类后才能进入其他页面
    beforeTabLeave(activeName, oldActiveName) {
      /* console.log('即将离开的标签页名字' + oldActiveName)
      console.log('即将进入的标签页名字' + activeName)
      return false */
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    //                          让对应的页面显示对应的数据
    async tabClicked() {
      //                      如果等于1的话，证明访问的是动态参数页面
      if (this.activeindex === '1') {
        // console.log('动态参数面板')
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        //  将res.data里面的attr_vals进行转成成数组的操作
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        //  console.log(res.data)
        this.manyTabData = res.data
        // console.log(this.manyTabData)
      } else if (this.activeindex === '2') {
        // console.log('动态参数面板')
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数列表失败！')
        }
        // console.log(res.data)
        this.onlyTabData = res.data
        // console.log(this.manyTabData)
      }
    },
    //                          处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    //                          处理移出图片的操作
    handleRemove(file) {
      // console.log(file)
      //  1、   获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path
      //  2、   从pics  数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      //  3、   调用数组的 splice  方法把图片信息对象，从pics中移除
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },
    //                          监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response)
      // 1、 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2、 将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    //                          添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        //                      表单预校验
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        //                      执行添加的逻辑
        /*
          对数据根据接口文档进行改造
          先对goods_cat(分类列表)进行深拷贝：
            先用一个lodash包  这个包里面有个很好用的方法 cloneDeep(obj)
            goods_cat接口文档需要 以逗号隔开的字符串，
            我们先引入lodash库，定义引入名字是   _  下划线
            然后使用其中的cloneDeep的深拷贝方法，将this.addForm.goods_cat进行深拷贝、
            并赋值给新的常量form，最后将新的常量form进行数组的join方法分割成字符串
        */
        //                       改造分类列表
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //                        处理商品动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        //                        处理商品静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)
        //                         发起请求添加商品
        //                          商品名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang='stylus' scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
