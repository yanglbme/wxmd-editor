let app = new Vue({
  el: '#app',
  data: function () {
    let d = {
      aboutOutput: '',
      output: '',
      source: '',
      editorThemes: [
        { label: 'base16-light', value: 'base16-light' },
        { label: 'duotone-light', value: 'duotone-light' },
        { label: 'monokai', value: 'monokai' }
      ],
      editor: null,
      builtinFonts: [
        {
          label: '无衬线',
          value: "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif"
        },
        {
          label: '衬线',
          value: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif"
        }
      ],
      sizeOption: [
        { label: '14px', value: '14px', desc: '推荐' },
        { label: '15px', value: '15px', desc: '正常' },
        { label: '16px', value: '16px', desc: '稍大' },
      ],
      themeOption: [
        { label: '橘红', value: 'orange', author: '#FF5F2E' },
        { label: '淡绿', value: 'lightgreen', author: '#42B983'},
        { label: '暗青', value: 'darkcyan', author: '#008B8B'}
      ],
      colorOption: [
        { label: '淡绿', value: 'rgba(66, 185, 131, 0.9)' },
      ],
      styleThemes: {
        orange: orangeTheme,
        lightgreen: lightgreenTheme,
        darkcyan: darkcyanTheme
      },
      aboutDialogVisible: false
    };
    d.currentEditorTheme = d.editorThemes[0].value;
    d.currentFont = d.builtinFonts[0].value;
    d.currentSize = d.sizeOption[0].value;
    d.currentTheme = d.themeOption[1].value;
    d.currentColor = d.colorOption[0].value;
    return d;
  },
  mounted() {
    let self = this;
    this.editor = CodeMirror.fromTextArea(
      document.getElementById('editor'),
      {
        lineNumbers: false,
        lineWrapping: true,
        styleActiveLine: true,
        theme: this.currentEditorTheme,
        mode: 'text/x-markdown',
      }
    );
    this.editor.on("change", function (cm, change) {
      self.refresh();
      self.saveEditorContent();
    });
    this.wxRenderer = new WxRenderer({
      theme: this.styleThemes.lightgreen,
      fonts: this.currentFont,
      size: this.currentSize
    });
    // 如果有编辑内容被保存则读取，否则加载默认文档
    if (localStorage.getItem("__editor_content")) {
      this.editor.setValue(localStorage.getItem("__editor_content"));
    } else {
      axios({
        method: 'get',
        url: './assets/default-content.md',
      }).then(function (resp) {
        self.editor.setValue(resp.data)
      })
    }
  },
  methods: {
    renderWeChat: function (source) {
      let output = marked(source, { renderer: this.wxRenderer.getRenderer() });
      if (this.wxRenderer.hasFootnotes()) {
        // 去除第一行的 margin-top
        output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"');
        // 引用注脚
        output += this.wxRenderer.buildFootnotes();
        // 附加的一些 style
        output += this.wxRenderer.buildAddition();
      }
      return output
    },
    editorThemeChanged: function (editorTheme) {
      this.editor.setOption('theme', editorTheme)
    },
    fontChanged: function (fonts) {
      this.wxRenderer.setOptions({
        fonts: fonts
      });
      this.refresh()
    },
    sizeChanged: function (size) {
      this.wxRenderer.setOptions({
        size: size
      });
      this.refresh()
    },
    themeChanged: function (themeName) {
      let themeObject = this.styleThemes[themeName];
      this.wxRenderer.setOptions({
        theme: themeObject
      });
      this.refresh()
    },
    colorChanged: function (color) {
      // TODO
    },
    // 刷新右侧预览
    refresh: function () {
      this.output = this.renderWeChat(this.editor.getValue(0))
    },
    // 将左侧编辑器内容保存到 LocalStorage
    saveEditorContent: function () {
      let content = this.editor.getValue(0);
      if (content){
        localStorage.setItem("__editor_content", content);
      } else {
        localStorage.removeItem("__editor_content");
      }
    },
    copy: function () {
      let clipboardDiv = document.getElementById('output');
      clipboardDiv.focus();
      window.getSelection().removeAllRanges();
      let range = document.createRange();
      range.setStartBefore(clipboardDiv.firstChild);
      range.setEndAfter(clipboardDiv.lastChild);
      window.getSelection().addRange(range);

      try {
        if (document.execCommand('copy')) {
          this.$message({
            message: '已复制文章到剪贴板，可直接到公众号后台粘贴', type: 'success'
          })
        } else {
          this.$message({
            message: '未能复制文章到剪贴板，请全选后右键复制', type: 'warning'
          })
        }
      } catch (err) {
        this.$message({
          message: '未能复制文章到剪贴板，请全选后右键复制', type: 'warning'
        })
      }
    },
    openWindow: function (url) {
      window.open(url);
    }
  },
  updated: function () {
    this.$nextTick(function () {
      prettyPrint()
    })
  }
});
