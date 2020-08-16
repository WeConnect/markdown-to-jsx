import { matchHtmlBlock } from './index'
import fs from 'fs'

describe('matchHtmlBlock', () => {
  it('matches a single div', () => {
    const source = '<div></div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<div></div>',
      'div',
      '',
      ''
    ])
  });

  it('matches a single div with attributes', () => {
    const source = '<div class="foo"></div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<div class="foo"></div>',
      'div',
      'class="foo"',
      ''
    ])
  });

  it('matches a single div with children', () => {
    const source = '<div class="foo">foo</div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<div class="foo">foo</div>',
      'div',
      'class="foo"',
      'foo'
    ])
  });

  it('matches nested divs', () => {
    const source = '<div><div><div>foo</div></div></div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<div><div><div>foo</div></div></div>',
      'div',
      '',
      '<div><div>foo</div></div>'
    ])
  });

  it('handles void elements', () => {
    const source = '<div><br>foo<br></div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<div><br>foo<br></div>',
      'div',
      '',
      '<br>foo<br>'
    ])
  });

  it('handles self-closing tags', () => {
    const source = '<div><br />and <img src="foo" /></div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<div><br />and <img src="foo" /></div>',
      'div',
      '',
      '<br />and <img src="foo" />'
    ])
  });

  it('return null for autolink tags', () => {
    const source = `
**autolink** style

<https://google.com>
                `
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual(null)
  });

  it('handles svgs', () => {
    const source = fs.readFileSync(__dirname + '/docs/images/logo.svg', 'utf8')
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      source,
      'svg',
      'width="246" height="369" xmlns="http://www.w3.org/2000/svg"',
      source.replace(/<svg[^>]*>(.+)<\/svg>/, '$1'),
    ])
  });

  it('is case-insensitive', () => {
    const source = '<Foo>bar</Foo>'
    const capture = matchHtmlBlock(source)
    expect(capture).toEqual([
      '<Foo>bar</Foo>',
      'Foo',
      '',
      'bar',
    ])
  });

  it('does not match self-closing tags', () => {
    const source = '<Inner children="bah" />'
    const capture = matchHtmlBlock(source)
    expect(capture).toBeNull()
  });

  it('does not match just an open tag', () => {
    const source = '<div>'
    const capture = matchHtmlBlock(source)
    expect(capture).toBeNull()
  });
});
