<template>
  <div class="div">
    <vue-particles
      color="#fff"
      :particleOpacity="0.7"
      :particlesNumber="60"
      shapeType="star"
      :particleSize="4"
      linesColor="#fff"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="2"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    ></vue-particles>
    <div class="top">
      <div class="img">
        <img src="../assets/logo.png" alt="Logo" />
      </div>
      <h1>用户登录</h1>
      <div class="land">
        <el-form
          class="loginForm"
          :model="loginForm"
          :rules="loginFormRules"
          ref="loginFormRef"
          label-width="0px"
        >
          <el-form-item prop="username">
            <el-input class="username" placeholder="请输入用户名" v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              class="password"
              placeholder="请输入密码"
              show-password
              v-model="loginForm.password"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button class="button-one" type="primary" @click="login">登录</el-button>
            <el-button class="button-two" type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
export default {
  name: 'Login',
  data () {
    return {
      // 这是登录表单数据绑定对象 el-fomr中绑定   :model="loginForm"
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名 el-form-item中绑定 prop="username"
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 8, message: '长度在 4 到 8 个字符', trigger: 'blur' }
        ],
        // 验证密码  同上
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置表单 el-form中绑定   ref="loginFormRef"
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败!')
        this.$message.success('登录成功!')
        // console.log(res.data.token)
        // 将后台的token保存在本地的sessionStorage里面实现登录状态的保存
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转成功跳转到Home组件中
        this.$router.push('/Home')
      })
    }
  }
}
</script>

<style lang='stylus' scoped>
.div {
  background: radial-gradient(200% 100% at bottom center, #f7f7b6, #e96f92, #1b2947);
  background: radial-gradient(220% 105% at top center, #1b2947 10%, #75517d 40%, #e96f92 65%, #f7f7b6);
  background-attachment: fixed;
  width: 100%;
  height: 100%;
  position: absolute;
}

#particles-js {
  width: 100%;
  height: 100%;
  position: absolute; // 设置absolute,其他DIV设置为relative，这样这个例子效果就作为背景
  z-index: 1;
}

.top {
  width: 35rem;
  height: 20rem;
  background: #fff;
  border-radius: 1rem;
  position: absolute;
  top: 25%;
  left: 40%;
  text-align: center;
  color: #ccc;
  z-index: 1;

  h1 {
    opacity: 0;
  }
}

.img {
  position: absolute;
  top: -50%;
  left: 30%;
  border: 0.8rem solid #fff;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0.002rem 0.002rem 2rem #fff;
  background: #eee;
}

.loginForm {
  padding: 0 3rem;
}

.button-one {
  margin-right: 5rem;
  margin-top: 2rem;
  width: 8rem;
}

.button-two {
  width: 8rem;
}
</style>
