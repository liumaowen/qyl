import { qylapiRequest } from './http';

export interface VideoItem {
  src: string;
  poster?: string; // 可选属性，某些视频可能没有封面
}

/**
 * 获取视频列表（支持分页）
 * @param page 当前页码
 * @param size 每页数量
 * @returns 视频列表
 */
export const fetchApiOpenTopVideos = async (page: number, size: number): Promise<VideoItem[]> => {
    const response = await qylapiRequest.get('/api/getMiniVideo', {
        params: { page, size }
    });
    return (response.data.result.list || []).map((item: any) => ({
        src: item.playurl,
        poster: item.picurl
    }));
};

// 获取视频1
export const fetchVideo1 = async (): Promise<VideoItem[]> => {
    const idlist = ['jk', 'YuMeng', 'NvDa', 'NvGao', 'ReWu', 'QingCun', 'SheJie', 'ChuanDa', 'GaoZhiLiangXiaoJieJie', 'HanFu', 'HeiSi', 'BianZhuang', 'LuoLi', 'TianMei', 'BaiSi'];
    let videos: any[] = [];
    for (const id of idlist) {
        const response = await qylapiRequest.get(`/api/ksvideo`,{ params: { id } });
        if (!response.data || !response.data.link) {
            continue; // 如果没有视频链接，跳过
        }
        videos = [...videos,{src:response.data.link}];
    }
    return videos;
};

// 获取视频2
export const fetchVideo2 = async (): Promise<VideoItem[]> => {
    const response = await qylapiRequest.get('/api/miss');
    if (!response.data || !response.data.link) {
        return [];
    }
    return [{src:response.data.link}];
}
// 获取视频3
export const fetchVideo3 = async (): Promise<VideoItem[]> => {
    const response = await qylapiRequest.get('/api/shortvideo');
    if (!response.data || !response.data.url) {
        return [];
    }
    return [{src:response.data.url}];
}