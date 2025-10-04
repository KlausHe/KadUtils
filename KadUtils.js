export function dbID(id) {
  if (id instanceof Object) KadLog.logLevel(2, id, "should be a string!!!");
  return document.getElementById(id);
}
export function dbIDStyle(id) {
  if (id instanceof Object) return id.style;
  return document.getElementById(id).style;
}
export function dbCL(id, loc = 0) {
  if (loc === null) return document.getElementsByClassName(id);
  return document.getElementsByClassName(id)[loc];
}
export function dbCLStyle(id, loc = 0) {
  if (loc === null) return [...document.getElementsByClassName(id)].map((s) => s.style);

  return document.getElementsByClassName(id)[loc].style;
}
export function daEL(id, type, fn) {
  dbID(id).addEventListener(type, fn);
}
export function objectLength(obj) {
  return Object.keys(obj).length;
}
export function hostDebug() {
  return true ? ["localhost", "127.0.0.1"].includes(window.location.hostname) : false;
}
export function getFavicon(url, size = 15) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=${size}&url=${url}`;
}
export function deepClone(data) {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}
export function copyToClipboard(text, enabled = true) {
  if (!enabled) return;
  if (!navigator.clipboard) return;
  let val = text;
  if (!isNaN(val) && Number.isFinite(Number(val))) {
    val = val.toString().replace(/,/g, ""); //remove thousandscomma
    val = val.replace(".", ",");
  }
  navigator.clipboard.writeText(val);
}
export function toArray(val) {
  if (!Array.isArray(val)) return [val];
  return val;
}

export function initEL({ id = null, action = null, fn = null, selGroup = {}, selList = [], selStartIndex = null, selStartValue = null, dbList = [], btnCallbacks = [], resetValue = null, animatedText = {}, dateOpts = {}, domOpts = {}, uiOpts = {}, dataset = [] }) {
  if (KadLog.errorCheckedLevel(typeof id != "string", 3, "ID is not a string")) return;
  const Element = { HTML: document.getElementById(id) };
  const ElementHasChild = Element.HTML.hasChildNodes();
  if (ElementHasChild) {
    Element.FirstChild = Element.HTML.firstChild;
    Element.ChildNodes = Element.HTML.childNodes;
  }

  const typeAction = {
    text: "input",
    email: "input",
    password: "input",
    textarea: "input",
    number: "input",
    submit: "click",
    button: "click",
    "select-one": "change",
    select: "change",
    checkbox: "click",
    time: "input",
    date: "change",
    "datetime-local": "change",
    Canv: "keydown",
    DIV: "click",
    LABEL: "click",
  };

  const nonSettings = ["id", "action", "fn", "selGroup", "selList", "selStartIndex", "selStartValue", "dbList", "btnCallbacks", "resetValue", "animatedText", "dateOpts", "domOpts", "uiOpts", "dataset"];
  if (Object.keys(arguments[0]).some((key) => !nonSettings.includes(key)))
    KadLog.errorLevel(
      2,
      "Wrong arguments found: ",
      Object.keys(arguments[0])
        .filter((item) => !nonSettings.includes(item))
        .join(" / "),
      "\nSuported Items:\n",
      nonSettings.join(" / ")
    );
  const type = Element.HTML.type ? Element.HTML.type : Element.HTML.nodeName;
  if (fn) Element.HTML.addEventListener(action || typeAction[type], fn);
  // save initial parameters
  let list = selList;
  let groupList = selGroup;
  let startIndex = selStartIndex;
  let startValue = selStartValue;
  let callbacks = btnCallbacks || [];
  let callbackIndex = 0;
  let reset = resetValue;
  let animated = {
    static: objectLength(animatedText) === 0,
    animate: null,
    singleLetter: false,
    delimiter: "...",
    timestep: 20,
    timer: null,
    textContent: "",
    ...animatedText,
  };
  let dateFormating = { format: null, dateObject: null, ...dateOpts };

  // apply options
  if (domOpts != null) {
    // KadLog.log(domOpts);
    for (let [key, val] of Object.entries(domOpts)) {
      Element.HTML[key] = val;
    }
  }
  // apply styling
  makeAttributes(uiOpts);
  // fill "datasets"
  makeDatasets(dataset);
  // fill "datalist"
  makeDBlist(dbList);
  // fill "Select"
  makeSelList(list);
  // fill "Grouped Select"
  makeGroupList(groupList);

  // add GET
  if (["number"].includes(type)) {
    Element.KadGet = function ({ failSafe = null, noPlaceholder = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadGet() expects an object!")) return;
      let fail = failSafe != null ? failSafe : resetValue;
      return KadDOM.numberFromInput({ Element: Element.HTML, failSafeVal: fail, noPlaceholder });
    };
  }
  if (action != "focus" && ["text", "email", "password", "textarea"].includes(type)) {
    Element.KadGet = function ({ failSafe = null, noPlaceholder = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadGet() expects an object!")) return;
      let fail = failSafe != null ? failSafe : resetValue;
      fail = noPlaceholder != null ? null : fail;
      return KadDOM.stringFromInput({ Element: Element.HTML, failSafeVal: fail, noPlaceholder });
    };
  }
  if (action != "focus" && ["select-one", "select"].includes(type)) {
    Element.KadGet = function ({ textContent = null, index = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadGet() expects an object!")) return;
      if (textContent) return Element.HTML.options[Element.HTML.selectedIndex].textContent;
      if (index) return Element.HTML.selectedIndex;
      return Element.HTML.value;
    };
  }
  if (action != "focus" && ["time", "date", "datetime-local"].includes(type)) {
    Element.KadGet = function ({ format = null, dateObject = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadGet() expects an object!")) return;
      dateFormating.format = format != null ? format : dateFormating.format;
      dateFormating.dateObject = dateObject != null ? dateObject : dateFormating.dateObject;

      let returnValue = Element.HTML.value;
      if (dateFormating.format != null) {
        returnValue = KadDate.getDate(returnValue, { format: dateFormating.format });
      }
      if (dateFormating.dateObject != null) {
        returnValue = new Date(returnValue);
      }
      return returnValue;
    };
  }
  if (["checkbox"].includes(type)) {
    Element.KadGet = function () {
      return Element.HTML.checked;
    };
  }
  if (["button", "submit"].includes(type)) {
    Element.KadGet = function () {
      return Element.HTML.value;
    };
  }

  // add SET
  if (["DIV", "LABEL", "p"].includes(type)) {
    Element.KadSetText = function (text = null) {
      if (text) animated.textContent = text;
      if (animated.static) {
        Element.HTML.textContent = animated.textContent;
      } else {
        Element.HTML.style.cursor = "pointer";
        Element.HTML.addEventListener("click", toggleTextAnimationText, { once: true });
        if (!animated.animate) {
          Element.HTML.textContent = animated.textContent;
        } else {
          if (animated.timer != null) clearTimeout(animated.timer);
          animated.timer = null;
          typingAnimation(Element, "textContent");
        }
      }
    };
    Element.KadSetHTML = function (text = null) {
      if (text) animated.textContent = text;
      if (animated.static) {
        Element.HTML.innerHTML = animated.textContent;
      } else {
        Element.HTML.style.cursor = "pointer";
        Element.HTML.addEventListener("click", toggleTextAnimationHtml, { once: true });
        if (!animated.animate) {
          Element.HTML.innerHTML = animated.textContent;
        } else {
          if (animated.timer != null) clearTimeout(animated.timer);
          animated.timer = null;
          typingAnimation(Element, "innerHTML");
        }
      }
    };
  }
  if (["button", "submit"].includes(type)) {
    Element.KadButtonColor = function (state = null) {
      KadDOM.btnColor(Element.HTML, state);
    };
    Element.KadSetText = function (text = null) {
      Element.HTML.textContent = text;
    };
    Element.KadSetHTML = function (text = null) {
      Element.HTML.innerHTML = text;
    };
    if (callbacks.length > 0) {
      Element.KadNext = function () {
        callbackIndex = (callbackIndex + 1) % callbacks.length;
        let callbackIndexNext = (callbackIndex + 1) % callbacks.length;
        Element.HTML.textContent = callbacks[callbackIndexNext][0];
        if (callbacks[callbackIndex][1] != undefined) {
          callbacks[callbackIndex][1]();
        }
        return callbackIndex;
      };
      Element.HTML.addEventListener(action || typeAction[type], function () {
        Element.KadNext();
      });
    }
    if (Element.HTML.dataset.radio) {
      Element.KadRadioColor = function () {
        const buttons = document.querySelectorAll(`[data-radio~=${Element.HTML.dataset.radio}]`);
        for (let button of buttons) {
          KadDOM.btnColor(button, null);
        }
        Element.KadButtonColor("positive");
      };
      Element.HTML.addEventListener(action || typeAction[type], function () {
        Element.KadRadioColor();
      });
    }
  }
  if (["text", "email", "password", "textarea", "number"].includes(type)) {
    Element.KadSetValue = function (text = null) {
      if (text) Element.HTML.value = text;
    };
  }
  if (["select-one", "select"].includes(type)) {
    if (action != "focus") {
      Element.KadSetIndex = function (index = null) {
        Element.HTML.selectedIndex = index;
        return index;
      };
    }
  }
  if (["PROGRESS"].includes(type)) {
    Element.KadSetValue = function (value = null) {
      if (value) Element.HTML.setAttribute("value", value);
    };
    Element.KadSetMax = function (value = null) {
      if (value) Element.HTML.setAttribute("max", value);
    };
    Element.KadSetMin = function (value = null) {
      if (value) Element.HTML.setAttribute("min", value);
    };
    Element.KadSetAttribute = function (value = null, att) {
      if (value) Element.HTML.setAttribute(att, value);
    };
  }

  // add RESET
  if (["select-one", "select"].includes(type)) {
    Element.KadReset = function ({ selGroup = {}, selList = [], selStartIndex = null, selStartValue = null, textContent = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadReset() expects an object!")) return;
      startIndex = selStartIndex != null ? selStartIndex : startIndex;
      startValue = selStartValue != null ? selStartValue : startValue;

      if (selList.length > 0) {
        KadDOM.clearFirstChild(Element.HTML);
        list = [...selList];
        makeSelList(list);
      } else if (objectLength(selGroup) > 0) {
        KadDOM.clearFirstChild(Element.HTML);
        groupList = selGroup;
        makeGroupList(groupList);
      } else if (list.length > 0) {
        let select = checkReturn(startIndex, startValue);
        for (let i = 0; i < list.length; i++) {
          let data = list[i];
          let d = Array.isArray(data) ? data : [data];
          if (select[1] == "value" && d[0] == select[0]) {
            Element.HTML.options[i].selected = true;
            break;
          }
        }
        if (select[1] == "index") Element.HTML.selectedIndex = select[0];
      } else if (objectLength(groupList) > 0) {
        let select = checkReturn(startIndex, startValue);
        for (let [groupName, list] of Object.entries(groupList)) {
          for (let i = 0; i < list.length; i++) {
            let data = list[i];
            let d = Array.isArray(data) ? data : [data];
            if (select[1] == "value" && select[0] == d[1]) {
              Element.HTML.options[i].selected = true;
            }
          }
        }
        if (select[1] == "index") Element.HTML.selectedIndex = select[0];
      }
      if (textContent) {
        return Element.HTML.options[Element.HTML.selectedIndex].value;
      } else {
        return checkReturn(startIndex, startValue)[0];
      }
    };
  } else if (["time", "date", "datetime-local"].includes(type)) {
    Element.KadReset = function ({ resetValue = null, format = null, dateObject = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadReset() expects an object!")) return;
      reset = resetValue != null ? resetValue : reset;
      resetInput(Element.HTML, type, reset);
      dateFormating.format = format != null ? format : dateFormating.format;
      dateFormating.dateObject = dateObject != null ? dateObject : dateFormating.dateObject;
      let returnValue = Element.HTML.value;
      if (dateFormating.format != null) {
        returnValue = KadDate.getDate(returnValue, { format: dateFormating.format });
      }
      if (dateFormating.dateObject != null) {
        returnValue = new Date(returnValue);
      }
      return returnValue;
    };
  } else if (["text", "number"].includes(type)) {
    Element.KadReset = function ({ resetValue = null, dbList = [] } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadReset() expects an object!")) return;
      reset = resetValue != null ? resetValue : reset;
      resetInput(Element.HTML, type, reset);
      if (dbList.length > 0) makeDBlist(dbList);
      return reset;
    };
  } else if (["button", "submit"].includes(type)) {
    Element.KadReset = function ({ resetValue = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadReset() expects an object!")) return;
      reset = resetValue != null ? resetValue : reset;
      resetInput(Element.HTML, type, reset);
      if (callbacks.length > 0) {
        if (KadLog.errorChecked(callbacks.length < 2, "Button.Callbacks expects an a List  >= 2 elements!")) return;
        callbackIndex = callbacks.length - 1;
        Element.HTML.textContent = callbacks[(callbackIndex + callbacks.length - 1) % callbacks.length][0];
        return 0;
      }
      return reset;
    };
  } else {
    Element.KadReset = function ({ resetValue = null } = {}) {
      if (KadLog.errorCheckedLevel(checkObjectType(typeof arguments[0]), 2, "KadReset() expects an object!")) return;
      reset = resetValue != null ? resetValue : reset;
      resetInput(Element.HTML, type, reset);
      return reset;
    };
  }
  Element.KadReset(); //call reset() on startup to initialize reset-Values

  // add Enable
  if (["DIV", "LABEL"].includes(type)) {
    Element.KadEnable = function (state = true) {
      if (state) Element.KadSetText(Element.HTML.textContent);
      else Element.KadSetHTML(`<del>${Element.HTML.textContent}</del>`);
    };
  } else {
    Element.KadEnable = function (state = true) {
      if (state) Element.HTML.removeAttribute("disabled");
      else Element.HTML.setAttribute("disabled", "true");
    };
  }

  // finished! return the HTML-Object
  return Element;

  function makeAttributes(uiOpts) {
    if (uiOpts != null) {
      // KadLog.log(uiOpts);
      for (let [key, value] of Object.entries(uiOpts)) {
        Element.HTML.setAttribute(key, value);
      }
    }
  }
  function makeDatasets(dataset) {
    if (dataset.length > 0) {
      const datasetArray = !Array.isArray(dataset[0]) ? [dataset] : dataset;
      for (let set of datasetArray) {
        Element.HTML.dataset[set[0]] = set[1];
      }
    }
  }
  function makeDBlist(dbList) {
    if (dbList.length == 0) return;
    Element.HTML.addEventListener(
      "focus",
      () => {
        const datalist = document.createElement("datalist");
        datalist.id = `idDlist_${Element.HTML.id}`;
        Element.HTML.parentNode.appendChild(datalist);
        Element.HTML.setAttribute("list", datalist.id);
        for (const data of dbList) {
          datalist.appendChild(new Option(data));
        }
      },
      { once: true }
    );
  }
  function makeSelList(list = []) {
    if (list.length == 0) return;
    KadDOM.clearFirstChild(Element.HTML);
    let select = checkReturn(startIndex, startValue);
    for (let data of list) {
      let d = Array.isArray(data) ? data : [data];
      const opt = new Option(...d);
      opt.disabled = d.length > 2 ? d[2] : false;
      Element.HTML.appendChild(opt);
      if (select[1] == "value" && select[0] == d[1]) {
        opt.selected = true;
      }
    }
    if (select[1] == "index") Element.HTML.selectedIndex = select[0];
  }
  function makeGroupList(groupList = {}) {
    if (objectLength(groupList) == 0) return;
    KadDOM.clearFirstChild(Element.HTML);
    let select = checkReturn(startIndex, startValue);
    for (let [groupName, list] of Object.entries(groupList)) {
      let optG;
      if (groupName) {
        optG = document.createElement("optgroup");
        Element.HTML.appendChild(optG);
        optG.label = groupName;
      }
      for (let data of list) {
        let d = Array.isArray(data) ? data : [data];
        const opt = new Option(...d);
        opt.disabled = d.length > 2 ? d[2] : false;
        optG.appendChild(opt);
        if (select[1] == "value" && select[0] == d[1]) {
          opt.selected = true;
        }
      }
    }
    if (select[1] == "index") Element.HTML.selectedIndex = select[0];
  }

  function typingAnimation(Element, setType) {
    let writtenText = "";
    let tokenIndex = 0;
    const tokenlist = animated.textContent;
    function newToken() {
      let finished = false;
      writtenText = writtenText.slice(0, -1 * animated.delimiter.length);
      const thisToken = tokenlist[tokenIndex];
      let nextTime = animated.timestep;
      if (new RegExp(/\W+/).test(thisToken)) {
        nextTime = animated.timestep * 1;
      }
      if (animated.singleLetter) {
        writtenText += `${thisToken}`;
        tokenIndex++;
      } else {
        const upcommingList = tokenlist.slice(tokenIndex);
        const jumpLength = upcommingList.indexOf(" ");
        if (jumpLength == -1) {
          finished = true;
        } else {
          const word = upcommingList.slice(0, jumpLength);
          tokenIndex += jumpLength + 1;
          nextTime = animated.timestep * jumpLength * 0.75;
          writtenText += `${word} `;
        }
      }
      if (tokenIndex >= tokenlist.length - 1) finished = true;
      if (!finished) {
        writtenText += `${animated.delimiter}`;
        animated.timer = setTimeout(newToken, nextTime);
      }
      Element.HTML[setType] = writtenText;
      KadDOM.scrollToBottom(Element.HTML);
    }
    newToken();
  }
  function toggleTextAnimationText() {
    animated.animate = !animated.animate;
    clearTimeout(animated.timer);
    Element.KadSetText();
  }
  function toggleTextAnimationHtml() {
    animated.animate = !animated.animate;
    clearTimeout(animated.timer);
    Element.KadSetHTML();
  }

  function checkReturn(startIndex, startValue) {
    let indexNull = startIndex === null;
    let valueNull = startValue === null;
    if (indexNull && valueNull) {
      return [0, "index"];
    } else if (!indexNull && valueNull) {
      return [startIndex, "index"];
    } else if ((indexNull && !valueNull) || (!indexNull && !valueNull)) {
      return [startValue, "value"];
    }
    return null;
  }
  function checkObjectType(typeString) {
    if (typeString == "undefined") return false;
    if (typeString != "object") return true;
  }
  function resetInput(obj, type, value = null) {
    if (ElementHasChild) return; // do not reset when a Childnode like an Image exists
    switch (type) {
      case "date":
      case "time":
      case "datetime-local":
      case "color":
        obj.value = value;
        break;
      case "submit":
      case "DIV":
      case "LABEL":
      case "button":
        obj.textContent = value;
        break;
      case "checkbox":
        obj.checked = value;
        break;
      default:
        obj.placeholder = value;
        obj.value = "";
    }
  }
}

export function stackFunctionName(level = 0) {
  const levelString = Error().stack.split(/\r?\n|\r|\n/g);
  const l = Math.min(Math.max(0, level + 1), levelString.length - 1); // "+2" to ignore log-chain in KadUtils
  let arr = levelString[l].split(/[@://]{1,}/);
  const fileIndex = arr.findIndex((e) => e.includes(".js"));
  let path = "/";
  for (let i = 4; i < fileIndex; i++) {
    path += `${arr[i]}/`;
  }
  path += arr[fileIndex];
  const functionName = arr[0];
  return { path, functionName };
}

export const KadLog = {
  getStackFunctionAt(level = 0) {
    const levelString = Error().stack.split(/\r?\n|\r|\n/g);
    const l = Math.min(Math.max(0, level + 2), levelString.length - 2); // "+2" to ignore log-chain in KadUtils
    let arr = levelString[l].split(/[@://]{1,}/);
    const fileIndex = arr.findIndex((e) => e.includes(".js"));
    let path = "/";
    for (let i = 4; i < fileIndex; i++) {
      path += `${arr[i]}/`;
    }
    const text = `${path}${arr[fileIndex]}: ${arr[0]}()\nLn:${arr[fileIndex + 1]}\n`;
    return { text };
  },
  drawLog(error, level, ...args) {
    if (!hostDebug()) return;
    if (typeof level !== "number") {
      console.error("Level has to be a Number!");
      return false;
    }
    if (args.length == 0) {
      console.group(`%cYou are here:\n%c ${this.getStackFunctionAt(level).text}`, "background: lightblue; color: black", "background: default; color: default");
    } else if (error) {
      console.group(`%c${this.getStackFunctionAt(level).text}`, "background: red; color: black");
    } else {
      console.group(`%c${this.getStackFunctionAt(level).text}`, "background: yellow; color: black");
    }
    if (args.length > 0) console.log(...args);
    console.groupEnd();
  },

  drawTable(error, level, ...args) {
    if (!hostDebug()) return;
    if (typeof level !== "number") {
      console.error("Level has to be a Number!");
      return false;
    }
    if (args.length == 0) {
      console.group(`%cYou are here:\n%c ${this.getStackFunctionAt(level).text}`, "background: lightblue; color: black", "background: default; color: default");
    } else if (error) {
      console.group(`%c${this.getStackFunctionAt(level).text}`, "background: red; color: black");
    } else {
      console.group(`%c${this.getStackFunctionAt(level).text}`, "background: yellow; color: black");
    }
    if (args.length > 0) console.table(...args);
    console.groupEnd();
  },

  log(...args) {
    this.drawLog(false, 1, ...args);
  },

  logLevel(level, ...args) {
    this.drawLog(false, level, ...args);
  },
  logChecked(state, ...args) {
    if (!state) return false;
    this.drawLog(false, 1, ...args);
    return true;
  },
  logCheckedLevel(state, level, ...args) {
    if (!state) return false;
    this.drawLog(false, level, ...args);
    return true;
  },

  error(...args) {
    this.drawLog(true, 1, ...args);
  },
  errorLevel(level, ...args) {
    this.drawLog(true, level, ...args);
  },
  errorChecked(state, ...args) {
    if (!state) return false;
    this.drawLog(true, 1, ...args);
    return true;
  },
  errorCheckedLevel(state, level, ...args) {
    if (!state) return false;
    this.drawLog(true, level, ...args);
    return true;
  },

  table(...args) {
    this.drawTable(false, 1, ...args);
  },

  tableLevel(level, ...args) {
    this.drawTable(false, level, ...args);
  },
  tableChecked(state, ...args) {
    if (!state) return false;
    this.drawTable(false, 1, ...args);
    return true;
  },
  tableCheckedLevel(state, level, ...args) {
    if (!state) return false;
    this.drawTable(false, level, ...args);
    return true;
  },
};

export const KadFile = {
  /**
   * @async
   * @param {{ variable?: string; url?: string; variableArray?: array; urlArray?: array; callback?: function; errorCallback?: function; }} [param0={}]
   * @param {string} [param0.variable=null]
   * @param {string} [param0.url=null]
   * @param {array} [param0.variableArray=null]
   * @param {array} [param0.urlArray=null]
   * @param {function} [param0.callback=null]
   * @param {function} [param0.errorCallback=null]
   * @returns {object}
   */

  currentRequestTimers: {},

  async loadUrlToJSON({ variable = null, url = null, variableArray = null, urlArray = null, callback = null, errorCallback = null, callbackDelay = 1000 } = {}) {
    if (KadLog.errorCheckedLevel(url == null && urlArray == null, 2, "No URL is provided!")) return;
    if (KadLog.errorCheckedLevel(variable != null && urlArray != null, 2, "Multiple URLS are called but only one variable porvided! Use ...Array consitantly")) return;
    if (KadLog.errorCheckedLevel(variableArray != null && url != null, 2, "One URL was called but multiple variables porvided! Don't use ...Array for a singe URL")) return;
    if (KadLog.errorCheckedLevel(callback == null && errorCallback == null && variable == null && variableArray == null, 2, "No way to return the data is provided! use callback or variable")) return;

    const requestName = stackFunctionName(1).functionName;

    if (KadFile.currentRequestTimers.hasOwnProperty(requestName)) {
      clearTimeout(KadFile.currentRequestTimers[requestName]);
      delete KadFile.currentRequestTimers[requestName];
    }

    let urls = url != null ? [url] : urlArray;
    let vars = url != null ? [variable] : variableArray;

    let urlData = { error: null };
    for (let i = 0; i < urls.length; i++) {
      urlData[vars[i]] = urls[i];
    }

    await KadFile.getDataURL(urlData);

    if (callback == null) return urlData;
    if (urlData.error != null) {
      if (errorCallback == null) {
        KadLog.log("no ErrorCallback() for", url, "but an Error occured!");
        return;
      }
      errorCallback(urlData.error);
    } else {
      delete urlData.error;
      KadFile.currentRequestTimers[requestName] = setTimeout(() => callback(urlData), callbackDelay);
    }
  },

  async getDataURL(urlData) {
    let vars = Object.keys(urlData);
    try {
      for await (let variable of vars) {
        if (variable == "error") continue;
        const response = await fetch(urlData[variable]);
        urlData[variable] = await response.json();
      }
    } catch (err) {
      urlData.error = err;
    }
  },

  /**
   *
   *
   * @param {*} data
   * @param {('text'|'json'|'map')} type
   * @param {string} [fileName="KadFile"]
   */
  download(data, type = "json", fileName = "KadFile") {
    const file = {
      text: {
        get Blob() {
          return new Blob([data], { type: "text/plain" });
        },
        postfix: "txt",
      },
      json: {
        get Blob() {
          return new Blob([JSON.stringify(data)], { type: "application/json" });
        },
        postfix: "json",
      },
      map: {
        get Blob() {
          return new Blob([JSON.stringify(Array.from(data))], { type: "application/json" });
        },
        postfix: "json",
      },
    };
    if (KadLog.errorChecked(!Object.keys(file).includes(type), `Type '${type}' is not supported! Supported types:\n${Object.keys(file).join(", ")}`)) {
      return null;
    }
    const ref = document.createElement("a");
    ref.href = URL.createObjectURL(file[type].Blob);
    ref.download = `${fileName}.${file[type].postfix}`;
    ref.click();
    URL.revokeObjectURL(ref.href);
  },
};
export const KadCSS = {
  getRoot({ value = null, noUnit = true, RemToPx = false }) {
    const obj = `--${value}`;
    const valOrig = getComputedStyle(document.body).getPropertyValue(obj);
    const unit = valOrig.match(/[a-zA-Z]{1,}/g);

    if (RemToPx == true && unit == "rem") {
      const size = Number(getComputedStyle(document.body).getPropertyValue("--fontSize").replace(/px/g, ""));
      const valConverted = Number(valOrig.replace(/rem/g, ""));
      return Number(size * valConverted);
    }
    if (noUnit == false) return getComputedStyle(document.body).getPropertyValue(obj).trim();
    const valConverted = valOrig.replace(/s|px|rem/g, "");
    return Number(valConverted);
  },

  setRoot({ variable = null, value = null, dim = null } = {}) {
    const unit = dim == null ? "" : dim;
    document.styleSheets[0].cssRules[0].style.setProperty(`--${variable}`, `${value}${unit}`);
  },
};
export const KadDOM = {
  scrollToTop(Element = null) {
    let ID = Element == null ? document.documentElement : Element;
    ID.scroll({
      top: 0,
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  },
  scrollToBottom(Element = null) {
    let ID = Element == null ? document.documentElement : Element;
    ID.scroll({
      // top: ID.scrollHeight,
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  },
  scrollInView(Element = null) {
    let ID = Element == null ? document.documentElement : Element;
    ID.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  },
  getImgPath(name) {
    return `Data/Images/${name}.svg`;
  },
  htmlSetButtonType(id = null) {
    // if (id && dbID(id).nameTag == "BUTTON") {
    //   dbID(id).type = "button";
    // } else {
    const buttons = document.getElementsByTagName("button");
    for (let button of buttons) {
      button.type = "button";
    }
    // }
  },
  htmlSetVinChange() {
    const dirName = ["oSub", "trash", "oAdd"];
    envoked("vinChangeSub", -1);
    envoked("vinChangeTrash", 0);
    envoked("vinChangeAdd", 1);

    function envoked(name, dir) {
      const obj = dbCL(`${name}`, null);
      for (let btn of obj) {
        btn.onclick = () => {
          return KadDOM.vinChange(btn, dir);
        };
        const name = dirName[dir + 1];
        const img = document.createElement("img");
        img.classList.add(`img_${name}`);
        // img.setAttribute("alt", `${name}.svg`); // <-- this diesnt work in safari for what ever reason...
        btn.appendChild(img);
      }
    }
  },
  resetInput(obj, ph = null, domOpts = null) {
    KadLog.logChecked(typeof obj != "string", "Object should be a string!");
    const type = obj.type ? obj.type : obj.nodeName;
    if (obj.type == "checkbox") {
      obj.checked = ph;
      return ph;
    }
    if (obj.type == "button") {
      obj.textContent = ph;
      return ph;
    }
    if (domOpts != null) {
      for (let [key, val] of Object.entries(domOpts)) {
        obj[key] = val;
      }
    }
    if (ph != null) {
      if (["submit", "button", "DIV", "LABEL"].includes(type)) {
        obj.textContent = ph;
      } else if (type == "date") {
        obj.value = ph;
      } else if (type == "time") {
        obj.value = ph;
      } else if (type == "datetime-local") {
        obj.value = ph;
      } else if (type == "color") {
        obj.value = ph;
      } else {
        obj.placeholder = ph;
        obj.value = "";
      }
    }
    return Number(obj.placeholder);
  },
  enableBtn(id, state) {
    const obj = dbID(id);
    if (state) obj.removeAttribute("disabled");
    else obj.setAttribute("disabled", "true");
  },
  btnColor(obj, opt = null) {
    KadLog.logChecked(typeof obj == "string", `${obj} should be a HTML Object`);
    if (opt === null) obj.classList.remove("btnPositive", "btnNegative", "btnBasecolor");
    else if (opt === "positive") obj.classList.add("btnPositive");
    else if (opt === "negative") obj.classList.add("btnNegative");
    else if (opt === "colored") obj.classList.add("btnBasecolor");
  },
  vinChange(Element = null, direction) {
    const id = dbID(Element);
    let obj = null;
    let siblingList = Array.from(id.parentNode.children);
    for (let i = siblingList.indexOf(id) - 1; i >= 0; i--) {
      if (siblingList[i].type != "button" && siblingList[i].type != "submit") {
        obj = siblingList[i];
        break;
      }
    }
    if (obj == null) return;
    if (obj.disabled) return;
    const dir = Number(direction);
    if (obj.type == "time") evaluateTime();
    if (["submit", "number"].includes(obj.type)) evaluateNumber();
    obj.dispatchEvent(new Event("input"));
    obj.focus();
    function evaluateTime() {
      const h = Number(obj.value.slice(0, 2));
      const m = Number(obj.value.slice(3, 5));
      let time = m + h * 60 + dir;
      // time += time % 5 == 0 ? dir * 5 : dir;  // <-- used to skip to next 5/10 number... confusing->deactivated
      const t = KadDate.minutesToObj(time);
      obj.value = `${t.h}:${t.m}`;
    }
    function evaluateNumber() {
      if (dir == 0) {
        // const time = new Date().getTime();
        // obj.setAttribute("data-ts", time);
        if (Number(obj.value) === 0 || Number(obj.value) === Number(obj.min)) {
          obj.value = "";
          return;
        }
        obj.value = obj.min || 0;
        return;
      }
      // const time = new Date().getTime();
      // let skip = false;
      // if (obj.hasAttribute("data-ts")) {
      // 	if (time - obj.dataset.ts < 1500) skip = true;
      // }
      // obj.setAttribute("data-ts", time);
      // const actual = obj.value == "" && obj.placeholder != "" ? Number(obj.placeholder) : Number(obj.value);
      // let num = 0;
      // if (obj.hasAttribute("step")) {
      // 	num = actual + dir * Number(obj.step);
      // } else {
      // num = skip && actual % 5 == 0 ? actual + dir * 5 : actual + dir;
      // }
      const actual = obj.value == "" && obj.placeholder != "" ? Number(obj.placeholder) : Number(obj.value);
      let num = actual + dir;
      const min = obj.hasAttribute("min") && dir < 1 ? Number(obj.min) : null;
      const max = obj.hasAttribute("max") && dir > 0 ? Number(obj.max) : null;
      obj.value = KadValue.constrain(num, min, max);
    }
  },
  numberFromInput({ Element = null, failSafeVal = null, noPlaceholder = null } = {}) {
    if (!isNaN(Element.valueAsNumber)) return Element.valueAsNumber;
    if (failSafeVal != null) return failSafeVal;
    if (noPlaceholder != null) return null;
    return Number(Element.placeholder);
  },
  stringFromInput({ Element = null, failSafeVal = null, noPlaceholder = true } = {}) {
    const value = Element.value.trim();
    if (value != "") return Element.value;
    if (failSafeVal != null) return failSafeVal;
    if (noPlaceholder != null) return "";
    return Element.placeholder;
  },
  clearFirstChild(Element = null) {
    while (Element.firstChild) {
      Element.removeChild(Element.firstChild);
    }
    return Element;
  },
};
export const KadInteraction = {
  focus(id, canv = null) {
    if (canv != null) canv.loop();
    document.getElementById(id).focus();
  },
  unfocus(id, canv) {
    if (canv != null) {
      canv.noLoop();
      canv.redraw();
    }
    document.getElementById(id).blur();
  },
  removeContextmenu(id) {
    const obj = document.getElementById(id);
    obj.oncontextmenu = function () {
      return false;
    };
  },
  //
  // focus(obj, canv = null) {
  //   if (canv != null) canv.loop();
  //   dbID(obj).focus();
  // },
  // unfocus(obj, canv) {
  //   dbID(obj).blur();
  //   if (canv != null) {
  //     canv.noLoop();
  //     canv.redraw();
  //   }
  // },
  // removeContextmenu(id) {
  //   dbID(id).oncontextmenu = function () {
  //     return false;
  //   };
  // },
};
export const KadValue = {
  number(value = 1, { form = null, indicator = "", leadingDigits = 1, decimals = 1, currency = null, unit = null, notation = "standard" } = {}) {
    const formating = form == null ? "de-DE" : indicator == "," ? "de-DE" : "en-EN";
    let options = {
      useGrouping: indicator,
      notation: notation,
      minimumIntegerDigits: leadingDigits,
      maximumFractionDigits: decimals,
    };
    if (options.notation == "engineering" || options.notation == "scientific") {
      if (value < 1000 && value > -1000) {
        options.notation = "standard";
        options.maximumFractionDigits = 1;
      }
    }
    if (currency) {
      options.useGrouping = true;
      options.style = "currency";
      options.currency = currency;
      options.maximumFractionDigits = 3;
    }
    if (unit) {
      options.style = "unit";
      options.unit = unit;
      options.unitDisplay = "short";
      options.useGrouping = true;
    }

    return Intl.NumberFormat(formating, options).format(value);
  },
  constrain(val, min = null, max = null) {
    if (min == null && max == null) return val;
    if (min != null && max != null) return Math.max(Math.min(val, max), min);
    if (min == null && max != null) return Math.min(val, max);
    if (min != null && max == null) return Math.max(val, min);
  },
  mapping(i, start1, stop1, start2, stop2, bounds = false) {
    const val = ((i - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    if (!bounds) return val;
    const up = Math.max(start2, stop2);
    const down = Math.min(start2, stop2);
    return this.constrain(val, down, up);
  },
  // untested!!!
  constrainArray(arr, val, low = null, high = null) {
    const arrayMin = Math.min(...arr);
    const arrayMax = Math.max(...arr);
    let a = low || arrayMin;
    let b = high || arrayMax;
    this.constrain(val, a, b);
  },
  numberInRange(value, ...range) {
    if (range.length == 1) {
      return !(value < -range[0] || value > range[0]);
    }
    if (range.length > 1) {
      return !(value < range[0] || value > range[1]);
    }
  },
  numberInBound(value, target, offset) {
    return this.numberInRange(value, target - offset, target + offset);
  },
};
export const KadArray = {
  createArray({ x = null, y = null, fillNumber = null } = {}) {
    if (y == null && fillNumber == null) return new Array(x).fill(0).map((n, i) => i);
    if (y == null && fillNumber != null) return new Array(x).fill(fillNumber);
    let arrX = new Array(x);
    if (fillNumber == null) {
      for (let i = 0; i < arrX.length; i++) {
        arrX[i] = arrX[i] = new Array(y);
      }
    } else {
      for (let i = 0; i < x; i++) {
        arrX[i] = new Array(y).fill(fillNumber);
      }
    }
    return arrX;
  },
  createIndexedArray(x, y = null, offset = 0) {
    if (y == null) {
      return new Array(x).fill(0).map((n, i) => i + offset);
    }
    let arrXY = [];
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        arrXY.push([i + offset, j + offset]);
      }
    }
    return arrXY;
  },
  indexTo2DxyPosition(index, col) {
    const i = Math.floor(index / col);
    const j = index % col;
    return { i, j };
  },
  arrayFromNumber(obj, num = null) {
    if (num == null && typeof obj == "number") return [...Array(obj).keys()];
    if (typeof obj == "number" && typeof num == "number") {
      const min = Math.min(obj, num);
      const max = Math.max(obj, num);
      let arr = [];
      for (let i = min; i <= max; i++) {
        arr.push(i);
      }
      return arr;
    }
  },
  getNearestValueInArray(arr, val, higher = false) {
    return arr.reduce((prev, curr) => {
      if (higher) return Math.abs(curr - val) > Math.abs(prev - val) ? curr : prev;
      else return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
    });
  },
  sortArrayByKey({ array = [], keys = [], key = null, inverse = false, caseSensitive = false } = {}) {
    if (KadLog.errorChecked(key == null && keys.length == 0, "No 'Key' or 'Keys' to sort passed!")) return;
    if (KadLog.errorChecked(Array.isArray(key), "'key' should not be an array! Use 'keys' instead")) return;

    let keyArray = keys;
    if (key !== null) keyArray = toArray(key);

    let arr = Array.from(array);

    return arr.sort((a, b) => {
      let valueA = a;
      let valueB = b;
      for (let key of keyArray) {
        valueA = valueA[key];
        valueB = valueB[key];
      }
      if (typeof valueA == "number" && typeof valueB == "number") {
        return inverse ? valueB - valueA : valueA - valueB;
      } else {
        const x = caseSensitive ? valueA.toLowerCase() : valueA;
        const y = caseSensitive ? valueB.toLowerCase() : valueB;
        const comp = x.localeCompare(y);
        const dir = inverse ? -1 : 1;
        return comp * dir > 0;
      }
    });
  },
  getIndexByKey(array, key, value) {
    for (let i = 0; i < array.length; i++) {
      if (array[i][key] === value) return i;
    }
    return null;
  },
  getElementbyKey(array, key, value) {
    for (let i = 0; i < array.length; i++) {
      if (array[i][key] === value) return array[i];
    }
    return null;
  },
};
export const KadRandom = {
  randomIndex(obj) {
    if (typeof obj == "string") return Math.floor(Math.random() * obj.length);
    if (Array.isArray(obj)) return Math.floor(Math.random() * obj.length);
    if (!Number.isNaN(obj)) return Math.floor(Math.random() * obj);
    return Math.floor(Math.random() * Object.keys(obj).length);
  },
  randomObject(obj, top = null) {
    if (typeof obj == "number") return KadRandom.randomObject(KadArray.arrayFromNumber(obj, top));
    if (typeof obj == "string") return obj[KadRandom.randomIndex(obj)];
    if (Array.isArray(obj) && obj.length <= 0) return null;
    if (Array.isArray(obj)) return obj[KadRandom.randomIndex(obj)];
    const objKeys = Object.keys(obj);
    return obj[objKeys[KadRandom.randomIndex(objKeys)]];
  },
  randomObjectCentered(obj, top = null, iterations = 2) {
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += this.randomObject(obj, top);
    }
    return Math.floor(sum / iterations);
  },
  randomSubset(array, numSubset) {
    let options = KadRandom.shuffleData(array);
    return options.slice(0, numSubset);
  },
  boolProbablity(threshold = 0.5) {
    return Math.random() < threshold ? 1 : 0;
  },
  shuffleData(arr) {
    let shuffled = deepClone(arr);
    if (!Array.isArray(arr)) return arr;
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};
export const KadDate = {
  getDate(date = null, { format = "DD.MM.YYYY", leadingDigit = true, reversed = false } = {}) {
    const regexSplit = new RegExp(/([T$-/:-?{-~!"^_`\s[\]])/);
    const month = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    let dateData = null;
    if (date === null) {
      dateData = new Date();
    } else if (typeof date == "number") {
      dateData = new Date(date);
    } else if (typeof date == "object") {
      dateData = new Date(date);
    } else if (typeof date == "string") {
      let dateArr = date.split(regexSplit);
      dateArr = [dateArr[0], dateArr[2], dateArr[4]];
      for (let i = 0; i < dateArr.length; i++) {
        dateArr[i] = month.hasOwnProperty(dateArr[i]) ? month[dateArr[i]] : dateArr[i].padStart(2, "0");
      }
      dateData = new Date(dateArr.join("-"));
    } else {
      dateData = new Date();
    }

    const conversions = {
      get YYYY() {
        return dateData.getFullYear();
      },
      get YY() {
        return parseInt(dateData.getFullYear().toString().slice(2, 4), 10);
      },
      get MM() {
        return dateData.getMonth() + 1;
      },
      get DD() {
        return dateData.getDate();
      },
      get WD() {
        const weekdaysShort = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
        return weekdaysShort[dateData.getDay()];
      },
      get HH() {
        return dateData.getHours();
      },
      get mm() {
        return dateData.getMinutes();
      },
      get ss() {
        return dateData.getSeconds();
      },
      get ms() {
        return dateData.getMilliseconds();
      },
    };
    let arr = format.split(regexSplit);
    const leadingDigits = leadingDigit ? 2 : 1;
    for (let i = 0; i < arr.length; i++) {
      if (Object.keys(conversions).includes(arr[i])) {
        let str = KadValue.number(conversions[arr[i]], { leadingDigits });
        arr[i] = !isNaN(str) ? str : conversions[arr[i]];
      }
    }
    if (reversed) arr = arr.reverse();
    return arr.join("");
  },
  minutesToObj(mins) {
    const h = Math.floor(mins / 60) < 10 ? `0${Math.floor(mins / 60)}` : Math.floor(mins / 60);
    const m = mins % 60 < 10 ? `0${mins % 60}` : mins % 60;
    return { h, m };
  },
  secondsToObj(second) {
    const secs = Math.floor(second % 60);
    const mins = Math.floor(second / 60);
    const hours = Math.floor(mins / 60);
    const h = hours < 10 ? `0${hours}` : hours;
    const m = mins < 10 ? `0${mins}` : mins;
    const s = secs < 10 ? `0${secs}` : secs;
    return { h, m, s };
  },
  hourAsNumber(time = null) {
    if (time === null) {
      return new Date().getHours();
    } else if (time < 10000000000) {
      return new Date(time * 1000).getHours();
    } else {
      return new Date(time).getHours();
    }
  },
  getWeekNumber(d) {
    const date = d ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) : new Date();
    const curThu = new Date(date.getTime() + (3 - ((date.getDay() + 6) % 7)) * 86400000);
    const yearThu = curThu.getFullYear();
    const firstThu = new Date(new Date(yearThu, 0, 4).getTime() + (3 - ((new Date(yearThu, 0, 4).getDay() + 6) % 7)) * 86400000);
    return Math.floor(1 + 0.5 + (curThu.getTime() - firstThu.getTime()) / 604800000);
  },
  dateFromInput(id, opts = {}) {
    const date = dbID(id).value;
    if (opts.hasOwnProperty("format")) {
      return this.getDate(date, opts.format);
    }
    return date;
  },
};
export const KadString = {
  firstLetterCap(s) {
    if (s == "") return s;
    if (typeof s != "string") return s;
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  },
  firstLetterLow(s) {
    if (s == "") return s;
    if (typeof s != "string") return s;
    return s[0].toLowerCase() + s.slice(1);
  },
};
export const KadTable = {
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
  createHTMLGrid({ id = null, header = null, body = null, CSSGrid = {} } = {}) {
    if (KadLog.errorCheckedLevel(typeof id != "string", 3, "ID is not a string")) return;
    if (KadLog.errorCheckedLevel(id == null, 2, "No ID passed")) return;
    if (KadLog.errorCheckedLevel(body != null && !Array.isArray(body), 2, "Body has to be an Array!")) return;

    this.CSSGrid = { ...this.CSSGrid, ...CSSGrid };
    const grid = document.getElementById(id);
    if (body === null && header === null) {
      // KadLog.logLevel(3, "Table", `"${id}"`, "is cleared because it has no Header or Body!");
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = "";
    grid.classList.add(this.CSSGrid.tableMain);

    let headerData = {};
    let headerAvailable = header != null;
    if (headerAvailable) {
      const data = this.generateHeader(header);
      headerData = data.headerData;
    }
    const headerRowCount = headerAvailable ? objectLength(headerData) : 0;

    let rows = 0;
    let columns = 0;
    let multiColumnCount = 0;
    if (body) {
      columns = this.bodyHandleMultipleColumns(body, columns);
      for (let item of body) {
        if (!Array.isArray(item.data)) continue;
        rows = Math.max(rows, item.data.length);
      }
    } else if (header) {
      rows = headerRowCount;
      columns = headerData["0"].length;
    }

    grid.style.gridTemplateRows = `repeat(${rows + headerRowCount}, auto)`;

    for (let col = 0; col < columns; col++) {
      let cellItem = null;
      if (body) {
        cellItem = body[col];
      }
      let gridCells = [];

      let rowHeaderShift = 0;
      for (let row = 0; row < rows + headerRowCount; row++) {
        if (headerAvailable && headerData.hasOwnProperty(row)) {
          const headerItem = headerData[row][col];
          rowHeaderShift++;
          if (headerItem.skip) continue;
          const index = headerItem.settings?.index || row + col * rows;
          const type = headerItem.type ? headerItem.type : "Lbl";
          const { wrapper, cell } = KadTable.createGridCell({ type, data: headerItem.data });
          wrapper.classList.add(this.CSSGrid.tableWrapperHeader, this.CSSGrid.borderBottomThick, this.CSSGrid.borderRightThin);
          this.cellOptions({ wrapper, cell, type, settings: headerItem.settings || cell.settings || false, index: headerItem.settings?.index });

          this.setGridRow(wrapper, row);
          this.setGridColumn(wrapper, col, columns, headerItem.colSpan);

          if (row == rows + headerRowCount - 1) this.styleNoBorderBottom(wrapper);
          if (col == columns - 1) this.styleNoBorderRight(wrapper);

          grid.append(wrapper);
          if (row == 0) {
            wrapper.style.position = "sticky";
            wrapper.style.top = "0px";
          }
        } else if (body != null) {
          const bodyRow = row - rowHeaderShift;
          const type = cellItem.type ? cellItem.type : "Lbl";
          if (cellItem.multiColumn) {
            if (multiColumnCount == 0) {
              multiColumnCount = cellItem.multiColumn;
            }
            multiColumnCount--;
          }
          const { wrapper, cell } = KadTable.createGridCell({ type, data: cellItem.data, index: bodyRow, multiColumnCount });
          wrapper.classList.add(this.CSSGrid.tableWrapperBody, this.CSSGrid.borderBottomThin, this.CSSGrid.borderRightThin);
          this.cellOptions({ wrapper, cell, type, settings: cellItem.settings, index: bodyRow, multiColumnCount });

          cell.classList.add(this.CSSGrid.tableWrapperItem);

          this.setGridRow(wrapper, row);
          this.setGridColumn(wrapper, col, columns, cellItem.colSpan);

          if (bodyRow == rows - 1) this.styleNoBorderBottom(wrapper);
          if (col == columns - 1) this.styleNoBorderRight(wrapper);
          gridCells.push(wrapper);

          const nonSettings = ["type", "data", "skip", "multiColumn", "settings"];
          if (Object.keys(cellItem).some((key) => !nonSettings.includes(key))) {
            KadLog.errorLevel(
              2,
              "Wrong arguments found: ",
              Object.keys(cellItem)
                .filter((item) => !nonSettings.includes(item))
                .join(" / "),
              "\nSuported Items:\n",
              nonSettings.join(" / ")
            );
          }
        }
      }
      grid.append(...gridCells);
    }
  },
  generateHeader(_header) {
    const header = Array.isArray(_header) ? { 0: _header } : _header;
    let headerData = {};
    for (let [key, value] of Object.entries(header)) {
      let data = [];
      for (let i = 0; i < value.length; i++) {
        const head = header[key][i];
        data.push({
          skip: head.hasOwnProperty("skip") ? head.skip : null,
          type: head.hasOwnProperty("type") ? head.type : null,
          data: head.hasOwnProperty("data") ? head.data : null,
          colSpan: head.hasOwnProperty("colSpan") ? head.colSpan : null,
          settings: head.hasOwnProperty("settings") ? head.settings : null,
        });
        for (let j = 0; j < head.colSpan - 1; j++) {
          data.push({ skip: true });
        }
      }
      headerData[key] = data;
    }
    return { headerData };
  },

  bodyHandleMultipleColumns(body, columns) {
    let col = columns;
    for (let b = body.length - 1; b >= 0; b--) {
      let item = body[b];
      if (item.multiColumn && item.multiColumn > 1) {
        let arr = new Array(item.multiColumn).fill(null).map(() => []);
        for (let i = 0; i < item.data.length; i++) {
          arr[i % item.multiColumn].push(item.data[i]);
        }
        for (let i = 0; i < arr.length; i++) {
          col++;
          if (i > 0) {
            let newItem = {};
            for (let key of Object.keys(item)) {
              newItem[key] = item[key];
            }
            body.splice(b + i, 0, newItem);
          }
          body[b + i].data = arr[i];
        }
      } else {
        col++;
      }
    }
    return col;
  },
  setGridRow(wrapper, row) {
    wrapper.style.gridRow = row + 1;
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
  createGridCell({ type, data = null, index = null } = {}) {
    const wrapper = document.createElement("div");
    if (KadLog.errorCheckedLevel(!Object.keys(KadTable.gridCells).includes(type), 2, "Unsupported Type: ", type, "\nSupported types:\n-", Object.keys(KadTable.gridCells).join("\n- "))) return;

    let arrayData = Array.isArray(data) ? data[index] : data;
    if (arrayData === undefined) arrayData = "";
    const cell = KadTable.gridCells[type](arrayData);
    wrapper.appendChild(cell);
    return { wrapper, cell };
  },
  gridCells: {
    Lbl(data = null) {
      const child = document.createElement("label");
      child.type = "Lbl";
      child.innerHTML = data;
      return child;
    },
    H1(data = null) {
      const child = document.createElement("H1");
      child.type = "H1";
      child.innerHTML = data;
      return child;
    },
    Input(data = null) {
      const child = document.createElement("Input");
      child.type = "Input";
      child.placeholder = data;
      return child;
    },
    Button(data = null) {
      const child = document.createElement("Button");
      child.type = "button";
      child.textContent = data;
      return child;
    },
    ButtonImage(data = null) {
      const child = document.createElement("Button");
      child.type = "button";
      const img = document.createElement("img");
      img.type = "Img";
      img.src = KadDOM.getImgPath(data);
      child.appendChild(img);
      child.style.padding = 0;
      return child;
    },
    ButtonUrlImage(data = null) {
      const child = document.createElement("Button");
      child.type = "button";
      const img = document.createElement("img");
      img.type = "Img";
      img.setAttribute("referrerpolicy", "no-referrer");
      img.src = data;
      child.appendChild(img);
      child.style.padding = 0;
      return child;
    },
    Checkbox(data = null) {
      if (data === null) {
        //used when no checkboxis to be displayed --> data:null , else data:true/false
        const child = document.createElement("label");
        child.type = "Lbl";
        child.innerHTML = "";
        return child;
      }
      const child = document.createElement("input");
      child.type = "checkbox";
      child.checked = data;
      return child;
    },
    Colorbox(data = null) {
      const child = document.createElement("div");
      child.classList.add("cl_KadUtilsColoredBox");
      const value = data;
      child.style.background = KadColor.formatAsCSS({ colorArray: value, type: "HSL" });
      return child;
    },
    URLImg(data = null) {
      const child = document.createElement("img");
      child.type = "Img";
      child.setAttribute("referrerpolicy", "no-referrer");
      child.src = data || "";
      return child;
    },
    KADImg(data = null) {
      const child = document.createElement("img");
      child.type = "Img";
      child.src = KadDOM.getImgPath(data);
      child.setAttribute("imgSize", "olympiaImg");
      return child;
    },
  },

  cellOptions({ wrapper, cell, type, settings = null, index = null } = {}) {
    if (settings == null) return;
    let rcIndex = index;
    for (let [key, value] of Object.entries(settings)) {
      switch (key) {
        case "index":
          rcIndex = settings.index;
          break;
        case "description":
          cell.description = value;
          break;
        case "names":
          {
            let text = `id${type}`;
            let arr = toArray(value);
            let withIndex = true;
            for (let p of arr) {
              if (Array.isArray(p)) {
                text += `_${p[rcIndex]}`;
                withIndex = false;
              } else {
                text += `_${p}`;
              }
            }
            if (withIndex) {
              text += `_${rcIndex}`;
            }
            cell.id = text;
          }
          break;
        case "class":
          cell.classList.add(...toArray(value));
          break;
        case "title":
          cell.title = value[rcIndex];
          break;
        case "for":
          {
            let text = "idCheckbox";
            let arr = toArray(value);
            let withIndex = true;
            for (let p of arr) {
              if (Array.isArray(p)) {
                text += `_${p[rcIndex]}`;
                withIndex = false;
              } else {
                text += `_${p}`;
              }
            }
            if (withIndex) {
              text += `_${rcIndex}`;
            }

            cell.setAttribute("for", text);
          }
          break;
        case "font":
          if (toArray(value).includes("bold")) {
            cell.style.fontWeight = "bold";
          }
          break;
        case "dList":
          if (!value[rcIndex]) break;
          const dList = document.createElement("datalist");
          dList.id = `dList_uInfo_${rcIndex}`;
          cell.setAttribute("list", dList.id);
          cell.appendChild(dList);
          for (let sug of value[rcIndex]) {
            dList.appendChild(new Option(sug));
          }
          break;
        // wrapper settings
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
          cell.style.backgroundColor = KadColor.formatAsCSS({ colorArray: value[rcIndex] });
          wrapper.style.backgroundColor = KadColor.formatAsCSS({ colorArray: value[rcIndex] });
          cell.style.color = KadColor.stateAsCSS({ colorArray: value[rcIndex] });
          wrapper.style.color = KadColor.stateAsCSS({ colorArray: value[rcIndex] });
          break;
        case "cursor":
          cell.style.cursor = value;
          wrapper.style.cursor = value;
          break;
        case "align":
          wrapper.style.textAlign = value;
          break;
        case "justify":
          wrapper.style.alignContent = value;
          break;
        //ui-Styles
        case "uiSize":
        case "uiRadius":
        case "imgSize":
        case "uiType":
        case "uiFlex":
        case "uiFilter":
          if (["ButtonImage", "ButtonUrlImage"].includes(type)) {
            cell.childNodes[0].setAttribute(key, value);
          }
          cell.setAttribute(key, value);
          break;
        // functions -- combined wrapper <-> cell
        case "onclick":
          let data = toArray(value);
          if (data.length == 1) {
            wrapper.addEventListener("click", () => value(rcIndex, cell), false);
          } else {
            const callback = data[0];
            if (Array.isArray(data[1])) {
              wrapper.addEventListener("click", () => callback(data[1][rcIndex], cell), false);
            } else {
              wrapper.addEventListener("click", () => callback(data[1], cell), false);
            }
          }
          break;
        case "onmouseover":
          wrapper.addEventListener("mouseover", settings.onmouseover);
          break;
        case "onmouseleave":
          wrapper.addEventListener("mouseleave", settings.onmouseleave);
          break;
        case "copy":
          wrapper.addEventListener("click", () => copyToClipboard(cell.textContent), false);
          wrapper.style.cursor = "copy";
          break;
        default:
          KadLog.log("Unhandled Parameter:", key, wrapper);
          break;
      }
    }
  },

  //
  // old Table
  // EXPANSION
  // KAIHANGA
  // PORMULA
  // LOTTO
  // LINAHA
  //

  clear(id) {
    const obj = dbID(id);
    for (let i = obj.rows.length - 1; i >= 0; i--) {
      obj.deleteRow(i);
    }
  },
  createRow(tabID) {
    const obj = dbID(tabID);
    return obj.insertRow(obj.rows.length);
  },
  addHeaderCell(row, opt = {}) {
    let cell = document.createElement("th");
    cell.id = `id${opt.type}${opt.name}`;
    const mainChild = this.createCell(opt);
    cell.appendChild(mainChild);
    this.CellOptions(cell, opt);
    row.appendChild(cell);
    return cell;
  },
  addCell(row, opt = {}, prevCell = null) {
    const mainChild = this.createCell(opt);
    let cell = undefined;
    if (prevCell === null) {
      cell = row.insertCell(-1);
      cell.id = `id${opt.type}_cell${opt.name}`;
    }
    if (mainChild != null) {
      if (prevCell === null) {
        cell.appendChild(mainChild);
      } else {
        prevCell.appendChild(mainChild);
      }
    }
    this.CellOptions(cell || prevCell, opt);
    return cell || prevCell;
  },
  createCell(opt = {}) {
    opt.name = this.createCellName(opt);
    const child = KadTable.cells[opt.type](opt);
    KadTable.UIOptions(child, opt);
    return child;
  },
  cells: {
    Vin(opt) {
      const child = document.createElement("INPUT");
      if (opt.subGroup == "checkbox") {
        child.type = "checkbox";
        child.checked = opt.checked || false;
      } else {
        child.type = opt.subGroup;
        child.placeholder = opt.placeholder;
      }
      return child;
    },
    Btn(opt) {
      const child = document.createElement("BUTTON");
      const elImg = document.createElement("img");
      child.appendChild(elImg);
      child.type = "button";
      switch (opt.subGroup) {
        case "button":
          elImg.src = KadDOM.getImgPath(opt.img);
          break;
        case "subgrid":
          child.type = "image";
          elImg.src = KadDOM.getImgPath(opt.img);
          elImg.setAttribute("uiFilter", "invBackground");
          break;
        case "gridtitle":
          child.type = "image";
          elImg.src = KadDOM.getImgPath(opt.img);
          elImg.setAttribute("uiFilter", "invGridtitle");
          break;
        case "navbar":
          elImg.src = KadDOM.getImgPath(opt.img);
          elImg.setAttribute("uiFilter", "invNavbar");
          break;
        case "url":
        case "urlInvert":
          child.type = "image";
          elImg.src = opt.img;
          break;
        default:
          child.type = "text";
          child.textContent = opt.text;
      }
      return child;
    },
    Lbl(opt) {
      const child = document.createElement("label");
      child.type = "Lbl";
      child.innerHTML = opt.text;
      if (opt.hasOwnProperty("for")) {
        child.for = opt.for;
        opt.pointer = true;
      }
      return child;
    },
    H1(opt) {
      const child = document.createElement("H1");
      child.innerHTML = opt.text;
      child.type = "H1";
      return child;
    },
    Sel(opt) {
      const child = document.createElement("select");
      opt.type = "sel";
      let start = 0;
      if (opt.hasOwnProperty("optionTitle")) {
        child.options[start] = new Option(opt.optionTitle);
        start = 1;
      }
      for (let n = 0; n < opt.options.length; n++) {
        child.options[n + start] = new Option(opt.options[n]);
      }
      return child;
    },
    Colbox(opt) {
      const child = document.createElement("div");
      opt.type = "Colbox";
      child.classList.add("cl_KadUtilsColoredBox");
      child.style.background = KadColor.formatAsCSS({ colorArray: opt.color, type: "HSL" });
      return child;
    },
    Img(opt) {
      const child = document.createElement("IMG");
      opt.type = "Img";
      switch (opt.subGroup) {
        case "button":
          child.src = KadDOM.getImgPath(opt.img);
          break;
        case "subgrid":
          child.src = KadDOM.getImgPath(opt.img);
          child.setAttribute("uiFilter", "invBackground");
          break;
        case "gridtitle":
          child.src = KadDOM.getImgPath(opt.img);
          child.setAttribute("uiFilter", "invGridtitle");
          break;
        case "navbar":
          child.src = KadDOM.getImgPath(opt.img);
          child.setAttribute("uiFilter", "invNavbar");
          break;
        case "url":
        case "urlInvert":
          child.src = opt.img;
          break;
      }
      return child;
    },
    Div(opt) {
      const child = document.createElement("div");
      return child;
    },
  },
  UIOptions(cell, opt = {}) {
    cell.id = `id${opt.type}_child${opt.name}`;
    if (opt.hasOwnProperty("idNoChild") && opt.idNoChild) cell.id = `id${opt.type}${opt.name}`;

    if (opt.hasOwnProperty("createClass")) {
      for (const cl of opt.createClass) {
        if (cl != "" && cl != null) cell.classList.add(cl);
      }
    }
    if (opt.hasOwnProperty("title")) {
      cell.title = opt.title;
    }
    if (opt.hasOwnProperty("style")) {
      for (const [key, value] of Object.entries(opt.style)) {
        cell.style[key] = value;
        if (opt.styleChild) cell.childNodes[0].style[key] = value;
      }
    }
    if (opt.hasOwnProperty("ui")) {
      for (const [key, value] of Object.entries(opt.ui)) {
        cell.setAttribute(key, value);
      }
    }
    if (opt.pointer || opt.copy) cell.style.cursor = "copy";
    if (opt.copy) cell.addEventListener("click", () => copyToClipboard(cell.textContent), false);
    if (opt.alias) cell.style.cursor = "alias";
    if (opt.hasOwnProperty("for")) cell.setAttribute("for", opt.for);
    if (opt.hasOwnProperty("oninput")) cell.addEventListener(opt.oninput, "input", false);
    if (opt.hasOwnProperty("onclick")) {
      cell.addEventListener("click", opt.onclick, false);
      // cell.style.cursor = "pointer";
    }
    if (opt.onmouseover) {
      cell.addEventListener("mouseover", opt.onmouseover);
    }
    if (opt.onmouseleave) {
      cell.addEventListener("mouseleave", opt.onmouseleave);
    }
  },
  CellOptions(cell, opt = {}) {
    if (opt.hasOwnProperty("cellStyle")) {
      for (const [key, value] of Object.entries(opt.cellStyle)) {
        cell.style[key] = value;
      }
    }
    if (opt.hasOwnProperty("createCellClass")) {
      for (const cl of opt.createCellClass) {
        if (cl != "" && cl != null) cell.classList.add(cl);
      }
    }
    if (opt.hasOwnProperty("cellOnclick")) {
      cell.addEventListener("click", opt.cellOnclick, false);
    }
    cell.colSpan = opt.colSpan || 1;
    cell.rowSpan = opt.rowSpan || 1;
  },
  createCellName(opt = {}) {
    return opt.hasOwnProperty("name") ? opt.name : `_${opt.names.join("_")}`;
  },
};
export const KadColor = {
  types: {
    HEX: { postfix: ["", "", ""], stateRange: ["FF", "FF", "FF"] },
    RGB: { postfix: ["", "", ""], stateRange: [255, 255, 255] },
    HSL: { postfix: ["", "%", "%"], stateRange: [0, 0, 100] },
    HSB: { postfix: ["", "%", "%"], stateRange: [0, 0, 100] },
    CMYK: { postfix: ["%", "%", "%", "%"], stateRange: [0, 0, 0, 100] },
  },
  normalize({ colorArray = null, boundary = 255 } = {}) {
    return [colorArray[0] / boundary, colorArray[1] / boundary, colorArray[2] / boundary];
  },
  validateColor({ colorArray = [], type = "RGB" } = {}) {
    let Range = this.types[type].stateRange;
    let array = type != "HEX" ? colorArray : colorArray.map((num) => parseInt(num.substring(0, 2), 16));
    for (let i = 0; i < Range.length; i++) {
      if (Number.isNaN(array[i])) return false;
      if (array[i] < 0 || array[i] > Range[i]) return false;
    }
    return true;
  },
  colAsArray({ colorArray = [], from = "HSL", to = "RGB" } = {}) {
    let colFrom = from.toUpperCase();
    const colTo = to.toUpperCase();
    if (!Object.keys(this.types).includes(colFrom)) return;
    if (!Object.keys(this.types).includes(colTo)) return;
    let c = colorArray;
    if (colFrom != "RGB" && colTo != "RGB") {
      c = this[`${colFrom}toRGB`](colorArray);
      colFrom = "RGB";
    }
    return this[`${colFrom}to${colTo}`](c);
  },
  colAsString({ colorArray = [], from = "HSL", to = "RGB" } = {}) {
    const c = this.colAsArray({ colorArray, from, to });
    return this.formatAsString({ colorArray: c, type: to });
  },
  colAsCSS({ colorArray = [], from = "HSL", to = "RGB" } = {}) {
    const c = this.colAsArray({ colorArray, from, to });
    return this.formatAsCSS({ colorArray: c, type: to });
  },
  stateAsBool({ colorArray = [], type = "HSL", invert = false } = {}) {
    let RGB = type == "RGB" ? colorArray : this[`${type}toRGB`](colorArray);
    let inv = type == "CMYK" ? !invert : invert;
    let uicolors = this.normalize({ colorArray: RGB });
    let c = uicolors.map((col) => {
      if (col <= 0.03928) return col / 12.92;
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return Number(inv ? !(L < 0.179) : L < 0.179);
  },
  stateAsArray({ colorArray = [], type = "HSL", invert = false } = {}) {
    const state = this.stateAsBool({ colorArray, type, invert });
    let c = [];
    const range = KadColor.types[type.toUpperCase()].stateRange;
    for (let i = 0; i < range.length; i++) {
      c.push(state ? range[i] : 0);
    }
    return c;
  },
  stateAsString({ colorArray = null, type = "HSL", invert = false } = {}) {
    let c = this.stateAsArray({ colorArray, type, invert });
    return this.formatAsString({ colorArray: c, type });
  },
  stateAsCSS({ colorArray = null, type = "HSL", invert = false } = {}) {
    let c = this.stateAsArray({ colorArray, type, invert });
    return this.formatAsCSS({ colorArray: c, type });
  },
  formatAsString({ colorArray = null, type = "HSL" } = {}) {
    if (typeof colorArray === "string") return `${colorArray.toUpperCase()}`;
    const typePostfix = KadColor.types[type].postfix;
    let retString = "";
    for (let i = 0; i < colorArray.length; i++) {
      retString += i > typePostfix.length ? ` / ${colorArray[i]}` : ` ${colorArray[i]}${typePostfix[i]}`;
    }
    return retString.trim();
  },
  formatAsCSS({ colorArray = null, type = "HSL" } = {}) {
    if (typeof colorArray === "string") return `${colorArray.toUpperCase()}`;
    const ca = colorArray;
    const pf = KadColor.types[type].postfix;
    if (colorArray.length > pf.length) {
      return `${type.toLowerCase()}(${ca[0]}${pf[0]} ${ca[1]}${pf[1]} ${ca[2]}${pf[2]} / ${ca[3]})`;
    } else {
      return `${type.toLowerCase()}(${ca[0]}${pf[0]} ${ca[1]}${pf[1]}  ${ca[2]}${pf[2]})`;
    }
  },
  HEXtoRGB(HEX) {
    let rgb = [];
    const hex = HEX.charAt(0) === "#" ? HEX.substring(1, 7) : HEX;
    rgb[0] = parseInt(hex.substring(0, 2), 16);
    rgb[1] = parseInt(hex.substring(2, 4), 16);
    rgb[2] = parseInt(hex.substring(4, 6), 16);
    return rgb;
  },
  HSLtoRGB(HSL) {
    let h = HSL[0] / 60;
    let s = HSL[1] / 100;
    let l = HSL[2] / 100;
    let rgb = [0, 0, 0];
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const X = C * (1 - Math.abs((h % 2) - 1));
    if (h >= 0 && h < 1) {
      rgb[0] = C;
      rgb[1] = X;
    } else if (h >= 1 && h < 2) {
      rgb[0] = X;
      rgb[1] = C;
    } else if (h >= 2 && h < 3) {
      rgb[1] = C;
      rgb[2] = X;
    } else if (h >= 3 && h < 4) {
      rgb[1] = X;
      rgb[2] = C;
    } else if (h >= 4 && h < 5) {
      rgb[0] = X;
      rgb[2] = C;
    } else {
      rgb[0] = C;
      rgb[2] = X;
    }
    const m = l - C / 2;

    rgb[0] += m;
    rgb[1] += m;
    rgb[2] += m;
    rgb[0] = Math.round(rgb[0] * 255);
    rgb[1] = Math.round(rgb[1] * 255);
    rgb[2] = Math.round(rgb[2] * 255);
    return Object.values(rgb);
  },
  HSBtoRGB(HSB) {
    let s = HSB[0] / 360;
    let v = HSB[1] / 100;
    let h = HSB[2] / 100;
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        (r = v), (g = t), (b = p);
        break;
      case 1:
        (r = q), (g = v), (b = p);
        break;
      case 2:
        (r = p), (g = v), (b = t);
        break;
      case 3:
        (r = p), (g = q), (b = v);
        break;
      case 4:
        (r = t), (g = p), (b = v);
        break;
      case 5:
        (r = v), (g = p), (b = q);
        break;
    }
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    return [r, g, b];
  },
  CMYKtoRGB(CMYK) {
    const k = CMYK[3];
    const r = 255 - Math.min(1, CMYK[0] * (1 - k) + k) * 255;
    const g = 255 - Math.min(1, CMYK[1] * (1 - k) + k) * 255;
    const b = 255 - Math.min(1, CMYK[2] * (1 - k) + k) * 255;
    return [r, g, b];
  },
  RGBtoHEX(RGB) {
    let rgb = RGB.length === 1 ? [RGB[0], RGB[0], RGB[0]] : RGB;
    let hex = "#";
    rgb.forEach((c) => {
      let tempHex = Number(c).toString(16).toUpperCase();
      hex += tempHex.length < 2 ? `0${tempHex}` : tempHex;
    });
    return hex;
  },
  RGBtoHSL(RGB) {
    const rgb = this.normalize({ colorArray: RGB });
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    if (max != min) {
      const d = max - min;
      if (r == max) {
        h = (g - b) / d;
      } else if (g == max) {
        h = 2 + (b - r) / d;
      } else if (b == max) {
        h = 4 + (r - g) / d;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) h += 360;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    }
    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return [h, s, l];
  },
  RGBtoHSB(RGB) {
    const rgb = this.normalize({ colorArray: RGB });
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    let d = max - min;
    let h;
    let s = max === 0 ? 0 : d / max;
    let v = max / 255;
    switch (max) {
      case min:
        h = 0;
        break;
      case r:
        h = g - b + d * (g < b ? 6 : 0);
        h /= 6 * d;
        break;
      case g:
        h = b - r + d * 2;
        h /= 6 * d;
        break;
      case b:
        h = r - g + d * 4;
        h /= 6 * d;
        break;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    v = Math.round(v * 100);
    return [h, s, v];
  },
  RGBtoCMYK(RGB) {
    const rgb = this.normalize({ colorArray: RGB });
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    const max = Math.max(...rgb);
    let c, m, y;
    let k = 1 - max;
    if (k == 1) {
      c = 0;
      m = 0;
      y = 0;
    } else {
      c = (1 - r - k) / (1 - k);
      m = (1 - g - k) / (1 - k);
      y = (1 - b - k) / (1 - k);
    }
    c = Math.round(c * 100);
    m = Math.round(m * 100);
    y = Math.round(y * 100);
    k = Math.round(k * 100);
    return [c, m, y, k];
  },
  RGBtoLuminance(RGB) {
    const rgb = this.normalize({ colorArray: RGB });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  },
};
export class KadDebug {
  #lbl;
  #text;
  #startTime;
  #lapTime;
  #showLabel;
  #enableOutput;
  constructor({ label = "", showLabel = false } = {}) {
    this.#lbl = label;
    this.#enableOutput = true;
    this.#showLabel = showLabel;
    this.#startTime = this.#time();
    this.#lapTime = [this.#startTime];
    if (label) {
      this.#newText();
      this.#print();
    }
  }
  #time() {
    return new Date();
  }
  #print() {
    if (!this.#enableOutput) return;
    console.log(this.#text);
  }
  #label() {
    return this.#lbl && this.#showLabel ? `${this.#lbl} ` : "";
  }
  #newText(prompt) {
    this.#text = "";
    this.#addText(this.#label());
    this.#addText(prompt);
  }
  #addText(t, space = true) {
    if (t == undefined) return;
    this.#text += t;
    if (space) this.#text += " ";
  }
  #elapsedtTime() {
    return this.#time() - this.#startTime;
  }
  #intervalTime(num) {
    return (this.#time() - this.#startTime) / num;
  }
  #addLap() {
    this.#lapTime.push(this.#time());
  }
  reset() {
    if (!this.#enableOutput) return;
    this.#startTime = this.#time();
    this.#lapTime = [this.#startTime];
  }
  now(prompt) {
    if (!this.#enableOutput) return;
    this.#newText(prompt);
    const returnTime = this.#elapsedtTime();
    this.#addText(`${returnTime}ms`);
    this.#print();
    return returnTime;
  }
  average(num, prompt = null) {
    if (!this.#enableOutput) return;
    this.#newText(prompt);
    const returnTime = this.#intervalTime(num);
    this.#addText(`${returnTime.toFixed(3)}ms / ${num}`);
    this.#addText(`(${this.#elapsedtTime()}ms)`);
    this.#print();
    return returnTime;
  }
  lap(prompt) {
    if (!this.#enableOutput) return;
    this.#addLap();
    this.#newText(`${prompt}:` || "Lap:");
    const returnTime = this.#lapTime.at(-1) - this.#lapTime.at(-2);
    this.#addText(returnTime, false);
    this.#addText("ms");
    this.#print();
    return returnTime;
  }
  disable() {
    let tempLbl = this.#showLabel;
    this.#showLabel = true;
    this.#newText("disabled");
    this.#print();
    this.#showLabel = tempLbl;
    this.#enableOutput = false;
  }
  enable() {
    let tempLbl = this.#showLabel;
    this.#showLabel = true;
    this.#newText("enabled");
    this.#print();
    this.#showLabel = tempLbl;
    this.#enableOutput = true;
  }
}
