<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环  嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环item2的children 渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoleId(scope.row.id)"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog @close="addDialogClose" title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addRole" :rules="Rules" ref="addRoleRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog @close="editDialogClose" title="修改角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data() {
    var checkDesc = (rule, value, cb) => {
      const regDesc = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/
      if (regDesc.test(value)) {
        // 合法描述
        return cb()
      }
      cb(new Error('请不要带有特殊字符'))
    }
    return {
      //                        所有角色列表数据
      roleList: [],
      //                         添加角色
      addRole: {
        roleName: '',
        roleDesc: ''
      },
      //                        控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色表单验证规则
      Rules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            validator: checkDesc,
            message: '请不要带有特殊字符',
            trigger: 'blur'
          }
        ]
      },
      //                        存储查询到的角色数据
      editForm: {},
      //                        控制修改角色的对话框显示与隐藏
      editDialogVisible: false,
      //                        修改角色的表单验证
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            validator: checkDesc,
            message: '请不要带有特殊字符',
            trigger: 'blur'
          }
        ]
      },
      //                        控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //                         所有权限列表数据
      rightslist: [],
      //                        树形控件的属性绑定对象用以显示名称和子名称
      treeProps: {
        //                      label是确定一级权限的名字
        label: 'authName',
        //                      children是确定显示那些子权限
        children: 'children'
      },
      //                        默认选中的节点id值数组
      defKeys: [],
      //                        当前即将分配权限的角色 id
      roleId: ''
    }
  },
  created() {
    //                   获取所有权限
    this.getRolesList()
  },
  methods: {
    //                   获取权限列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },
    addDialogClose() {
      this.$refs.addRoleRef.resetFields()
    },
    addrole() {
      // console.log(this.addRole)
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return
        //                可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addRole)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        //                隐藏添加用户对话框
        this.addDialogVisible = false
        //                重新获取用户列表数据
        this.getRolesList()
      })
    },
    //                  展示用户编辑的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      // console.log(this.editForm.roleId)
      this.editDialogVisible = true
    },
    //                  监听用户修改对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //                  点击按钮修改用户并预验证
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // console.log(this.editForm.roleId)
        //              发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }
        //                关闭对话框
        this.editDialogVisible = false
        //                刷新数据列表
        this.getRolesList()
        //                提示修改成功
        this.$message.success('更新用户信息成功!')
      })
    },
    //                  点击按钮弹出是否删除角色信息对话框
    async removeRoleId(id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        '是否永久删除角色信息?',
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      //                刷新数据列表
      this.getRolesList()
      this.$message.success('删除成功！')
    },
    //                  根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否删除该权限
      const confirmResult = await this.$confirm('是否永久删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      //                刷新数据列表
      role.children = res.data
      this.$message.success('删除成功！')
    },
    //                  展示分配权限的对话框
    async showSetRightDialog(role) {
      // 将当前角色的id 添加到roleId中
      this.roleId = role.id
      //                 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！！！')
      }
      //                把获取到的权限数据保存在本地rightslist数组
      this.rightslist = res.data
      // console.log(this.rightslist)

      //                 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      //                  展开属性结构
      this.setRightDialogVisible = true
    },
    //                  通过递归的形式  获取角色下所有的三级权限的id并保存至defKeys中
    getLeafKeys(node, arr) {
      //                如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //                  监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      //                用来每次关闭对话框后都清空数组里面的内容
      this.defKeys = []
    },
    //                   点击为角色添加权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      //                 文档要求 以 `,` 分割的权限 ID 列表
      const idStr = keys.join(',')
      //                  发起分配角色权限请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败！！！')
      }
      this.$message.success('分配角色权限成功！')
      //                    刷新权限列表
      this.getRolesList()
      //                    关闭对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang='stylus' scoped>
.el-card {
  margin-top: 15px;
}

.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
