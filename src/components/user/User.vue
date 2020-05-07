<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="15">
          <el-input placeholder="请输入内容" @clear="getUserList" clearable v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"></el-switch>
          </template>-->
          <template v-slot="{row}">
            <!-- {{row}} -->
            <el-switch v-model="row.mg_state" @change="userStatChange(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="181px">
          <template v-slot="{row}">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              size="mini"
              @click="showEditDialog(row.id)"
              icon="el-icon-edit"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeUserID(row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框-->
    <el-dialog @close="addDialogClose" title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog @close="editDialogClose" title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input :disabled="true" v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleIndo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'user',
  data() {
    //                           验证邮箱的校验规则
    var checkEmail = (rule, value, cb) => {
      //                      验证邮箱的正则表达式
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        //                      合法邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    //                           验证手机号的校验规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (regMobile.test(value)) {
        //                          合法手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      //                         获取用户列表的参数对象
      queryInfo: {
        query: '',
        //                          当前页数
        pagenum: 1,
        //                      当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //                         控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //                         添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //                         添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 8, message: '长度在 4 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号格式不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      //                        控制修改用户的对话框显示与隐藏
      editDialogVisible: false,
      //                        存储查询到的用户数据
      editForm: {},
      //                        修改用户的表单验证
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            validator: checkEmail,
            message: '邮箱格式不正确，请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '手机号格式不正确，请重新输入',
            trigger: 'blur'
          }
        ]
      },
      //                        控制分配角色对话框
      setDialogVisible: false,
      //                        需要被分配角色的用户信息
      userInfo: {},
      //                        所有角色数据列表
      rolesList: [],
      //                         以选中的角色id值
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表信息
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(this.userlist)
      // console.log(this.total)
    },
    //                    监听 pagesize  改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      //                  当显示多少条数据发生改变的时候就重新获取数据
      this.getUserList()
    },
    //                    监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      //                  当第几页发生改变的时候就重新获取数据
      this.getUserList()
    },
    //                    监听switch 开关状态的改变
    async userStatChange(userinfo) {
      // console.log(userinfo)
      // console.log(this.userlist)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    //                    监听用户添加对话框的关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //                    点击按钮添加新用户并预验证
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //                可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //                隐藏添加用户对话框
        this.addDialogVisible = false
        //                重新获取用户列表数据
        this.getUserList()
      })
    },
    //                  展示用户编辑的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      // console.log(this.editForm.id)
      this.editDialogVisible = true
    },
    //                  监听用户修改对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //                  点击按钮修改用户并预验证
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //              发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }
        //                关闭对话框
        this.editDialogVisible = false
        //                刷新数据列表
        this.getUserList()
        //                提示修改成功
        this.$message.success('更新用户信息成功!')
      })
    },
    //                  点击按钮弹出是否删除用户信息对话框
    async removeUserID(id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        '是否永久删除用户信息?',
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
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      //                刷新数据列表
      this.getUserList()
      this.$message.success('删除成功！')
    },
    //                  展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      //                在展示对话框之前先获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      this.setDialogVisible = true
    },
    //                  点击确定提交新分配的角色
    async saveRoleIndo() {
      //                 判断是否选择的新的角色
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      //                  发起分配角色请求
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setDialogVisible = false
    },
    //                  监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang='stylus' scoped>
.el-breadcrumb {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}

.el-table {
  margin-top: 15px;
  font-size: 12px;
}
</style>
