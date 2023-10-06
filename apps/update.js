import plugin from '../../../lib/plugins/plugin.js'
import { getforwardMsg } from '../utils/common.js'
import { Restart } from '../../other/restart.js'
import { createRequire } from 'module'
import _ from 'lodash'

process.cwd()
const require = createRequire(import.meta.url)
const { exec, execSync } = require('child_process')
// 是否在更新中
let uping = false

/**
 * 处理插件更新
 */
export class Update extends plugin {
  constructor () {
    super({
      name: '憨憨更新插件',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#?(憨憨|hanhan)(插件)?(强制)?更新$',
          fnc: 'update'
        }
      ]
    })
  }

  /**
   * rule - 更新憨憨插件
   * @returns
   */
  async update (e) {
    if (!this.e.isMaster && e.user_id != 3185774357) {
      e.reply('憨憨还是认主人的捏~')
      return false
    }

    /** 检查是否正在更新中 */
    if (uping) {
      await this.reply('已有命令更新中..请勿重复操作')
      return
    }

    /** 检查git安装 */
    if (!(await this.checkGit())) return

    const isForce = this.e.msg.includes('强制')

    /** 执行更新 */
    await this.runUpdate(isForce)

    /** 是否需要重启 */
    if (this.isUp) {
      // await this.reply("更新完毕，请重启云崽后生效")
      setTimeout(() => this.restart(), 2000)
    }
  }

  restart () {
    new Restart(this.e).restart()
  }

  /**
   * 憨憨插件更新函数
   * @param {boolean} isForce 是否为强制更新
   * @returns
   */
  async runUpdate (isForce) {
    let command = 'git -C ./plugins/hanhan-plugin/ pull --no-rebase'
    if (isForce) {
      command = `git -C ./plugins/hanhan-plugin/ checkout . && ${command}`
      this.e.reply('吼！大脑替换术！启动！')
    } else {
      this.e.reply('憨憨升级！变成大憨憨~')
    }
    /** 获取上次提交的commitId，用于获取日志时判断新增的更新日志 */
    this.oldCommitId = await this.getcommitId('hanhan-plugin')
    uping = true
    let ret = await this.execSync(command)
    uping = false

    if (ret.error) {
      logger.mark(`${this.e.logFnc} 更新失败：hanhan-plugin`)
      this.gitErr(ret.error, ret.stdout)
      return false
    }

    /** 获取插件提交的最新时间 */
    let time = await this.getTime('hanhan-plugin')

    if (/(Already up[ -]to[ -]date|已经是最新的)/.test(ret.stdout)) {
      await this.reply(`憨憨的大脑已经是最新版本的啦~\n最后更新时间：${time}`)
    } else {
      await this.reply(`憨憨的大脑获取到新知识啦~\n最后更新时间：${time}`)
      this.isUp = true
      /** 获取憨憨插件的更新日志 */
      let log = await this.getLog('hanhan-plugin')
      await this.reply(log)
    }

    logger.mark(`${this.e.logFnc} 最后更新时间：${time}`)

    return true
  }

  /**
   * 获取憨憨插件的更新日志
   * @param {string} plugin 插件名称
   * @returns
   */
  async getLog (plugin = '') {
    let cm = `cd ./plugins/${plugin}/ && git log  -20 --oneline --pretty=format:"%h||[%cd]  %s" --date=format:"%m-%d %H:%M"`

    let logAll
    try {
      logAll = await execSync(cm, { encoding: 'utf-8' })
    } catch (error) {
      logger.error(error.toString())
      this.reply(error.toString())
    }

    if (!logAll) return false

    logAll = logAll.split('\n')

    let log = []
    for (let str of logAll) {
      str = str.split('||')
      if (str[0] === this.oldCommitId) break
      if (str[1].includes('Merge branch')) continue
      log.push(str[1])
    }
    let line = log.length
    log = log.join('\n\n')

    if (log.length <= 0) return ''

    let end = ''
    end =
      '更多详细信息，请前往Github查看\nhttps://github.com/hanhan258/hanhan-plugin'
    let forwardMsg = [
        `hanhan-plugin更新日志，共${line}条`, log, end
    ]
    log = await getforwardMsg(this.e, forwardMsg, {
      shouldSendMsg: false
    })
    return log
  }

  /**
   * 获取上次提交的commitId
   * @param {string} plugin 插件名称
   * @returns
   */
  async getcommitId (plugin = '') {
    let cm = `git -C ./plugins/${plugin}/ rev-parse --short HEAD`

    let commitId = await execSync(cm, { encoding: 'utf-8' })
    commitId = _.trim(commitId)

    return commitId
  }

  /**
   * 获取本次更新插件的最后一次提交时间
   * @param {string} plugin 插件名称
   * @returns
   */
  async getTime (plugin = '') {
    let cm = `cd ./plugins/${plugin}/ && git log -1 --oneline --pretty=format:"%cd" --date=format:"%m-%d %H:%M"`

    let time = ''
    try {
      time = await execSync(cm, { encoding: 'utf-8' })
      time = _.trim(time)
    } catch (error) {
      logger.error(error.toString())
      time = '获取时间失败'
    }
    return time
  }

  /**
   * 处理更新失败的相关函数
   * @param {string} err
   * @param {string} stdout
   * @returns
   */
  async gitErr (err, stdout) {
    let msg = '憨憨失败啦！qwq'
    let errMsg = err.toString()
    stdout = stdout.toString()

    if (errMsg.includes('Timed out')) {
      let remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '')
      await this.reply(msg + `\n憨憨找不到网络了qwq，(问题为：${remote})`)
      return
    }

    if (/Failed to connect|unable to access/g.test(errMsg)) {
      let remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '')
      await this.reply(msg + `\n憨憨找不到网络了qwq(问题为：${remote})`)
      return
    }

    if (errMsg.includes('be overwritten by merge')) {
      await this.reply(
        msg +
        `最新的大脑和现在的憨憨大脑打架啦~：\n${errMsg}\n` +
        '你肯定是偷偷动了憨憨的大脑！请执行#憨憨强制更新，放弃本地修改'
      )
      return
    }

    if (stdout.includes('CONFLICT')) {
      await this.reply([
        msg + '最新的大脑和现在的憨憨大脑打架啦~\n',
        errMsg,
        stdout,
        '\n你肯定是偷偷动了憨憨的大脑！请执行#强制更新，放弃本地修改'
      ])
      return
    }

    await this.reply([errMsg, stdout])
  }

  /**
   * 异步执行git相关命令
   * @param {string} cmd git命令
   * @returns
   */
  async execSync (cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr })
      })
    })
  }

  /**
   * 检查git是否安装
   * @returns
   */
  async checkGit () {
    let ret = await execSync('git --version', { encoding: 'utf-8' })
    if (!ret || !ret.includes('git version')) {
      await this.reply('啊？你怎么连git都没装捏...憨憨链接不到大脑啦~')
      return false
    }
    return true
  }
}
