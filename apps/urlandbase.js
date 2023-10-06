import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import axios from 'axios'

export class urlAndBase extends plugin {
  constructor () {
    super({
      name: '憨憨编码和接口访问',
      dsc: '憨憨编码和接口访问',
      event: 'message',
      priority: 6,
      rule: [
        {
          reg: '^#?(url|URL)编码',
          fnc: 'urlEn'
        },
        {
          reg: '^#?(url|URL)解码',
          fnc: 'urlDe'
        },
        {
          reg: '^#?(base64|Base64)编码',
          fnc: 'baseEn'
        },
        {
          reg: '^#?(base64|Base64)解码',
          fnc: 'baseDe'
        },
        {
          reg: '^#?访问',
          fnc: 'fw'
        },
        {
          reg: '^#?图片',
          fnc: 'tp'
        },
        {
          reg: '^#?图链',
          fnc: 'tl'
        }
      ]
    })
  }

  // 获取图片直链
  async tl (e) {
    let forwardMsgs = []
    if (!e.img) return e.reply('发送内容里没有图片', true)
    if (e.img.length == 1) {
      return e.reply(e.img)
    }
    for (let i = 0; i < e.img.length; i++) {
      forwardMsgs.push('图片' + (i + 1) + '：' + e.img[i] + '\n')
    }
    e.reply(forwardMsgs.join('').trim())
  }

  // 访问图片接口
  async tp (e) {
    let url = e.msg.replace(/^#?图片/, '').trim()
    if (!url) return e.reply('你的图片接口呢，你想无中生有？', true)
    if (url.startsWith('http')) {
      e.reply(segment.image(url))
    }
  }

  // 访问文字接口
  async fw (e) {
    let url = e.msg.replace(/^#?访问/, '').trim()
    if (!url) return e.reply('你的接口呢，你想无中生有？', true)
    if (url.startsWith('http')) {
      axios.get(url)
        .then((response) => {
          const contentType = response.headers['content-type']
          if (contentType && contentType.includes('application/json')) {
            console.log(JSON.stringify(response.data))
            e.reply(JSON.stringify(response.data))
          } else if (contentType && contentType.includes('text/html')) {
          // 响应数据是文本类型
            console.log(response.data)
            e.reply(response.data)
          } else {
          // 未知类型或错误
            e.reply('未知类型接口，请确认接口返回类型是json或text')
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  // url编码
  async urlEn (e) {
    let encode = e.msg.replace(/^#?(url|URL)编码/, '').trim()
    if (!encode) return e.reply('输入不能为空', true)
    let result = encodeURI(encode)
    await this.reply(result, true)
  }

  // url解码
  async urlDe (e) {
    let encode = e.msg.replace(/^#?(url|URL)解码/, '').trim()
    if (!encode) return e.reply('输入不能为空', true)
    let result = decodeURI(encode)
    await this.reply(result, true)
  }

  // base64编码
  async baseEn (e) {
    let encode = e.msg.replace(/^#?(base64|Base64)编码/, '').trim()
    if (!encode) return e.reply('输入不能为空', true)
    let result = Buffer.from(encode).toString('base64')
    await this.reply(result, true)
  }

  // base64解码
  async baseDe (e) {
    let encode = e.msg.replace(/^#?(base64|Base64)解码/, '').trim()
    if (!encode) return e.reply('输入不能为空', true)
    let result = Buffer.from(encode, 'base64').toString()
    await this.reply(result, true)
  }
}
