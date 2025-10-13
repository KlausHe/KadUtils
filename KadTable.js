import { KadArray, KadColor, KadLog, copyToClipboard, deepClone, initEL, stackFunctionName, toArray } from "./KadUtils.js";

const settingLists = {
  wrapper: ["description", "thinBorder", "thickBorder", "noBorder", "ackgroundColor", "cursor", "align", "justify", "onclick", "onmouseover", "onmouseleave", "copy"],
  element: ["description", "title", "class", "for", "forLabel", "font", "dList", "backgroundColor", "cursor", "uiSize", "uiRadius", "imgSize", "uiType", "uiFlex", "uiFilter", "onclick"],
};

export const KadDOMElements = {
  createDOMElement({ parentElement = null, id = null, type = null, data, idIndex = null, settings = null }) {
    const element = this.Elements[type](data);
    element.id = id;
    if (parentElement != null) {
      parentElement.appendChild(element);
    }
    //id, action, fn, selGroup, selList, selStartIndex, selStartValue, dbList, radioBtnCallbacks, resetValue, animatedText, dateOpts, domOpts, uiOpts, dataset
    // initEL({ id: idName_IdIndex, fn: onclick  });
    return element;
  },
  Elements: {
    Div() {
      const element = document.createElement("DIV");
      return element;
    },
    Colorbox() {
      const element = this.Div();
      element.classList.add("cl_KadUtilsColoredBox");
      return element;
    },
    Lbl() {
      const element = document.createElement("LABEL");
      return element;
    },
    H1() {
      const element = document.createElement("H1");
      return element;
    },
    H2() {
      const element = document.createElement("H2");
      return element;
    },
    H3() {
      const element = document.createElement("H3");
      return element;
    },
    Button() {
      const element = document.createElement("Button");
      element.type = "button";
      return element;
    },
    ButtonImgKAD() {
      const element = this.Button();
      const img = this.ImgKAD();
      element.appendChild(img);
      return element;
    },
    ButtonImgURL() {
      const element = this.Button();
      const img = this.ImgURL();
      element.appendChild(img);
      return element;
    },
    Image() {
      const element = document.createElement("IMG");
      return element;
    },
    ImgKAD() {
      const element = this.Image();
      element.style.padding = 0;
      element.setAttribute("imgSize", "tableImg");
      return element;
    },
    ImgURL() {
      const element = this.Image();
      element.setAttribute("referrerpolicy", "no-referrer");
      return element;
    },
    Input() {
      const element = document.createElement("Input");
      return element;
    },
    InputText() {
      const element = this.Input();
      element.type = "text";
      return element;
    },
    InputNumber() {
      const element = this.Input();
      element.type = "number";
      return element;
    },
    Checkbox() {
      const element = this.Input();
      element.type = "checkbox";
      return element;
    },
  },
  // Elements: {
  //   Div(data = null) {
  //     const element = document.createElement("DIV");
  //     element.textContent = data;
  //     return element;
  //   },
  //   Colorbox(data = null) {
  //     const element = this.Div();
  //     element.classList.add("cl_KadUtilsColoredBox");
  //     element.style.background = KadColor.formatAsCSS({ colorArray: data, type: "HSL" });
  //     return element;
  //   },
  //   Lbl(data = null) {
  //     const element = document.createElement("LABEL");
  //     element.innerHTML = data;
  //     return element;
  //   },
  //   H1(data = null) {
  //     const element = document.createElement("H1");
  //     element.innerHTML = data;
  //     return element;
  //   },
  //   H2(data = null) {
  //     const element = document.createElement("H2");
  //     element.innerHTML = data;
  //     return element;
  //   },
  //   H3(data = null) {
  //     const element = document.createElement("H3");
  //     element.innerHTML = data;
  //     return element;
  //   },
  //   Button(data = null) {
  //     const element = document.createElement("Button");
  //     element.type = "button";
  //     element.textContent = data;
  //     return element;
  //   },
  //   ButtonImgKAD(data = null) {
  //     const element = this.Button();
  //     const img = this.ImgKAD(data);
  //     element.appendChild(img);
  //     return element;
  //   },
  //   ButtonImgURL(data = null) {
  //     const element = this.Button();
  //     const img = this.ImgURL(data);
  //     element.appendChild(img);
  //     return element;
  //   },
  //   Image(data = null) {
  //     const element = document.createElement("IMG");
  //     element.src = data || "";
  //     return element;
  //   },
  //   ImgKAD(data = null) {
  //     const element = this.Image();
  //     element.src = KadDOM.getImgPath(data);
  //     element.style.padding = 0;
  //     element.setAttribute("imgSize", "tableImg");
  //     return element;
  //   },
  //   ImgURL(data = null) {
  //     const element = this.Image();
  //     element.src = data || "";
  //     element.setAttribute("referrerpolicy", "no-referrer");
  //     return element;
  //   },
  //   Input(data = null) {
  //     const element = document.createElement("Input");
  //     element.placeholder = data;
  //     element.value = "";
  //     return element;
  //   },
  //   InputText(data = null) {
  //     const element = this.Input(data);
  //     element.type = "text";
  //     return element;
  //   },
  //   InputNumber(data = null) {
  //     const element = this.Input(data);
  //     element.type = "number";
  //     return element;
  //   },
  //   Checkbox(data = null) {
  //     const element = this.Input(data);
  //     element.type = "checkbox";
  //     // if (data === null) {
  //     //   element.style.display = "none";
  //     // } else {
  //     //   element.checked = data;
  //     // }
  //     return element;
  //   },
  // },
};

