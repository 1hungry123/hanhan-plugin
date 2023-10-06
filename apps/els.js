import plugin from '../../../lib/plugins/plugin.js'

export class RussiaRoundPlatePlugin extends plugin {
  constructor () {
    this.nop = 0
    super({
      name: '憨憨小游戏-俄罗斯轮盘',
      dsc: '憨憨小游戏-俄罗斯轮盘',
      event: 'message',
      priority: 6,
      rule: [
        {
          reg: '^#?(开启俄罗斯轮盘|开盘|开启轮盘|开启转盘|俄罗斯轮盘)$',
          fnc: 'start'
        },
        {
          reg: '^#?开枪$',
          fnc: 'shoot'
        },
        {
          reg: '^#?结束游戏$',
          fnc: 'stopShoop'
        }, {
          reg: '^#?当前子弹$',
          fnc: 'nowBullet'
        }
      ]
    })
  }

  async start (e) {
    if (!e.isGroup) {
      await e.reply('当前不在群聊里')
      return false
    }

    let groupId = e.group_id
    let groupLock = await redis.get(`HANHAN:ELS:${groupId}`)
    if (!groupLock) {
      let bulletNum = Math.floor(Math.random() * 5) + 5
      await redis.set(`HANHAN:ELS:${groupId}`, bulletNum + '', { EX: 10 * 60 * 1000 })
      await e.reply(`当前群俄罗斯轮盘已开启！\n弹夹有【${bulletNum}】发子弹。\n请发送#开枪 参与游戏`)
      this.nop = 0
    } else {
      await e.reply('当前群俄罗斯轮盘正在进行中！\n请发送#开枪 参与游戏')
    }
  }

  async shoot (e) {
    if (!e.isGroup) {
      await e.reply('当前不在群聊里')
      return false
    }
    let groupId = e.group_id
    let groupLock = await redis.get(`HANHAN:ELS:${groupId}`)
    if (!groupLock) {
      await e.reply('当前群没有开盘，无法开枪')
      return
    }
    // let leftBullets = await redis.get(`HANHAN:ELS:${groupId}`)
    // if (!leftBullets) {
    //   await this.start(e)
    //   leftBullets = await redis.get(`HANHAN:ELS:${groupId}`)
    // }
    let username = e.sender.card || e.sender.nickname
    // leftBullets = parseInt(leftBullets)
    let leftBullets = parseInt(groupLock)
    if (isNaN(leftBullets)) {
      await e.reply('俄罗斯轮盘出现错误，请发送#结束游戏 后，重新开始游戏')
      return
    }
    await e.reply(`之前：${this.nop} `)
    console.log("人数增加前：" + this.nop)
    this.nop = parseInt(this.nop) + 1;
    console.log("人数增加后：" + this.nop)
    await e.reply(`现在：${this.nop}`)
    if (leftBullets <= 1 || Math.random() < 1 / leftBullets) {
      await redis.del(`HANHAN:ELS:${groupId}`)
      let group = await Bot.pickGroup(groupId)
      let max = 5
      let min = 1
      let time = Math.floor(Math.random() * (max - min + 1)) + min
      await group.muteMember(e.sender.user_id, time)
      await e.reply(`【${username}】开了一枪，枪响了。\n恭喜【${username}】中奖，请用语音发送上一个人指定的骚话，或发送【0.5*${this.nop}】元拼手气红包跳过语音惩罚，土豪快来\n本轮游戏结束。请使用#开盘 开启新一轮游戏`)
      // await redis.del(`HANHAN:ELS:${groupId}`)
    } else {
      leftBullets--
      await redis.set(`HANHAN:ELS:${groupId}`, leftBullets + '', { EX: 10 * 60 * 1000 })
      if (leftBullets == 1) {
        await redis.del(`HANHAN:ELS:${groupId}`)
        await e.reply(`【${username}】开了一枪，只剩1发子弹了\n恭喜${username}是冠军！\n你可以指定一个人用语音发送上一个人指定的骚话，不然他只能发送【0.5*${this.nop}】元拼手气红包跳过语音惩罚，土豪快来\n本轮游戏结束。请使用#开盘 开启新一轮游戏`)
      }
      else {
        await e.reply(`【${username}】开了一枪，没响。\n还剩【${leftBullets}】发子弹`)
      }
      // e.reply(`${leftBullets}`)
    }
  }

  async stopShoop (e) {
    if (!e.isGroup) {
      await e.reply('当前不在群聊里')
      return false
    }
    let groupId = e.group_id
    let groupLock = await redis.get(`HANHAN:ELS:${groupId}`)
    // e.reply(groupLock)
    if (!groupLock) {
      e.reply('当前群没有开盘')
    } else {
      await redis.del(`HANHAN:ELS:${groupId}`)
      e.reply('结束成功')
    }
  }

  async nowBullet (e) {
    if (!e.isGroup) {
      await e.reply('当前不在群聊里')
      return false
    }
    let groupId = e.group_id
    let groupLock = await redis.get(`HANHAN:ELS:${groupId}`)
    if (!groupLock) {
      e.reply('当前群没有开盘')
    } else {
      e.reply('当前还有' + groupLock + '发子弹')
    }
  }
}
