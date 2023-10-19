import { callDelete, callGet, callPatch, callPost } from "$lib/utils/call-helpers";
import { baseURL } from "./base";

const baseArticleURL = baseURL + "/article";

export async function createArticle(articleLightDto: ArticleLightDto): Promise<ArticleLightDto> {
    const url = baseArticleURL;
    const result = await callPost<ArticleLightDto>(url, articleLightDto);
    return result.data;
}

export async function getAllArticleLights(): Promise<ArticleLightDto[]> {
    const url = `${baseArticleURL}`;
    const result = await callGet<ArticleLightDto[]>(url);
    return result.data;
}

export async function getArticleLight(id: number): Promise<ArticleLightDto> {
    const url = `${baseArticleURL}/${id}`;
    const result = await callGet<ArticleLightDto>(url);
    return result.data;
}

export async function findAllArticlesWithLabelNameFragment(nameFragment: string): Promise<ArticleLightWithLabelsDto[]> {
    const url = `${baseArticleURL}/with-label-name-fragment`;
    const result = await callGet<ArticleLightWithLabelsDto[]>(url, {
        "name-fragment": nameFragment,
    });
    return result.data;
}

export async function findAllArticlesWithTitleFragment(titleFragment: string): Promise<ArticleLightDto[]> {
    const url = `${baseArticleURL}/with-title-fragment`;
    const result = await callGet<ArticleLightDto[]>(url, {
        "title-fragment": titleFragment,
    });
    return result.data;
}

export async function getTheMostRecentArticleLights(number?: number): Promise<ArticleLightDto[]> {
    const url = `${baseArticleURL}/recent`;
    const result = await callGet<ArticleLightDto[]>(url, {
        number,
    });
    return result.data;
}

export async function getArticleContent(id: number): Promise<ArticleContentDto> {
    const url = `${baseArticleURL}/${id}/content`;
    const result = await callGet<ArticleContentDto>(url);
    return result.data;
}

export async function updateArticle(articleId: number, updateArticleDto: UpdateArticleDto): Promise<void> {
    const url = `${baseArticleURL}/${articleId}`;
    await callPatch<UpdateArticleDto>(url, updateArticleDto);
}

export async function deleteArticle(articleId: number): Promise<void> {
    const url = `${baseArticleURL}/${articleId}`;
    await callDelete<void>(url);
}

export async function createArticleLabel(articleLabelDto: ArticleLabelDto): Promise<ArticleLabelDto> {
    const url = `${baseArticleURL}/label`;
    const result = await callPost<ArticleLabelDto>(url, articleLabelDto);
    return result.data;
}

export async function getAllArticleLabels(): Promise<ArticleLabelDto[]> {
    const url = `${baseArticleURL}/label`;
    const result = await callGet<ArticleLabelDto[]>(url);
    return result.data;
}

export async function getArticleLabel(id: number): Promise<ArticleLabelDto> {
    const url = `${baseArticleURL}/label/${id}`;
    const result = await callGet<ArticleLabelDto>(url);
    return result.data;
}

export async function updateArticleLabel(articleLabelId: number, updateArticleLabelDto: UpdateArticleLabelDto): Promise<void> {
    const url = `${baseArticleURL}/label/${articleLabelId}`;
    await callPatch<UpdateArticleDto>(url, updateArticleLabelDto);
}

export async function deleteArticleLabel(articleLabelId: number): Promise<void> {
    const url = `${baseArticleURL}/label/${articleLabelId}`;
    await callDelete<void>(url);
}

export async function bindLabelToArticle(labelId: number, articleId: number): Promise<void> {
    const url = `${baseArticleURL}/label/bind`;
    const result = await callPost<void>(url, {
        labelId,
        articleId,
    });
    return result.data;
}

export async function unbindLabelFromArticle(labelId: number, articleId: number): Promise<void> {
    const url = `${baseArticleURL}/label/unbind`;
    const result = await callPost<void>(url, {
        labelId,
        articleId,
    });
    return result.data;
}

export async function createLabelsCombination(labelIds: number[]): Promise<LabelsCombinationDto> {
    const url = `${baseArticleURL}/label/combination`;
    const result = await callPost<LabelsCombinationDto>(url, {
        labelIds
    });
    return result.data;
}

export async function getTheMostPopularLabelsCombinations(number?: number): Promise<LabelsCombinationDto[]> {
    const url = `${baseArticleURL}/label/combination/popular`;
    const result = await callGet<LabelsCombinationDto[]>(url, { number });
    return result.data;
}

export async function updateLabelsCombinationPopularity(labelsCombinationId: number, popularity: number): Promise<void> {
    const url = `${baseArticleURL}/label/combination/${labelsCombinationId}`;
    await callPatch<UpdateArticleDto>(url, { popularity });
}

export async function deleteLabelsCombination(combinationId: number): Promise<void> {
    const url = `${baseArticleURL}/label/combination/${combinationId}`;
    await callDelete<void>(url);
}