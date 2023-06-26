import { useContext } from 'react';
import { Data, DocumentData, SiteTreeNode } from '@sitebud/bridge-lib';
import { AdaptedDataContext, AdaptedData } from './AdaptedDataProvider';
import { ArticlePageContentAdapter } from './ArticlePageContentAdapter';
import { AuthorProfilePageContentAdapter } from './AuthorProfilePageContentAdapter';
import { CategoriesPageContentAdapter } from './CategoriesPageContentAdapter';
import { CategoryPageContentAdapter } from './CategoryPageContentAdapter';
import { MainPageContentAdapter } from './MainPageContentAdapter';
import { SearchPageContentAdapter } from './SearchPageContentAdapter';
import { SiteContentAdapter } from './SiteContentAdapter';
import { TagPageContentAdapter } from './TagPageContentAdapter';
import { TagsPageContentAdapter } from './TagsPageContentAdapter';

import type {
    DocumentContentContext,
    DocumentNode,
    DocumentClass,
    DocumentsListField,
} from './types';

type AdaptedDataUtils = {
    getDocumentContentContextList: (
        documentListField?: DocumentsListField
    ) => Array<DocumentContentContext>;
};

function adaptDocumentData(
    documentData?: DocumentData
): DocumentContentContext {
    const documentContentContext: DocumentContentContext = {};
    if (documentData && documentData.content && documentData.name) {
        switch (documentData.name) {
            case 'ArticlePage':
                documentContentContext.articlePageContent =
                    new ArticlePageContentAdapter(documentData).adapt();
                break;

            case 'AuthorProfilePage':
                documentContentContext.authorProfilePageContent =
                    new AuthorProfilePageContentAdapter(documentData).adapt();
                break;

            case 'CategoriesPage':
                documentContentContext.categoriesPageContent =
                    new CategoriesPageContentAdapter(documentData).adapt();
                break;

            case 'CategoryPage':
                documentContentContext.categoryPageContent =
                    new CategoryPageContentAdapter(documentData).adapt();
                break;

            case 'MainPage':
                documentContentContext.mainPageContent =
                    new MainPageContentAdapter(documentData).adapt();
                break;

            case 'SearchPage':
                documentContentContext.searchPageContent =
                    new SearchPageContentAdapter(documentData).adapt();
                break;

            case 'Site':
                documentContentContext.siteContent = new SiteContentAdapter(
                    documentData
                ).adapt();
                break;

            case 'TagPage':
                documentContentContext.tagPageContent =
                    new TagPageContentAdapter(documentData).adapt();
                break;

            case 'TagsPage':
                documentContentContext.tagsPageContent =
                    new TagsPageContentAdapter(documentData).adapt();
                break;
        }
    }
    return documentContentContext;
}

function createDocumentNode(siteTreeNode: SiteTreeNode) {
    const documentNode: DocumentNode = {
        documentClass: siteTreeNode.documentClass as DocumentClass,
        id: siteTreeNode.id,
        name: siteTreeNode.name,
        path: siteTreeNode.path,
        documentContentContext: adaptDocumentData(siteTreeNode.documentData),
        children: [],
    };
    if (siteTreeNode.children && siteTreeNode.children.length > 0) {
        for (const siteTreeNodeChild of siteTreeNode.children) {
            documentNode.children.push(createDocumentNode(siteTreeNodeChild));
        }
    }
    return documentNode;
}

function createDocumentsMap(
    documentsTree: DocumentNode
): Record<string, DocumentNode> {
    let result: Record<string, DocumentNode> = {};
    result[documentsTree.id] = documentsTree;
    if (documentsTree.children && documentsTree.children.length > 0) {
        for (const documentsTreeChild of documentsTree.children) {
            result = { ...result, ...createDocumentsMap(documentsTreeChild) };
        }
    }
    return result;
}

export function useDataAdapter(data: Data | null): AdaptedData {
    if (data) {
        const { siteTree, documentId } = data;
        const documentsTree: DocumentNode = createDocumentNode(siteTree.root);
        const documentsMap: Record<string, DocumentNode> =
            createDocumentsMap(documentsTree);
        let documentContentContext: DocumentContentContext | undefined =
            documentsMap[documentId]?.documentContentContext || {};
        documentContentContext = {
            ...documentContentContext,
            ...documentsMap['site'].documentContentContext,
        };
        return {
            documentContentContext,
            documentsTree,
            documentsMap,
        };
    }
    return {};
}

export function useAdaptedContent(): DocumentContentContext | undefined {
    const dataContext = useContext(AdaptedDataContext);
    if (dataContext?.documentContentContext) {
        return dataContext.documentContentContext;
    }
    return undefined;
}

export function useDocumentsTree(): DocumentNode | undefined {
    const dataContext = useContext(AdaptedDataContext);
    if (dataContext?.documentsTree) {
        return dataContext.documentsTree;
    }
    return undefined;
}

export function useDocumentsMap(): Record<string, DocumentNode> {
    const dataContext = useContext(AdaptedDataContext);
    if (dataContext?.documentsMap) {
        return dataContext.documentsMap;
    }
    return {};
}

export function useAdaptedDataUtils(): AdaptedDataUtils {
    const documentsMap: Record<string, DocumentNode> = useDocumentsMap();
    function getDocumentContentContextList(
        documentListField?: DocumentsListField
    ): Array<DocumentContentContext> {
        const resultList: Array<DocumentContentContext> = [];
        if (documentListField) {
            const { documentIds, parentDocumentIds } = documentListField;
            if ((documentIds || parentDocumentIds) && documentsMap) {
                if (documentIds) {
                    for (const documentId of documentIds) {
                        const foundDocumentNode: DocumentNode | undefined =
                            documentsMap[documentId];
                        if (
                            foundDocumentNode &&
                            foundDocumentNode.documentContentContext
                        ) {
                            resultList.push(
                                foundDocumentNode.documentContentContext
                            );
                        }
                    }
                } else if (parentDocumentIds) {
                    for (const parentDocumentId of parentDocumentIds) {
                        const foundDocumentNode: DocumentNode | undefined =
                            documentsMap[parentDocumentId];
                        if (
                            foundDocumentNode &&
                            foundDocumentNode.children &&
                            foundDocumentNode.children.length > 0
                        ) {
                            for (const childDocumentNode of foundDocumentNode.children) {
                                if (childDocumentNode.documentContentContext) {
                                    resultList.push(
                                        childDocumentNode.documentContentContext
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
        return resultList;
    }
    return {
        getDocumentContentContextList,
    };
}
