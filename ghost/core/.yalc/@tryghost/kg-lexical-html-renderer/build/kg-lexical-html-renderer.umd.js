import { createHeadlessEditor } from '@lexical/headless';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $isLinkNode, LinkNode } from '@lexical/link';
import { $isLineBreakNode, $isTextNode, TextNode, $getRoot, $isParagraphNode, $isElementNode } from 'lexical';
import { $isKoenigCard } from '@tryghost/kg-default-nodes';
import jsdom from 'jsdom';

const FORMAT_TAG_MAP = {
  bold: 'STRONG',
  italic: 'EM',
  strikethrough: 'S',
  underline: 'U',
  code: 'CODE',
  subscript: 'SUB',
  superscript: 'SUP',
  highlight: 'MARK'
};
const ensureDomProperty = options => {
  return !!options.dom;
};
// Builds and renders text content, useful to ensure proper format tag opening/closing
// and html escaping
class TextContent {
  nodes;
  exportChildren;
  options;
  constructor(exportChildren, options) {
    if (ensureDomProperty(options) === false) {
      // eslint-disable-next-line ghost/ghost-custom/no-native-error
      throw new Error('TextContent requires a dom property in the options argument');
    }
    this.exportChildren = exportChildren;
    this.options = options;
    this.nodes = [];
  }
  addNode(node) {
    this.nodes.push(node);
  }
  render() {
    const document = this.options.dom.window.document;
    const root = document.createElement('div');
    let currentNode = root;
    const openFormats = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if ($isLineBreakNode(node)) {
        currentNode.append(document.createElement('BR'));
        continue;
      }
      if ($isLinkNode(node)) {
        const anchor = document.createElement('A');
        this._buildAnchorElement(anchor, node);
        currentNode.append(anchor);
        continue;
      }
      if ($isTextNode(node)) {
        // shortcut format code for plain text
        if (node.getFormat() === 0) {
          currentNode.append(node.getTextContent());
          continue;
        }
        // open format tags in correct order
        const formatsToOpen = [];
        // get base list of formats that need to open
        Object.entries(FORMAT_TAG_MAP).forEach(([format]) => {
          if (node.hasFormat(format) && !openFormats.includes(format)) {
            formatsToOpen.push(format);
          }
        });
        // re-order formats to open based on next nodes - we want to make
        // sure tags that will be kept open for later nodes are opened first
        const remainingNodes = this.nodes.slice(i + 1);
        // avoid checking any nodes after a link node because those cause all formats to close
        const nextLinkNodeIndex = remainingNodes.findIndex(n => $isLinkNode(n));
        const remainingSortNodes = nextLinkNodeIndex === -1 ? remainingNodes : remainingNodes.slice(0, nextLinkNodeIndex);
        // ensure we're only working with text nodes as they're the only ones that can open/close formats
        const remainingSortedTextNodes = remainingSortNodes.filter(n => $isTextNode(n));
        formatsToOpen.sort((a, b) => {
          const aIndex = remainingSortedTextNodes.findIndex(n => n.hasFormat(a));
          const bIndex = remainingSortedTextNodes.findIndex(n => n.hasFormat(b));
          if (aIndex === -1) {
            return 1;
          }
          if (bIndex === -1) {
            return -1;
          }
          return aIndex - bIndex;
        });
        // open new tags
        formatsToOpen.forEach(format => {
          const formatTag = document.createElement(FORMAT_TAG_MAP[format]);
          currentNode.append(formatTag);
          currentNode = formatTag;
          openFormats.push(format);
        });
        // insert text
        currentNode.append(node.getTextContent());
        // close tags in correct order if next node doesn't have the format
        // links are their own formatting islands so all formats need to close before a link
        const nextNode = remainingNodes.find(n => $isTextNode(n) || $isLinkNode(n));
        [...openFormats].forEach(format => {
          if (!nextNode || $isLinkNode(nextNode) || nextNode instanceof TextNode && !nextNode.hasFormat(format)) {
            currentNode = currentNode.parentNode;
            openFormats.pop();
          }
        });
        continue;
      }
    }
    return root.innerHTML;
  }
  isEmpty() {
    return this.nodes.length === 0;
  }
  clear() {
    this.nodes = [];
  }
  // PRIVATE -----------------------------------------------------------------
  _buildAnchorElement(anchor, node) {
    // Only set the href if we have a URL, otherwise we get a link to the current page
    if (node.getURL()) {
      anchor.setAttribute('href', node.getURL());
    }
    if (node.getRel()) {
      anchor.setAttribute('rel', node.getRel() || '');
    }
    anchor.innerHTML = this.exportChildren(node, this.options);
  }
}