export const KadNewTable = {
  CSSGrid: {
    tableMain: "KadUtilsGridTable",
    tableWrapperHeader: "KadUtilsGridTableWrapperHeader",
    tableWrapperBody: "KadUtilsTableWrapper",
    tableWrapperItem: "KadUtilsTableItem",
    borderTopNone: "KadUtilsBorderTopNone",
    borderTopThin: "KadUtilsBorderTopThin",
    borderTopThick: "KadUtilsBorderTopThick",
    borderRightNone: "KadUtilsBorderRightNone",
    borderRightThin: "KadUtilsBorderRightThin",
    borderRightThick: "KadUtilsBorderRightThick",
    borderBottomNone: "KadUtilsBorderBottomNone",
    borderBottomThin: "KadUtilsBorderBottomThin",
    borderBottomThick: "KadUtilsBorderBottomThick",
    borderLeftNone: "KadUtilsBorderLeftNone",
    borderLeftThin: "KadUtilsBorderLeftThin",
    borderLeftThick: "KadUtilsBorderLeftThick",
  },
  createGRID({ id = null, header = null, body = null, CSSGrid = {} } = {}) {
    if (KadLog.errorCheckedLevel(id == null, 2, "No ID passed")) return;
    if (KadLog.errorCheckedLevel(typeof id != "string", 3, "ID is not a string")) return;
    if (KadLog.errorCheckedLevel(body != null && !Array.isArray(body), 2, "Body has to be an Array!")) return;
    this.CSSGrid = { ...this.CSSGrid, ...CSSGrid };
    const grid = document.getElementById(id);
    grid.innerHTML = "";
    if (body === null && header === null) {
      // KadLog.logLevel(3, "Table", `"${id}"`, "is cleared because it has no Header or Body!");
      return;
    }
    grid.classList.add(this.CSSGrid.tableMain);

    let tableSize = {
      cols: null,
      rows: null,
      colsHeader: null,
      rowsHeader: null,
      colsBody: null,
      rowsBody: null,
    };

    let headerAvailable = header != null;
    let bodyAvailable = body != null;
    let dataHeader = [];
    let dataBody = [];

    if (headerAvailable) {
      const { headerArray, rowsHeader, colsHeader } = this.generateHeaderCells(header);
      dataHeader = headerArray;
      tableSize.colsHeader = colsHeader;
      tableSize.rowsHeader = rowsHeader;
    }
    if (bodyAvailable) {
      this.appendDataIndexArray(body);
      dataBody = this.getSplitBodyWithMultiColumns(body);
      const { rowsBody, colsBody } = this.getBodyTableSize(dataBody);
      tableSize.colsBody = colsBody;
      tableSize.rowsBody = rowsBody;
    }

    tableSize.cols = Math.max(tableSize.colsHeader, tableSize.colsBody);
    tableSize.rows = tableSize.rowsHeader + tableSize.rowsBody;
    grid.style.gridTemplateRows = `repeat(${tableSize.rows}, auto)`;

    // KadLog.errorCheckedLevel(tableSize.colsHeader != tableSize.colsBody, 3, `Header (${tableSize.colsHeader}) und Body (${tableSize.colsBody}) haben nicht die gleiche Anzahl an Spalten! die größere Anzahl wird verwendet: ${tableSize.cols}`);

    if (headerAvailable) {
      // for each ROW of the Headers
      for (let row = 0; row < dataHeader.length; row++) {
        // for each COLUMN put in the DATA
        for (let col = 0; col < dataHeader[row].length; col++) {
          const headerItem = dataHeader[row][col];
          const wrapperHeader = this.createWrapperCellHeader({ grid, headerItem, tableSize, row, col });
          if (!headerItem.skip) {
            this.createHeaderCell({ wrapperHeader, headerItem });
          }
        }
      }
    }

    if (bodyAvailable) {
      // this.createBody(grid, dataBody, tableSize);
    }
    // END!
    return;
    for (let row = 0; row < tableSize.rowsHeader; row++) {
      for (let col = 0; col < tableSize.cols; col++) {
        const headerItem = dataHeader[row][col];
        let wrapper = null;
        let item = null;
        if (headerItem) {
          wrapper = this.createWrapperCellHeader({ grid, headerItem, tableSize, row, col });
          item = this.createCellHeader({ wrapper, headerItem, tableSize, row, col });
        }
      }
    }
    // for (let row = 0; row < tableSize.rowsBody; row++) {}
    for (let col = 0; col < columns; col++) {
      let cellColItem = null;
      if (body) {
        cellColItem = body[col];
      }

      let rowHeaderShift = 0;
      for (let row = 0; row < rows + headerRowCount; row++) {
        if (headerAvailable && dataHeader.hasOwnProperty(row)) {
          rowHeaderShift += this.createHTMLCellHeader({ grid, dataHeader, columns, col, rows, row, headerRowCount });
        } else if (body != null) {
          this.createHTMLCellBody({ grid, cellColItem, columns, col, rows, row, rowHeaderShift, multiColumnCount });
        }
      }
    }
  },

  createWrapperCellHeader({ grid, headerItem, tableSize, row, col }) {
    if (headerItem.skip) return;
    const wrapper = document.createElement("div");
    if (headerItem.settings) {
      this.applyWrapperSettings({ wrapper, settings: headerItem.settings, index: headerItem.dataIndex, type: headerItem.type });
    }
    wrapper.classList.add(this.CSSGrid.tableWrapperHeader, this.CSSGrid.borderBottomThick, this.CSSGrid.borderRightThin);
    this.setGridRow(wrapper, row);
    this.setGridCol(wrapper, col, headerItem.colSpan);
    if (row == 0) {
      wrapper.style.position = "sticky";
      wrapper.style.top = "0px";
    }
    // TODO:     if (tableSize.rowsHeader > 1 && row < tableSize.rowsHeader - 1) this.styleNoBorderBottom(wrapper);
    if (row < tableSize.rowsHeader - 1) this.styleNoBorderBottom(wrapper);
    if (col == tableSize.colsHeader - 1) this.styleNoBorderRight(wrapper);
    grid.appendChild(wrapper);
    return wrapper;
  },

  createWrapperCellBody({ grid, bodyItem, tableSize, row, col }) {
    const wrapper = document.createElement("div");
    if (bodyItem.settings) {
      this.applyWrapperSettings({ wrapper, settings: bodyItem.settings, index: bodyItem.dataIndex, type: bodyItem.type });
    }
    wrapper.classList.add(this.CSSGrid.tableWrapperBody, this.CSSGrid.borderBottomThick, this.CSSGrid.borderRightThin);
    this.setGridRow(wrapper, row);
    this.setGridCol(wrapper, col, bodyItem.colSpan);
    // TODO:     if (tableSize.rowsHeader > 1 && row < tableSize.rowsHeader - 1) this.styleNoBorderBottom(wrapper);
    if (row < tableSize.rowsHeader - 1) this.styleNoBorderBottom(wrapper);
    if (col == tableSize.colsHeader - 1) this.styleNoBorderRight(wrapper);
    grid.appendChild(wrapper);
    return wrapper;
  },

  createHeaderCell({ wrapperHeader, headerItem }) {
    const type = headerItem.type ? headerItem.type : "Lbl";
    if (KadLog.errorCheckedLevel(!Object.keys(KadDOMElements.Elements).includes(type), 2, "Unsupported Type: ", type, "\nSupported types:\n-", Object.keys(KadDOMElements.Elements).join("\n- "))) return;

    const idName = headerItem?.idName;
    const idIndex = headerItem.dataIndex;
    const { id, name } = this.createID({ type, idName, idIndex, idNameDepth: 3 });

    const data = headerItem.data;
    const element = KadDOMElements.Elements[type]();
    element.id = id;
    wrapperHeader.appendChild(element);

    const initE = initEL({ id, resetValue: data, fn: headerItem.fn, settings: headerItem.settings });
    // KadLog.log(initE);
  },

  // apply Wrapper SETTINGS
  applyWrapperSettings({ wrapper, settings = null, index = null, type = null }) {
    for (let [key, value] of Object.entries(settings)) {
      if (key == "idName") continue;
      switch (key) {
        case "description":
          wrapper.title = value;
          break;
        case "thinBorder":
          {
            let valueArray = toArray(value);
            if (valueArray.includes("top")) wrapper.classList.add(this.CSSGrid.borderTopThin);
            if (valueArray.includes("right")) wrapper.classList.add(this.CSSGrid.borderRightThin);
            if (valueArray.includes("bottom")) wrapper.classList.add(this.CSSGrid.borderBottomThin);
            if (valueArray.includes("left")) wrapper.classList.add(this.CSSGrid.borderLeftThin);
          }
          break;
        case "thickBorder":
          {
            let valueArray = toArray(value);
            if (valueArray.includes("top")) wrapper.classList.add(this.CSSGrid.borderTopThick);
            if (valueArray.includes("right")) wrapper.classList.add(this.CSSGrid.borderRightThick);
            if (valueArray.includes("bottom")) wrapper.classList.add(this.CSSGrid.borderBottomThick);
            if (valueArray.includes("left")) wrapper.classList.add(this.CSSGrid.borderLeftThick);
          }
          break;
        case "noBorder":
          {
            let valueArray = toArray(value);
            if (valueArray.includes("top")) wrapper.classList.add(this.CSSGrid.borderTopNone);
            if (valueArray.includes("right")) wrapper.classList.add(this.CSSGrid.borderRightNone);
            if (valueArray.includes("bottom")) wrapper.classList.add(this.CSSGrid.borderBottomNone);
            if (valueArray.includes("left")) wrapper.classList.add(this.CSSGrid.borderLeftNone);
          }
          break;
        case "backgroundColor":
          wrapper.style.backgroundColor = KadColor.formatAsCSS({ colorArray: value });
          wrapper.style.color = KadColor.stateAsCSS({ colorArray: value });
          break;
        case "cursor":
          wrapper.style.cursor = value;
          break;
        case "align":
          wrapper.style.textAlign = value;
          break;
        case "justify":
          wrapper.style.alignContent = value;
          break;
        case "onclick":
          if (type == "Checkbox") break;
          let valueData = toArray(value);
          const callback = valueData.splice(0, 1)[0];
          wrapper.addEventListener("click", () => callback({ wrapper, index, data: valueData }));
          break;
        case "onmouseover":
          wrapper.addEventListener("mouseover", () => value(wrapper.childNodes[0], index), false);
          break;
        case "onmouseleave":
          wrapper.addEventListener("mouseleave", () => value(wrapper.childNodes[0], index), false);
          break;
        case "copy":
          const text = wrapper.childNodes[0].textContent;
          KadLog.log(text);
          wrapper.addEventListener("click", () => copyToClipboard(text), false);
          wrapper.style.cursor = "copy";
          break;
        default:
          if (!settingLists.element.includes(key)) {
            KadLog.log(`Unhandled Parameter ${key} in 'wrapper'.`, wrapper);
            break;
          }
          break;
      }
    }
  },

  // apply Body SETTINGS
  // applyBodySettings({ element, settings = null, index = null, type = null }) {
  //   for (let [key, value] of Object.entries(settings)) {
  //     if (key == "idName") continue;
  //     switch (key) {
  //       case "description":
  //         element.description = value;
  //         break;
  //       case "title":
  //         element.title = value;
  //         break;
  //       case "class":
  //         element.classList.add(...toArray(value));
  //         break;
  //       case "for":
  //         if (type != "Lbl") break;
  //         {
  //           let text = "idCheckbox";
  //           if (value === true) {
  //             text += `_${index}`;
  //           } else {
  //             text += `_${value}_${index}`;
  //           }
  //           element.setAttribute("for", text);
  //         }
  //         break;
  //       case "forLabel":
  //         if (type != "Lbl") break;
  //         let text = `idCheckbox_${value}`;
  //         element.setAttribute("for", text);
  //         break;
  //       case "font":
  //         if (toArray(value).includes("bold")) {
  //           element.style.fontWeight = "bold";
  //         }
  //         break;
  //       case "dList":
  //         if (!value[index]) break;
  //         const dList = document.createElement("datalist");
  //         dList.id = `dList_uInfo_${index}`;
  //         element.setAttribute("list", dList.id);
  //         element.appendChild(dList);
  //         for (let sug of value[index]) {
  //           dList.appendChild(new Option(sug));
  //         }
  //         break;
  //       case "backgroundColor":
  //         element.style.backgroundColor = KadColor.formatAsCSS({ colorArray: value[index] });
  //         element.style.color = KadColor.stateAsCSS({ colorArray: value[index] });
  //         break;
  //       case "cursor":
  //         element.style.cursor = value;
  //         break;
  //       case "uiSize":
  //       case "uiRadius":
  //       case "imgSize":
  //       case "uiType":
  //       case "uiFlex":
  //       case "uiFilter":
  //         if (["ButtonImage", "ButtonUrlImage"].includes(type)) {
  //           element.childNodes[0].setAttribute(key, value);
  //         }
  //         element.setAttribute(key, value);
  //         break;
  //       case "onclick":
  //         let valueData = toArray(value);
  //         const callback = valueData.splice(0, 1)[0];
  //         element.addEventListener("click", () => callback({ element, index, data: valueData }));
  //         break;
  //       default:
  //         if (!settingLists.wrapper.includes(key)) {
  //           KadLog.log(`Unhandled Parameter ${key} in 'cell'.`, element);
  //           break;
  //         }
  //         break;
  //     }
  //   }
  // },

  //helper
  createID({ type, idName = null, idIndex = null, idNameDepth = 3 }) {
    let name = idName === null ? stackFunctionName(idNameDepth).functionName : idName;
    if (idIndex != null) {
      name += `_${idIndex}`;
    }
    return { id: `id${type}_${name}`, name };
  },
  generateHeaderCells(header) {
    let headerTemp = Array.isArray(header[0]) ? header : [header];
    let headerArray = [];
    let rowsHeader = headerTemp.length;
    for (let r = 0; r < rowsHeader; r++) {
      let data = [];
      for (let i = 0; i < headerTemp[r].length; i++) {
        const head = headerTemp[r][i];
        data.push({
          skip: head.hasOwnProperty("skip") ? head.skip : null,
          type: head.hasOwnProperty("type") ? head.type : null,
          data: head.hasOwnProperty("data") ? head.data : null,
          idName: head.hasOwnProperty("idName") ? head.idName : null,
          dataIndex: i,
          colSpan: head.hasOwnProperty("colSpan") ? head.colSpan : null,
          fn: head.hasOwnProperty("fn") ? head.fn : null,
          settings: head.hasOwnProperty("settings") ? head.settings : null,
        });
        if (head.hasOwnProperty("colSpan")) {
          for (let j = 0; j < head.colSpan - 1; j++) {
            data.push({ skip: true });
          }
        }
      }
      headerArray[r] = data;
    }
    const colsHeader = headerArray[0].length;
    return { headerArray, rowsHeader, colsHeader };
  },
  appendDataIndexArray(array) {
    for (let i = 0; i < array.length; i++) {
      array[i].dataIndex = KadArray.createIndexedArray(array[i].length);
    }
  },
  getSplitBodyWithMultiColumns(body) {
    let bodyArray = [];
    for (let bodyItem of body) {
      bodyItem.multiColumn = bodyItem.multiColumn || 1;
      if (bodyItem.multiColumn == 1) {
        bodyArray.push(bodyItem);
      } else if (bodyItem.multiColumn > 1) {
        let numberOfElements = Math.ceil(bodyItem.data.length / bodyItem.multiColumn);
        for (let c = 0; c < bodyItem.multiColumn; c++) {
          let item = deepClone(bodyItem);
          item.data = item.data.splice(c * numberOfElements, (1 + c) * numberOfElements);
          item.dataIndex = item.dataIndex.splice(c * numberOfElements, (1 + c) * numberOfElements);
          bodyArray.push(item);
        }
      }
    }
    return bodyArray;
  },
  getBodyTableSize(body) {
    let colsBody = body.length;
    let rowsBody = 0;
    for (let i = 0; i < colsBody; i++) {
      rowsBody = Math.max(rowsBody, body[i].data.length);
    }
    return { rowsBody, colsBody };
  },
  setGridRow(wrapper, row) {
    wrapper.style.gridRow = row + 1;
  },
  setGridCol(wrapper, col, colSpan = null) {
    let span = colSpan === null ? 1 : colSpan;
    wrapper.style.gridColumn = `${col + 1} / span ${span}`;
  },
  setGridColumn(wrapper, col, columns, colSpan = undefined) {
    let span = 1;
    if (colSpan != undefined) {
      span = colSpan;
      if (col + span - 1 == columns - 1) wrapper.classList.add(this.CSSGrid.borderRightNone);
    }
    wrapper.style.gridColumn = `${col + 1} / span ${span}`;
  },
  styleNoBorderBottom(wrapper) {
    wrapper.classList.remove(this.CSSGrid.borderBottomThin, this.CSSGrid.borderBottomThick);
    wrapper.classList.add(this.CSSGrid.borderBottomNone);
  },
  styleNoBorderRight(wrapper) {
    wrapper.classList.remove(this.CSSGrid.borderRightThin, this.CSSGrid.borderRightThick);
    wrapper.classList.add(this.CSSGrid.borderRightNone);
  },
};
