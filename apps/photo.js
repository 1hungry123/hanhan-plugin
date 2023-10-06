import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import axios from 'axios'
import { Config } from '../utils/config.js'
import { endingSpeech, followMe, pepTalk } from '../utils/const.js'
import { sleep } from '../utils/common.js'

export class photo extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '憨憨图片类',
      /** 功能描述 */
      dsc: '憨憨图片类',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 6,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?天气',
          /** 执行方法 */
          fnc: 'tianqi'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?mc酱$',
          /** 执行方法 */
          fnc: 'mc'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?小c酱$',
          /** 执行方法 */
          fnc: 'xiaoc'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?兽猫酱$',
          /** 执行方法 */
          fnc: 'shoumao'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?买家秀$',
          /** 执行方法 */
          fnc: 'buyerShow'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?mt$',
          /** 执行方法 */
          fnc: 'mt'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?随机(ai|AI)$',
          /** 执行方法 */
          fnc: 'sjai'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?手写$',
          /** 执行方法 */
          fnc: 'sx'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?每日英语$',
          /** 执行方法 */
          fnc: 'mryy'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?随机柴郡$',
          /** 执行方法 */
          fnc: 'cj'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?随机acg$',
          /** 执行方法 */
          fnc: 'random_acg'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?随机东方$',
          /** 执行方法 */
          fnc: 'random_orient'
        },
      ]
    })
    this.task = [
      {
        cron: '30 7 * * *',
        // cron: '*/1 * * * *',
        name: 'englishTimeIsUp',
        fnc: this.englishTimeIsUp
      }
    ]
  }

  async englishTimeIsUp() {
    let toSend = Config.studyGroups || []
    let url = 'https://open.iciba.com/dsapi/'
    let response = await axios.get(url) // 调用接口获取数据
    const res = response.data
    const img = res.fenxiang_img
    if (img) {
      for (const element of toSend) {
        if (!element) {
          continue
        }
        let groupId = parseInt(element)
        if (Bot.getGroupList().get(groupId)) {
          await Bot.sendGroupMsg(groupId, pepTalk[Math.floor(Math.random() * pepTalk.length)])
          await sleep(5000)
          await Bot.sendGroupMsg(groupId, segment.image(img))
          await sleep(1500)
          // 重要的事情说三遍！
          await Bot.sendGroupMsg(groupId, followMe[Math.floor(Math.random() * followMe.length)])
          await sleep(1500)
          await Bot.sendGroupMsg(groupId, segment.record(res.tts))
          await sleep(1500)
          await Bot.sendGroupMsg(groupId, segment.record(res.tts))
          await sleep(1500)
          await Bot.sendGroupMsg(groupId, segment.record(res.tts))
          await sleep(2000)
          await Bot.sendGroupMsg(groupId, endingSpeech[Math.floor(Math.random() * endingSpeech.length)])
        } else {
          logger.warn('机器人不在要发送的群组里。' + groupId)
        }
      }
    }
  }

  // 随机柴郡
  async cj(e) {
    // 发送消息
    await this.reply(segment.image('http://api.yujn.cn/api/chaijun.php?'))
    return true // 返回true 阻挡消息不再往下
  }

  // 每日英语
  async mryy(e) {
    let sendmsg = []
    let url = 'https://open.iciba.com/dsapi/'
    let response = await axios.get(url) // 调用接口获取数据
    console.log(response)
    sendmsg.push(segment.image(response.data.fenxiang_img))
    await this.reply(sendmsg, true)
  }

  // 手写模拟器
  async sx(e) {
    let encode = e.msg.replace(/^#?手写/, '').trim()
    // 发送消息
    await this.reply(segment.image(`https://zj.v.api.aa1.cn/api/zuoye/?msg=${encode}`), true)
    return true // 返回true 阻挡消息不再往下
  }

  // 猫羽雫图片天气
  async tianqi(e) {
    let encode = e.msg.replace(/^#?天气/, '').trim()
    // 发送消息
    await this.reply(segment.image(`http://api.caonm.net/api/qqtq/t.php?msg=${encode}&type=img&n=1`), true)
    return true // 返回true 阻挡消息不再往下
  }

  // mc酱
  async mc(e) {
    // 发送消息
    await this.reply(segment.image('https://www.hlapi.cn/api/mcj'))
    return true // 返回true 阻挡消息不再往下
  }

  // 小c酱
  async xiaoc(e) {
    // 发送消息
    await this.reply(segment.image('http://api.yujn.cn/api/xcj.php?'))
    return true // 返回true 阻挡消息不再往下
  }

  // 兽猫酱
  async shoumao(e) {
    // 发送消息
    await this.reply(segment.image('http://api.yujn.cn/api/smj.php?'))
    return true // 返回true 阻挡消息不再往下
  }

  // 美腿
  async mt(e) {
    await this.reply(segment.image('http://lx.linxi.icu/API/meitui.php'))
    return true // 返回true 阻挡消息不再往下
  }

  // 随机ai
  async sjai(e) {
    // 发送消息
    await this.reply(segment.image('http://lx.linxi.icu/API/aitu.php'))
    return true // 返回true 阻挡消息不再往下
  }

  // 买家秀
  async buyerShow(e) {
    // 发送消息
    await this.reply(segment.image('https://api.dzzui.com/api/imgtaobao'))
    return true // 返回true 阻挡消息不再往下
  }
  // 随机二次元
  async random_acg(e) {
    let api_list = [
    'https://www.dmoe.cc/random.php', 
    'http://www.98qy.com/sjbz/api.php',
    'https://t.mwm.moe/mp/',
    'https://t.mwm.moe/pc/',
    'https://api.ghser.com/random/pc.php',
    'https://api.ghser.com/random/pe.php',
    'https://www.loliapi.com/acg/',
    'https://api.paugram.com/wallpaper/',
  ];
    let random_type = Math.random()
    if (random_type < 1 ) {
      let api_number = Math.ceil(Math.random() * api_list['length'])
      await this.reply(segment.image(`${api_list[api_number - 1]}`))
      return true
    }
  }

  //随机东方
  async random_orient(e) {
    // 发送消息
    await this.reply(segment.image('https://img.paulzzh.tech/touhou/random'))
    return true 
  }



}

