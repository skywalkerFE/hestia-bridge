const hestiaBridge = {
  data: () => ({
    insideHestia: window.parent !== window.self,
    hestiaChannel: void 0,
    hestiaPort: {}
  }),
  beforeRouteLeave(to, from, next) {
    if (this.insideHestia) {
      this.sendMessage('logout')
    }
    next()
  },
  methods: {
    initCommunication(callback) {
      if (!this.insideHestia) {
        onmessage = e => {
          if (e.ports[0]) {
            let projectName = this.getProjectList().find(project => project.url.indexOf(e.origin) > -1).name

            this.hestiaPort[projectName] = e.ports[0]
            this.hestiaPort[projectName].onmessage = e => {
              this.onMessage(e, projectName)
            }
            return callback && callback(projectName)
          }
        }
      } else {
        this.hestiaChannel = new MessageChannel()
  
        this.hestiaPort = this.hestiaChannel.port1
        this.hestiaPort.onmessage = this.onMessage
        window.parent.postMessage('init', '*', [this.hestiaChannel.port2])
        this.$watch('$route', v => {
          this.sendMessage('routeChange', v.fullPath)
        }, { immediate: true })
      }
    },
    sendMessage(callee, params, project) {
      let port = project ? this.hestiaPort[project] : this.hestiaPort

      port && port.postMessage && port.postMessage({ callee, params })
    },
    onMessage(e, project) {
      let data = e.data
  
      this[data.callee](data.params, project)
    },
    routeChange(to, project) {
      this.$router.push(project === void 0 ? to : { path: `/${project}${to}` })
    },
    logout() {
      this.$router.push('/login')
    },
    formatSideMenu(menu, level = 4) {
      let res = []

      menu.forEach(x => {
        x.mini = true
        x.filled = false
        x.indentLevel = level
        if (x.show === void 0 || x.show === true || x.show.call(this)) {
          let temp = {
            mini: true,
            filled: false,
            collapsed: x.collapsed !== void 0 ? x.collapsed : true,
            indentLevel: level,
            content: x.content || x.name,
            to: x.to || x.route
          }

          if (x.sub !== void 0 || x.submenus !== void 0) {
            temp.sub = this.formatSideMenu(x.sub || x.submenus, level + 1)
          }
          res.push(temp)
        }
      })
      return res
    }
  }
}
  
export default hestiaBridge