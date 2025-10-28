// A custom ESLint rule to enforce using the custom `<Image>` component by auto-replacing `<img>` tags.

const IMAGE_IMPORT_PATH = '@/components/ui/image';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use Image component instead of primitive img tags',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      useImageComponent: 'Use <Image> component instead of <img> tag. This will be auto-fixed.',
    },
  },

  create(context) {
    const { sourceCode, filename } = context;

    // Skip the whole components/ui folder
    if (filename.includes('components/ui/')) return {};

    let hasImageImport = false;
    let imageImportNode = null;
    let lastImportNode = null;

    const addImageImport = (fixer) => {
      if (hasImageImport) return [];

      const importText = `import { Image } from '${IMAGE_IMPORT_PATH}';`;

      if (imageImportNode) {
        const lastSpecifier = imageImportNode.specifiers[imageImportNode.specifiers.length - 1];
        return [fixer.insertTextAfter(lastSpecifier, `, Image`)];
      }

      const insertAfter = lastImportNode
        ? fixer.insertTextAfter(lastImportNode, `\n${importText}`)
        : fixer.insertTextBeforeRange([0, 0], `${importText}\n`);

      return [insertAfter];
    };

    return {
      ImportDeclaration(node) {
        lastImportNode = node;

        if (node.source.value === IMAGE_IMPORT_PATH) {
          imageImportNode = node;
          hasImageImport = node.specifiers.some(
            (spec) =>
              spec.type === 'ImportSpecifier' &&
              spec.imported.type === 'Identifier' &&
              spec.imported.name === 'Image'
          );
        }
      },

      JSXElement(node) {
        if (
          node.openingElement.name?.type !== 'JSXIdentifier' ||
          node.openingElement.name.name !== 'img'
        )
          return;

        context.report({
          node,
          messageId: 'useImageComponent',
          fix(fixer) {
            const { openingElement: openingEl, closingElement } = node;
            const attributes = openingEl.attributes.map((attr) =>
              sourceCode.getText(attr)
            );

            const attributesText = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
            const newOpeningTag = openingEl.selfClosing
              ? `<Image${attributesText} />`
              : `<Image${attributesText}>`;

            const fixes = [
              fixer.replaceText(openingEl, newOpeningTag),
              ...addImageImport(fixer),
            ];

            if (closingElement) {
              fixes.push(fixer.replaceText(closingElement, '</Image>'));
            }

            return fixes;
          },
        });
      },
    };
  },
};