const elementTransformers = [require('./element/paragraph'), require('./element/heading'), require('./element/list'), require('./element/blockquote'), require('./element/aside')];

function $convertToHtmlString(options = {}) {
  const output = [];
  const children = $getRoot().getChildren();
  options.usedIdAttributes = options.usedIdAttributes || {};
  for (const child of children) {
    const result = exportTopLevelElementOrDecorator(child, options);
    if (result !== null) {
      output.push(result);
    }
  }
  // Koenig keeps a blank paragraph at the end of a doc but we want to
  // make sure it doesn't get rendered
  const lastChild = children[children.length - 1];
  if (lastChild && $isParagraphNode(lastChild) && lastChild.getTextContent().trim() === '') {
    output.pop();
  }
  return output.join('');
}
function exportTopLevelElementOrDecorator(node, options) {
  if ($isKoenigCard(node)) {
    // NOTE: kg-default-nodes appends type in rare cases to make use of this functionality... with moving to typescript,
    //  we should change this implementation because it's confusing, or we should override the DOMExportOutput type
    const {
      element,
      type
    } = node.exportDOM(options);
    switch (type) {
      case 'inner':
        return element.innerHTML;
      case 'value':
        if ('value' in element) {
          return element.value;
        }
        return '';
      default:
        return element.outerHTML;
    }
  }
  if ($isElementNode(node)) {
    // note: unsure why this type isn't being picked up from the import
    for (const transformer of elementTransformers) {
      if (transformer.export !== null) {
        const result = transformer.export(node, options, _node => exportChildren(_node, options));
        if (result !== null) {
          return result;
        }
      }
    }
  }
  return $isElementNode(node) ? exportChildren(node, options) : null;
}
function exportChildren(node, options) {
  const output = [];
  const children = node.getChildren();
  const textContent = new TextContent(exportChildren, options);
  for (const child of children) {
    if (!textContent.isEmpty() && !$isLineBreakNode(child) && !$isTextNode(child) && !$isLinkNode(child)) {
      output.push(textContent.render());
      textContent.clear();
    }
    if ($isLineBreakNode(child) || $isTextNode(child) || $isLinkNode(child)) {
      textContent.addNode(child);
    } else if ($isElementNode(child)) {
      output.push(exportChildren(child, options));
    }
  }
  if (!textContent.isEmpty()) {
    output.push(textContent.render());
  }
  return output.join('');
}

function getDynamicDataNodes(editorState) {
  const dynamicNodes = [];
  editorState.read(() => {
    const root = $getRoot();
    const nodes = root.getChildren();
    nodes.forEach(node => {
      if ($isKoenigCard(node) && node.hasDynamicData?.()) {
        dynamicNodes.push(node);
      }
    });
  });
  return dynamicNodes;
}

function defaultOnError() {
  // do nothing
}
const useLexicalHtmlRenderer = ({
  dom,
  nodes,
  onError
} = {}) => {
  if (!dom) {
    const {
      JSDOM
    } = jsdom;
    dom = new JSDOM();
  }
  if (!nodes) {
    nodes = [];
  }
  if (!onError) {
    onError = defaultOnError;
  }
  const render = async (lexicalState, userOptions = {}) => {
    const defaultOptions = {
      target: 'html',
      dom: dom
    };
    const options = Object.assign({}, defaultOptions, userOptions);
    const DEFAULT_NODES = [HeadingNode, ListNode, ListItemNode, QuoteNode, LinkNode, ...nodes];
    const editor = createHeadlessEditor({
      nodes: DEFAULT_NODES,
      onError: onError
    });
    const editorState = editor.parseEditorState(lexicalState);
    // gather nodes that require dynamic data
    const dynamicDataNodes = getDynamicDataNodes(editorState);
    // fetch dynamic data
    const renderData = new Map();
    await Promise.all(dynamicDataNodes.map(async node => {
      if (!node.getDynamicData) {
        return;
      }
      const {
        key,
        data
      } = await node.getDynamicData(options);
      renderData.set(key, data);
    }));
    options.renderData = renderData;
    // set up editor with our state
    editor.setEditorState(editorState);
    // register transforms that clean up state for rendering
    //registerRemoveAtLinkNodesTransform(editor);
    // render
    let html = '';
    editor.update(async () => {
      html = $convertToHtmlString(options);
    });
    return html;
  };
  return {
    render
  };
};

export { defaultOnError, useLexicalHtmlRenderer };
//# sourceMappingURL=kg-lexical-html-renderer.umd.js.map
