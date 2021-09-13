let currentToken = null // 当前标签
let currentAttribute = null // 当前属性
let currentTextNode = null  // 当前的文本节点

let stack = [{type: 'document', children: {}}] // 结点树

function emit(token) {
  let top = stack[stack.length - 1]

  if(token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }
    element.tagName = token.tabName
    for(let p in token) {
      if(p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    top.children.push(element)
    element.parent = top
    if(!token.isSelfClosing) {
      stack.push(element)
    }
    currentTextNode = null
  } else if(token.type === 'endTag') {
    if(top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!")
    } else {
      stack.pop()
    }
    currentTextNode = null
  } else if(token.type === 'text') {
    if(currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
  console.log(token)
}

const EOF = Symbol('EOF') // End of file

function data(c) { 
  if(c === '<') {
    return tagOpen
  } else if(c === EOF) {
    emit({
      type: 'EOF'
    })
  } else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}

// 标签开始
function tagOpen(c) {
  if(c ===  '/') {
    return endTagOpen
  } else if(c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tabName(c)
  } else {
    return
  }
}

// 标签结束
function endTagOpen(c) { 
  if(c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tabName(c)
  } else if(c === EOF) {
    emit({
      type: 'EOF'
    })
  } else {

  }
}

// 标签名
function tagName(c) {
 if(c.match(/^[\t\n\f ]$/)) {
   return beforeAttributeName // 标签名后有属性
 } else if(c === '/') {
   return selfClosingStartTag // 子封闭标签
 } else if(c.match(/^[a-zA-Z]$/)) {
   currentToken.tabName += c 
   return tagName
 } else if(c === '>') {
   emit(currentToken)
   return data
 } else {
   return tagName
 }
}

// 标签名后有属性
function beforeAttributeName(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if(c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  } else if(c === '=') {
    return beforeAttributeName
  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

// 属性名
function attributeName(c) {
  if(c.match(/^[\t\b\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  } else if(c === '=') {
    return beforeAttributeValue
  } else if(c === '\u0000') {

  } else {
    currentAttribute.name += c
    return attributeName
  }
}

// 属性值前
function beforeAttributeValue(c) {
  if(c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue
  } else if(c === '\"') {
    return doubleQuotedAttributeValue
  } else if(c === '\'') {
    return singleQuotedAttributeValue
  } else if(c === '>') {

  } else {
    return UnquotedAttributeValue(c)
  }
}

// 引号后
function afterQuotedAttributeValue(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if(c === '/') {
    return selfClosingStartTag
  } else if(c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data 
  } else if(c === EOF) {

  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

// 双引号
function doubleQuotedAttributeValue(c) {
  if(c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if(c === '\u0000') {

  } else if(c === EOF) {

  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

// 单引号
function singleQuotedAttributeValue(c) {
  if(c === '\"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if(c === '\u0000') {

  } else if(c === EOF) {

  } else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

// 无引号
function UnquotedAttributeValue(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if(c === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if(c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if(c === '\u0000') {

  } else if(c === '\"' || c === '\'' || c === '<' || c === "'") {

  } else if(c === EOF) {

  } else {
    currentAttribute.value += c
    return UnquotedAttributeValue
  }
}

// 自封闭标签
function selfClosingStartTag(c) {
  if(c === '>') {
    currentToken.isSelfClosing = true
    return data
  } else if(c === 'EOF') {
    emit({
      type: 'EOF'
    })
  } else {

  }
}

module.exports.parseHTML = function parseHTML(html) { 
  let state = data
  for(let c of html) {
    state = state(c)
  }
  state = state(EOF)
  console.log(state)
  return stack[0]
}