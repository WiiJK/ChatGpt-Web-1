import { getCode } from '@/request/api'
import { userAsync } from '@/store/async'
import { RequestLoginParams } from '@/types'
import {
  HeartFilled,
  LockOutlined,
  MailOutlined,
  RedditCircleFilled,
  SlackCircleFilled,
  TwitterCircleFilled
} from '@ant-design/icons'
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-form'
import { Form, FormInstance, Modal, Space, Tabs } from 'antd'
import { useState } from 'react'
import { useNavigation, useLocation } from 'react-router-dom'

type Props = {
  open: boolean
  onCancel: () => void
}

type LoginType = 'code' | 'password' | 'register' | string;

export function LoginCard(props: {
  form: FormInstance<RequestLoginParams>
  onSuccess: () => void,
  type?: LoginType
}) {

  const location = useLocation();

  function getQueryParam(key: string) {
    const queryString = location.search || window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(key) || '';
  }

  const { type = 'password' } = props;

  const [loginType, setLoginType] = useState<LoginType>(type);

  return (
    <LoginForm<RequestLoginParams>
      form={props.form}
      logo="https://img-view-c-sz.drive.quark.cn/bo2dzZ1p/2324846460/649310eb8d36ae2a3ba1446383192532f03f8f0c/649310eb8706ef67118a47b386979b3d43b4ca19/preview_png?auth_key=1687370611-22-10800-4f92c046af063649a9a458bd410ae028&sp=199&token=2-4df4595c3b9a2189523025312e289af2-0-3-1024-e7c4e04fc21e4a20838e3d7ade0b818f-e52d6155b423384fb38e5b743d1eec8c"
      title="Hello"
      subTitle="星球新能独家人工智能对话——解决你的种种忧虑"
      actions={(
        <Space>
          <HeartFilled />
          <RedditCircleFilled />
          <SlackCircleFilled />
          <TwitterCircleFilled />
        </Space>
      )}
      contentStyle={{
        width: '100%',
        maxWidth: '340px',
        minWidth: '100px'
      }}
      submitter={{
        searchConfig: {
          submitText: loginType === 'register' ? '注册&登录' : '登录',
        }
      }}
      onFinish={async (e) => {
        return new Promise((resolve, reject) => {
          userAsync
            .fetchLogin({ ...e, invite_code: getQueryParam('invite_code') })
            .then((res) => {
              if (res.code) {
                reject(false)
                return
              }
              props.onSuccess?.()
              resolve(true)
            })
            .catch(() => {
              reject(false)
            })
        })
      }}
    >
      <Tabs
        centered
        activeKey={loginType}
        onChange={(activeKey) => {
          setLoginType(activeKey)
        }}
        items={[
          {
            key: 'password',
            label: '密码登录',
          },
          {
            key: 'code',
            label: '邮箱登录',
          },
          {
            key: 'register',
            label: '注册账号',
          },
        ]}
      />
      <ProFormText
        fieldProps={{
          size: 'large',
          prefix: <MailOutlined />
        }}
        name="account"
        placeholder="邮箱"
        rules={[
          {
            required: true,
            message: '请输入电子邮箱',
            pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
          }
        ]}
      />
      {
        loginType !== 'password' && (
          <ProFormCaptcha
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />
            }}
            captchaProps={{
              size: 'large'
            }}
            placeholder="验证码"
            captchaTextRender={(timing, count) => {
              if (timing) {
                return `${count} ${'获取验证码'}`
              }
              return '获取验证码'
            }}
            name="code"
            rules={[
              {
                required: true,
                message: '请输入验证码！'
              }
            ]}
            onGetCaptcha={async () => {
              const account = props.form.getFieldValue('account')
              if (!account || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(account)) {
                props.form.setFields([
                  {
                    name: 'account',
                    errors: ['请输入有效的邮箱地址']
                  }
                ])
                return Promise.reject()
              }
              return new Promise((resolve, reject) =>
                getCode({ source: account })
                  .then(() => resolve())
                  .catch(reject)
              )
            }}
          />
        )
      }
      {
        loginType !== 'code' && (
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className={'prefixIcon'} />,
            }}
            placeholder="请输入密码"
            rules={[
              {
                required: true,
                message: '8位及以上至少包含一个字母和一个数字',
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
              },
            ]}
          />
        )
      }
      {/* <ProFormText
        name="invite_code"
        fieldProps={{
          size: 'large',
          prefix: <LockOutlined className={'prefixIcon'} />,
        }}
        placeholder="请输入密码"
        rules={[
          {
            required: true,
            message: '8位及以上至少包含一个字母和一个数字',
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
          },
        ]}
      /> */}
      <div
        style={{
          marginBlockEnd: 24
        }}
      />
    </LoginForm>
  )
}

// 登录注册弹窗
function LoginModal(props: Props) {
  const [loginForm] = Form.useForm()

  const onCancel = () => {
    props.onCancel()
    loginForm.resetFields()
  }

  return (
    <Modal open={props.open} footer={null} destroyOnClose onCancel={onCancel}>
      <LoginCard form={loginForm} onSuccess={onCancel} />
    </Modal>
  )
}

export default LoginModal
