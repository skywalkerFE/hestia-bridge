const hestiaBridge = {
  data: () => ({
    insideHestia: window.parent !== window.self,
    hestiaChannel: void 0,
    hestiaPort: void 0
  }),
  created() {
    this.initCommunication()
  },
  methods: {
    initCommunication() {
      if (!this.insideHestia) {
        onmessage = e => {
          this.hestiaPort = e.ports[0]
          if (this.hestiaPort) { this.hestiaPort.onmessage = this.onMessage }
        }
      } else {
        this.hestiaChannel = new MessageChannel()
  
        this.hestiaPort = this.hestiaChannel.port1
        this.hestiaPort.onmessage = this.onMessage
        window.top.postMessage(void 0, '*', [this.hestiaChannel.port2])
      }
    },
    sendMessage(callee, params) {
      this.hestiaPort && this.hestiaPort.postMessage({ callee, params })
    },
    onMessage(e) {
      let data = e.data
  
      this[data.callee](data.params)
    }
  }
}
  
export { hestiaBridge }