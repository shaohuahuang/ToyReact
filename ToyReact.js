const RENDER_TO_DOM = Symbol('render to dom')

export class Component {
  constructor(){
    this.children = []
    this.props = Object.create(null)
    this._root = null
    this._range = null
    this.state = null
  }
  setAttribute(name, value){
    this.props[name] = value
    this[name] = value
  }
  appendChild(vchild){
    this.children.push(vchild)
  }

  [RENDER_TO_DOM](range){
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }

  rerender(){
    let oldRange = this._range
    let range = document.createRange()
    range.setStart(this._range.startContainer, this._range.startOffset)
    range.setEnd(this._range.startContainer, this._range.startOffset)
    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }

  setState(newState){
    if(this.state == null || typeof this.state != 'object'){
      this.state = newState
      this.rerender()
      return
    }
    let merge = (oldState, newState) => {
      Object.assign(oldState, newState)
    }
    merge(this.state, newState)
    this.rerender()
  }

}

class ElementWrapper {
  constructor(type){
    this.root = document.createElement(type)
  }
  setAttribute(name, value){
    if(name.match(/^on([\s\S]+)$/)){
      let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
      this.root.addEventListener(eventName, value)
    }else{
      if(name === 'className'){
        this.root.setAttribute('class', value)
      }else
        this.root.setAttribute(name, value)
    }
  }
  appendChild(component){
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
  }

  [RENDER_TO_DOM](range){
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper {
  constructor(content){
    this.root = document.createTextNode(content)
  }

  [RENDER_TO_DOM](range){
    range.deleteContents()
    range.insertNode(this.root)
  }
}


export let ToyReact = {
  //createElement ==> translate JSX into DOM
  createElement: (type, attributes, ...children) => {
    let element;
    if(typeof type === 'string'){
      element = new ElementWrapper(type)
    }else{
      element = new type
    }

    for(let name in attributes){
      element.setAttribute(name, attributes[name])
    }

    let insertChildren = children => {
      for(let child of children){
        if(child === null)
          continue
        //TODO: why need to check whether it's instance of array
        if(typeof child === 'object' && child instanceof Array){
          insertChildren(child)
        }else{
          if (!(child instanceof Component)
            && !(child instanceof ElementWrapper)
            && !(child instanceof TextWrapper))
            child = child.toString()
          if(typeof child === 'string'){
            child = new TextWrapper(child)
          }
          element.appendChild(child)
        }
      }
    }
    insertChildren(children)
    return element
  },
  render(component, parentElement){
    let range = document.createRange()
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
  }
}