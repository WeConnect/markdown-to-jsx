const MATCH_OPEN_TAG_R = /^ *(?!<[a-z][^ >/]* ?\/>)<([a-z][^ >/]*) ?([^>]*?)(\/)?>/i
const MATCH_OPEN_TAG_OR_CLOSE_TAG_R = /^([^<]*)<(\/)?([a-z][^ >/]*)[^>]*?(\/)?>/i
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export default function matchHtmlBlock(source) {
  let valid = true
  let index = 0, endingIndex = 0, endingTagIndex = 0, endingChildrenIndex = 0
  let tagName = '', attributes = ''
  let match, wholeMatch, children, isClosingTag, innerTagName, isSelfClosing, currentString
  const stack = []
  while (index < source.length) {
    currentString = source.slice(index)
    if (index === 0) {
      match = currentString.match(MATCH_OPEN_TAG_R)
      if (!match) {
        valid = false
        index = source.length
        break
      }
      [wholeMatch, tagName, attributes, isSelfClosing] = match
      if (VOID_ELEMENTS.has(tagName) || isSelfClosing === '/') {
        valid = false
        index = source.length
        break
      }
      index = wholeMatch.length
      endingTagIndex = index
      stack.push(tagName)
    } else {
      match = currentString.match(MATCH_OPEN_TAG_OR_CLOSE_TAG_R)
      if (!match) {
        valid = false
        index = source.length
        break
      }
      [wholeMatch, children, isClosingTag, innerTagName, isSelfClosing] = match
      endingChildrenIndex = index + children.length
      endingIndex = index + wholeMatch.length
      // console.log('match: ', match)
      if (isClosingTag === '/') {
        if (innerTagName !== stack.pop()) {
          valid = false
          index = source.length
          break
        }
        if (stack.length === 0) {
          break
        }
      } else if (!isSelfClosing && !VOID_ELEMENTS.has(innerTagName)) {
        stack.push(innerTagName)
      }
      index += wholeMatch.length
    }
  }

  if (!valid) {
    return null
  }
  const endingWhitespace = source.slice(endingIndex).match(/^(\n*)/)
  if (endingWhitespace) {
    endingIndex += endingWhitespace[1].length
  }
  const wholeCapture = source.slice(0, endingIndex)
  children = source.slice(endingTagIndex, endingChildrenIndex).replace(/^\n/, '')
  return [wholeCapture, tagName, attributes, children]
}
