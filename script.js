let $ = document.querySelector.bind(document);
class Paper {
  constructor(parameters) {
    this.ctx = parameters.ctx;
    this.height = parameters.height;
    this.width = parameters.width;
    this.lineWidth = parameters.lineWidth;
    this.control = parameters.control;
    this.mouseDom = parameters.mouseDom;
    this.mouse = { x: 0, y: 0 };
    this.isDraw = false;
    this.typeDraw = "line";
    this.color = parameters.color;
    this.lines = [];
    this.historyUndo = [];
    this.startPoint = { x: 0, y: 0 };
  }
  onLoad() {
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
  }
  updateDom() {
    return {
      lineWidth: function () {
        this.lineWidth.qualityDom.style.height = this.lineWidth.value;
      },
      onActive: function (Dom) {
        $(".active").classList.remove("active");
        Dom.classList.add("active");
      },
      currentColor: function () {
        this.color.currentColorDom.style.backgroundColor = this.color.value;
      },
      mouse: function () {
        this.mouseDom.xDom.innerText = this.mouse.x;
        this.mouseDom.yDom.innerText = this.mouse.y;
      },
    };
  }
  drawAll() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    function drawLine(line) {
      let moveTo = line.chains[0];
      for (let i of line.chains) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = line.style.color;
        this.ctx.lineWidth = line.style.lineWidth;
        this.ctx.moveTo(moveTo.x, moveTo.y);
        this.ctx.lineCap = "round";
        this.ctx.lineTo(i.x, i.y);
        this.ctx.stroke();
        moveTo = i;
      }
    }
    function earserLine(line) {
      let oldChain = line.chains[0];
      for (let i of line.chains) {
        this.ctx.clearRect(
          i.x,
          i.y,
          line.style.lineWidth,
          line.style.lineWidth
        );
      }
    }
    function drawStraight(line) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = line.style.color;
      this.ctx.lineWidth = line.style.lineWidth;
      this.ctx.lineCap = "round";
      this.ctx.moveTo(line.point.start.x, line.point.start.y);
      this.ctx.lineTo(line.point.end.x, line.point.end.y);
      this.ctx.stroke();
    }
    function drawRectangle(line) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = line.style.color;
      this.ctx.lineWidth = line.style.lineWidth;
      this.ctx.rect(
        line.point.start.x,
        line.point.start.y,
        line.point.end.x - line.point.start.x,
        line.point.end.y - line.point.start.y
      );
      this.ctx.stroke();
    }
    function drawCircle(line) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = line.style.color;
      this.ctx.lineWidth = line.style.lineWidth;
      this.ctx.ellipse(
        line.point.start.x + (line.point.end.x - line.point.start.x) / 2,
        line.point.start.y + (line.point.end.y - line.point.start.y) / 2,
        Math.abs((line.point.end.x - line.point.start.x) / 2),
        Math.abs((line.point.end.y - line.point.start.y) / 2),
        0,
        0,
        2 * Math.PI
      );
      this.ctx.stroke();
    }
    function drawTriangle(line) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = line.style.color;
      this.ctx.lineWidth = line.style.lineWidth;
      this.ctx.lineCap = "round";
      this.ctx.moveTo(line.point.start.x, line.point.end.y);
      this.ctx.lineTo(
        (line.point.start.x + line.point.end.x) / 2,
        line.point.start.y
      );
      this.ctx.lineTo(line.point.end.x, line.point.end.y);
      this.ctx.lineTo(line.point.start.x, line.point.end.y);
      this.ctx.stroke();
    }
    for (let i = 0; i < this.lines.length; i++) {
      switch (this.lines[i].type) {
        case "line":
          drawLine.call(this, this.lines[i]);
          break;
        case "eraser":
          earserLine.call(this, this.lines[i]);
          break;
        case "straight":
          drawStraight.call(this, this.lines[i]);
          break;
        case "rectangle":
          drawRectangle.call(this, this.lines[i]);
          break;
        case "circle":
          drawCircle.call(this, this.lines[i]);
          break;
        case "triangle":
          drawTriangle.call(this, this.lines[i]);
          break;
      }
    }
  }
  handleEvent() {
    function handleUpdateMousePosition(e) {
      let mouseOld = { ...this.mouse };
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
      this.updateDom().mouse.call(this);
      function drawLine(mouseOld) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color.value;
        this.ctx.moveTo(mouseOld.x, mouseOld.y);
        this.ctx.lineWidth = this.lineWidth.value;
        this.ctx.lineCap = "round";
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.stroke();
      }
      function eraserLine(mouseOld) {
        this.ctx.clearRect(
          this.mouse.x,
          this.mouse.y,
          this.lineWidth.value,
          this.lineWidth.value
        );
      }
      function addChainLine({ x, y }) {
        this.lines[this.lines.length - 1].chains.push({
          x,
          y,
        });
      }
      function addChainEarser({ x, y }, mouseOld) {
        this.lines[this.lines.length - 1].chains.push({
          x,
          y,
        });
      }
      function updateEndpoint({ x, y }) {
        this.lines[this.lines.length - 1].point.end = { x, y };
      }

      if (this.isDraw) {
        switch (this.typeDraw) {
          case "line":
            this.historyUndo = [];
            drawLine.call(this, mouseOld);
            addChainLine.call(this, this.mouse);
            break;
          case "eraser":
            eraserLine.call(this, mouseOld);
            addChainEarser.call(this, this.mouse, mouseOld);
          case "straight":
            updateEndpoint.call(this, this.mouse);
            this.drawAll();
            break;
          case "rectangle":
            updateEndpoint.call(this, this.mouse);
            this.drawAll();
            break;
          case "circle":
            updateEndpoint.call(this, this.mouse);
            this.drawAll();
            break;
          case "triangle":
            updateEndpoint.call(this, this.mouse);
            this.drawAll();
            break;
        }
      }
    }
    function handleUpdateDrawing(e) {
      this.startPoint.x = this.mouse.x;
      this.startPoint.y = this.mouse.y;
      this.isDraw = true;
      let startMove = { ...this.mouse };
      switch (this.typeDraw) {
        case "line":
          this.lines.push({
            type: "line",
            style: {
              lineWidth: this.lineWidth.value,
              color: this.color.value,
            },
            chains: [startMove],
          });
          break;
        case "eraser":
          this.lines.push({
            type: "eraser",
            style: {
              lineWidth: this.lineWidth.value,
            },
            chains: [startMove],
          });
          break;
        case "straight":
          this.lines.push({
            type: "straight",
            style: {
              lineWidth: this.lineWidth.value,
              color: this.color.value,
            },
            point: {
              start: { ...startMove },
              end: { ...startMove },
            },
          });
          break;
        case "rectangle":
          this.lines.push({
            type: "rectangle",
            style: {
              lineWidth: this.lineWidth.value,
              color: this.color.value,
            },
            point: {
              start: { ...startMove },
              end: { ...startMove },
            },
          });
          break;
        case "circle":
          this.lines.push({
            type: "circle",
            style: {
              lineWidth: this.lineWidth.value,
              color: this.color.value,
            },
            point: {
              start: { ...startMove },
              end: { ...startMove },
            },
          });
          break;
        case "triangle":
          this.lines.push({
            type: "triangle",
            style: {
              lineWidth: this.lineWidth.value,
              color: this.color.value,
            },
            point: {
              start: { ...startMove },
              end: { ...startMove },
            },
          });
          break;
      }
    }
    function handleUpdateUnDrawing(e) {
      this.isDraw = false;
      this.drawAll();
    }
    function handleIncreaseLineWidth(e) {
      if (this.lineWidth.value <= 30) {
        this.lineWidth.value++;
      }
      this.updateDom().lineWidth.call(this);
    }
    function handleReduceLineWidth(e) {
      if (this.lineWidth.value > 1) {
        this.lineWidth.value--;
      }
      this.updateDom().lineWidth.call(this);
    }
    function handleChangeStyleDraw(e) {
      let type = e.target.getAttribute("type");
      this.typeDraw = type;
      this.updateDom().onActive.call(this, e.target);
    }
    function handleChooseOptionColorList() {
      for (let optionColor of this.color.listColorDom) {
        optionColor.onclick = function (e) {
          this.color.value = e.target.style.backgroundColor;
          this.updateDom().currentColor.call(this);
        }.bind(this);
      }
    }
    function handleChooseInputColor(e) {
      this.color.value = e.target.value;
      this.updateDom().currentColor.call(this);
    }
    function handleCreateNewPaper() {
      this.lines = [];
      this.historyUndo = [];
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    function undoLine() {
      let linePop = this.lines.pop();
      if (linePop) {
        this.historyUndo.push(linePop);
      }
      this.drawAll();
    }
    function redoLine() {
      let linePop = this.historyUndo.pop();
      if (linePop) {
        this.lines.push(linePop);
      }
      this.drawAll();
    }
    function KeyPress(e) {
      let that = this;
      if (e.ctrlKey) {
        switch (e.code) {
          case "KeyZ": {
            undoLine.call(this);
            break;
          }
          case "KeyY": {
            redoLine.call(this);
            break;
          }
        }
      }
    }
    function hanleDownloadImage(e) {
      e.preventDefault();
      this.ctx.canvas.toBlob(function (blob) {
        saveAs(blob, "CFImage.png");
      });
    }
    this.ctx.canvas.onmousedown = handleUpdateDrawing.bind(this);
    this.ctx.canvas.onmouseup = handleUpdateUnDrawing.bind(this);
    this.ctx.canvas.onmouseout = handleUpdateUnDrawing.bind(this);
    this.ctx.canvas.onmousemove = handleUpdateMousePosition.bind(this);
    this.lineWidth.plusDom.onclick = handleIncreaseLineWidth.bind(this);
    this.lineWidth.minusDom.onclick = handleReduceLineWidth.bind(this);
    this.control.penDom.onclick = handleChangeStyleDraw.bind(this);
    this.control.eraserDom.onclick = handleChangeStyleDraw.bind(this);
    this.control.newPaperDom.onclick = handleCreateNewPaper.bind(this);
    handleChooseOptionColorList.call(this);
    this.color.inputColorDom.oninput = handleChooseInputColor.bind(this);
    document.documentElement.onkeypress = KeyPress.bind(this);
    this.control.undoDom.onclick = undoLine.bind(this);
    this.control.redoDom.onclick = redoLine.bind(this);
    this.control.downloadDom.onclick = hanleDownloadImage.bind(this);
    this.control.straightDom.onclick = handleChangeStyleDraw.bind(this);
    this.control.rectDom.onclick = handleChangeStyleDraw.bind(this);
    this.control.circleDom.onclick = handleChangeStyleDraw.bind(this);
    this.control.triangleDom.onclick = handleChangeStyleDraw.bind(this);
  }
  start() {
    this.onLoad();
    this.handleEvent();
  }
}
export default Paper;
