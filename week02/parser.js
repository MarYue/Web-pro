let currentToken = null
let currentAttribute = null

function emit(token) {
  // if(token.type !== 'text)
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
}