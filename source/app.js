(function () {
  'use strict'

  if (!window.addEventListener) return // Check for IE9+

  var options = INSTALL_OPTIONS
  var setDomainTimeout
  var iframe
  var IS_PREVIEW = INSTALL_ID === 'preview'
  var PREVIEW_DOMAIN = 'cloudflare-app-preview.zendesk.com'

  function insertSnippet () {
    var zendeskHost = options.zendeskHost.trim()

    if (!zendeskHost) {
      if (!IS_PREVIEW) return

      zendeskHost = PREVIEW_DOMAIN
    }

    var args = []
    iframe = document.createElement('iframe')

    window.zEmbed = function zEmbed () {
      args.push(arguments)
    }

    window.zE = window.zE || window.zEmbed

    iframe.src = 'javascript:false'
    iframe.title = ''
    iframe.role = 'presentation'
    ;(iframe.frameElement || iframe).style.cssText = 'display: none'

    var firstScript = document.getElementsByTagName('script')
    firstScript = firstScript[firstScript.length - 1]
    firstScript.parentNode.insertBefore(iframe, firstScript)

    var iframeFrameDocument = iframe.contentWindow.document
    var domain
    var _document

    try {
      _document = iframeFrameDocument
    } catch (e) {
      domain = document.domain
      iframe.src = 'javascript:var d=document.open();d.domain="' + domain + '";void(0);'
      _document = iframeFrameDocument
    }

    _document.open().loadCFZendesk = function loadCFZendesk () {
      var script = this.createElement('script')

      if (domain) {
        this.domain = domain
      }

      script.id = 'js-iframe-async'
      script.src = 'https://assets.zendesk.com/embeddable_framework/main.js'

      this.t = +new Date()
      this.zendeskHost = zendeskHost
      this.zEQueue = args
      this.body.appendChild(script)
    }

    _document.write('<body onload="document.loadCFZendesk();">')
    _document.close()
  }

  function updateElement () {
    if (iframe && iframe.parentElement) {
      iframe.parentElement.removeChild(iframe)
    }

    // TODO: Check if there's a better way to find this in the DOM.
    var launcher = document.querySelector('.zEWidget-launcher')

    if (launcher && launcher.parentElement) {
      launcher.parentElement.removeChild(launcher)
    }

    insertSnippet()
  }

  // This code ensures that the app doesn't run before the page is loaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateElement)
  } else {
    updateElement()
  }

  // INSTALL_SCOPE is an object that is used to handle option changes without refreshing the page.
  window.INSTALL_SCOPE = {
    setAccount: function setAccount (nextOptions) {
      options = nextOptions

      updateElement()
    },
    setHost: function setHost (nextOptions) {
      clearTimeout(setDomainTimeout)
      options = nextOptions

      setDomainTimeout = setTimeout(updateElement, 1000)
    }
  }
}())
