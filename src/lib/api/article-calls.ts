import { callDelete, callGet, callPatch, callPost } from "$lib/utils/call-helpers";
import { baseURL } from "./base";

const baseArticleURL = baseURL + "/article";

export async function getAllArticleLights(): Promise<ArticleLightDto[]> {
    const url = `${baseArticleURL}/all`;
    const result = await callGet<ArticleLightDto[]>(url);
    return result.data;
}

export async function getArticleLight(id: number): Promise<ArticleLightDto> {
    const url = `${baseArticleURL}/${id}`;
    const result = await callGet<ArticleLightDto>(url);
    return result.data;
}

export async function getArticleContent(id: number): Promise<ArticleContentDto> {
    const url = `${baseArticleURL}/${id}/content`;
    const result = await callGet<ArticleContentDto>(url);
    return result.data;
}

export async function createArticle(articleLightDto: ArticleLightDto): Promise<ArticleLightDto> {
    const url = baseArticleURL;
    const result = await callPost<ArticleLightDto>(url, articleLightDto);
    return result.data;
}

export async function updateArticle(articleId: number, updateArticleDto: UpdateArticleDto): Promise<void> {
    const url = `${baseArticleURL}/${articleId}`;
    await callPatch<UpdateArticleDto>(url, updateArticleDto);
}

export async function updateArticlePopularity(articleId: number, popularity: number): Promise<void> {
    const url = `${baseArticleURL}/${articleId}/popularity`;
    await callPatch<{ popularity: number }>(url, { popularity });
}

export async function deleteArticle(articleId: number): Promise<void> {
    const url = `${baseArticleURL}/${articleId}`;
    await callDelete<void>(url);
}

export async function findAllArticlesByNameFragment(nameFragment: string): Promise<ArticleLightDto[]> {
    const url = `${baseArticleURL}/with-name-fragment`;
    const response = await callGet<ArticleLightDto[]>(url, {
        "name-fragment": nameFragment
    });
    return response.data;
}
