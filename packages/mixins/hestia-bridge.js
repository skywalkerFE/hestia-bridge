const hestiaBridge = {
  data: () => ({
    insideHestia: window.parent !== window.self,
    hestiaChannel: void 0,
    hestiaPort: {}
  }),
  methods: {
    initCommunication(project) {
      if (!this.insideHestia) {
        onmessage = e => {
          if (e.ports[0]) {
            let projectName = e.data.project

            this.hestiaPort[projectName] = e.ports[0]
            this.hestiaPort[projectName].onmessage = e => {
              this.onMessage(e, projectName)
            }
          }
        }
      } else {
        this.hestiaChannel = new MessageChannel()
  
        this.hestiaPort = this.hestiaChannel.port1
        this.hestiaPort.onmessage = this.onMessage
        window.parent.postMessage({ project }, '*', [this.hestiaChannel.port2])
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
    routeChange(to) {
      this.$router.push(to)
    },
    formatSideMenu(menu, level = 2) {
      let res = []

      menu.forEach(x => {
        x.mini = true
        x.filled = false
        x.indentLevel = level * 2
        if (x.show === void 0 || x.show === true || x.show.call(this)) {
          let temp = {
            mini: true,
            filled: false,
            collapsed: x.collapsed !== void 0 ? x.collapsed : true,
            indentLevel: level * 2,
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