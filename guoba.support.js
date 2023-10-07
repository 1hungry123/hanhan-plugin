import { Config } from './utils/config.js'
import path from 'path'

export function supportGuoba () {
  return {
    // 插件信息，将会显示在前端页面
    // 如果你的插件没有在插件库里，那么需要填上补充信息
    // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
    pluginInfo: {
      name: 'hanhan-plugin',
      title: 'hanhan-Plugin',
      author: '@1hungry123 @LINKlang',
      authorLink: 'https://github.com/1hungry123',
      link: 'https://github.com/1hungry123/hanhan-plugin',
      isV3: true,
      isV2: false,
      description: '基于hanhan娱乐',
      icon: 'mdi:stove',
      iconColor: '#d19f56',
      iconPath: path.join(
        process.cwd() + '/plugins/hanhan-plugin/resources/readme/logo.jpg'
      )
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          field: 'pingToken',
          label: 'ping',
          bottomHelpMessage: '填写后才能使用ping指令，请前往 https://ipinfo.io 注册账号并将获取到的token配置到这里',
          component: 'Input'
        },
        {
          field: 'proxyUrl',
          label: '代理',
          bottomHelpMessage: '用于访问外网资源，http或socks5代理,例如：http://127.0.0.1:7890',
          component: 'Input'
        },
        {
          field: 'chromeF',
          label: '浏览器路径',
          bottomHelpMessage: '关闭无头模式时，用于真打开浏览器',
          component: 'Input'
        },
        {
          field: 'noie',
          label: '无头模式',
          bottomHelpMessage: '关闭无头模式会真打开浏览器进行截图',
          component: 'Switch'
        },
        {
          field: 'tmdbkey',
          label: 'tmdb key',
          bottomHelpMessage: 'tmdb官网获取的key，请前往https://developer.themoviedb.org/docs 注册账号并将获取到的key配置到这里',
          component: 'Input'
        },
        {
          field: 'sysecho',
          label: '搜一搜搜索提示词',
          bottomHelpMessage: '个性化搜一搜搜索提示词',
          component: 'Input'
        },
        {
          field: 'sysecho0',
          label: '搜一搜搜索error提示词',
          bottomHelpMessage: '个性化搜一搜搜索error提示词',
          component: 'Input'
        },
        {
          field: 'sysgqjt',
          label: '搜一搜截图高清放大倍率',
          bottomHelpMessage: '数字越大，截图时越清晰，注意不要超过4，因为tx无法发送过大的图片',
          component: 'InputNumber',
          componentProps: {
            min: 1,
            max: 100
          }
        },
        {
          field: 'gdkey',
          label: '高德key',
          bottomHelpMessage: '高德官网获取的key，请前往https://lbs.amap.com/ 注册账号并将获取到的key配置到这里',
          component: 'Input'
        },
        {
          field: 'studyGroups',
          label: '每日英语分享群组',
          bottomHelpMessage: '填入后将向所填群每天早上自动分享每日英语,群号请使用 , 或 : 分隔开',
          component: 'Input'
        }

      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData () {
        return Config
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData (data, { Result }) {
        for (let [keyPath, value] of Object.entries(data)) {
          if (keyPath === 'studyGroups') { value = value.toString().split(/[,，;；|]/) }
          if (Config[keyPath] !== value) { Config[keyPath] = value }
        }
        return Result.ok({}, '保存成功~')
      }
    }
  }
}
