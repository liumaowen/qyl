import axios from 'axios';

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
    const response = await axios.get('https://api.apiopen.top/api/getMiniVideo', {
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
        const response = await axios.get(`/mmpapi/api/ksvideo?type=json&id=${id}`);
        videos = [...videos,{src:response.data.link}];
    }
    return videos;
};

// 获取视频2
export const fetchVideo2 = async (): Promise<VideoItem[]> => {
    const response = await axios.get('/mmpapi/api/miss?type=json');
    return [{src:response.data.link}];
}
// 获取视频3
export const fetchVideo3 = async (): Promise<VideoItem[]> => {
    const response = await axios.get('/mmpapi/api/shortvideo?type=json');
    return [{src:response.data.url}];
}