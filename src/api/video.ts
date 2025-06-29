import { AES_Decrypt, AES_Encrypt, getm3u8, AES_UUID } from '@/utils/crypto';
import { apiopenRequest, mmpRequest, mgtvRequest } from './http';
import { PLAYDOMAIN, ShortVideoConfigType, shortVideoConfig } from '@/store/state';

export interface VideoItem {
  src: string;
  poster?: string; // 可选属性，某些视频可能没有封面
  type?: string; // 视频类型
  title?: string; // 视频标题
  duration?: number; // 广告时长（秒）
  isAdlook?: boolean; // 是否看过当前广告
}

export interface FormType {
  PageIndex: string;
  PageSize: string;
  VideoType: string;
  SortType: string;
}
export interface MovieFormType {
  PageIndex: string,
  PageSize: string,
  ChannelId: string,
  GenderChannelType: string
}

/**
 * 获取视频列表（支持分页）
 * @param page 当前页码
 * @param size 每页数量
 * @returns 视频列表
 */
export const fetchApiOpenTopVideos = async (page: number, size: number): Promise<VideoItem[]> => {
  try {
    const response = await apiopenRequest.get('/api/getMiniVideo', {
      params: { page, size }
    });
    return (response.data.result.list || []).map((item: any) => ({
      src: item.playurl,
      poster: item.picurl
    }));
  } catch (error) {
    console.error('获取APIOpen顶部视频失败:', error);
    return [];
  }
};

// 获取视频1
export const fetchVideo1_ = async (): Promise<VideoItem[]> => {
  try {
    const idlist = ['jk', 'YuMeng', 'NvDa', 'NvGao', 'ReWu', 'QingCun', 'SheJie', 'ChuanDa', 'GaoZhiLiangXiaoJieJie', 'HanFu', 'HeiSi', 'BianZhuang', 'LuoLi', 'TianMei', 'BaiSi'];
    let videos: any[] = [];
    for (const id of idlist) {
      const response = await mmpRequest.get(`/api/ksvideo?type=json&id=${id}`);
      if (!response.data || !response.data.link || response.data.link === '') {
        continue; // 如果没有视频链接，跳过
      }
      videos = [...videos, { src: response.data.link }];
    }
    return videos;
  } catch (error) {
    console.error('获取视频1失败:', error);
    return [];
  }
};
// 自己的接口
export const fetchVideo1 = async (): Promise<VideoItem[]> => {
  try {
    const response = await mmpRequest.get(`/api/ksvideo`);
    return (response.data || []).map((item: any) => ({
      src: item.link,
    }));
  } catch (error) {
    console.error('获取视频1失败:', error);
    return [];
  }
};

// 获取视频2
export const fetchVideo2 = async (): Promise<VideoItem[]> => {
  try {
    const response = await mmpRequest.get('/api/miss?type=json');
    if (!response.data || !response.data.link) {
      return [];
    }
    return [{ src: response.data.link }];
  } catch (error) {
    console.error('获取视频2失败:', error);
    return [];
  }
}
// 获取视频3
export const fetchVideo3 = async (): Promise<VideoItem[]> => {
  try {
    const response = await mmpRequest.get('/api/shortvideo?type=json');
    if (!response.data || !response.data.url) {
      return [];
    }
    return [{ src: response.data.url }];
  } catch (error) {
    console.error('获取视频3失败:', error);
    return [];
  }
}
// 获取config
export const fetchConfig = async () => {
  try {
    const headers = {
      "authorization": "Bearer null",
      "priority": "u=1, i",
      "x-auth-uuid": "be63a7fc870c84b63bb3d2936649a322",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    };
    const response = await mgtvRequest.post(
      '/Web/Config',
      {},
      {
        headers,
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );
    if (response.data) {
      const textDecoder = new TextDecoder();
      const text = textDecoder.decode(response.data);
      const decryptedPassword = AES_Decrypt(text);
      const list99 = JSON.parse(decryptedPassword);
      console.log('list99', list99);
      const list100 = list99?.data || [];
      list100.forEach((element: any) => {
        if (element.id === '102') {
          shortVideoConfig.shortVideoRandomMax = Number(element.value2);
          shortVideoConfig.shortVideoRandomMin = Number(element.value1);
        }
      });
    }
    return {
      shortVideoRandomMax: 200,
      shortVideoRandomMin: 1
    };
  } catch (error) {
    console.error('获取配置失败:', error);
    return {
      shortVideoRandomMax: 200,
      shortVideoRandomMin: 1
    };
  }
};

// 芒果TV接口示例
export const fetchMGTVVideoList = async (params: FormType): Promise<VideoItem[]> => {
  try {
    const headers = {
      "authorization": "Bearer null",
      "priority": "u=1, i",
      "x-auth-uuid": AES_UUID(),
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    };
    const response = await mgtvRequest.post(
      '/Web/VideoList',
      new URLSearchParams({ ...params }),
      {
        headers,
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );
    if (response.data) {
      const textDecoder = new TextDecoder("utf-8");
      const text = textDecoder.decode(response.data);
      const decryptedPassword = AES_Decrypt(text);
      const list99 = JSON.parse(decryptedPassword);
      console.log('MGTV视频列表:', list99)
      const list100 = list99?.data?.items || [];
      console.log('MGTV视频列表:', list100);
      // 处理每个视频
      const result = list100.map((element: any) => {
        const mm = getm3u8(PLAYDOMAIN, element['playUrl']);
        return {
          src: mm,
          title: element['title'],
          type: 'application/x-mpegURL', // 设置视频类型为 m3u8
        };
      });
      return result;
    }
    return [];
  } catch (error) {
    console.error('获取MGTV视频列表失败:', error);
    return [];
  }
};

//短剧
export const fetchduanju = async (params: MovieFormType): Promise<VideoItem[]> => {
  try {
    const da = AES_Encrypt(JSON.stringify(params));
    const headers = {
      "authorization": "Bearer null",
      "Accept": "application/json, text/plain, */*",
      "x-auth-uuid": AES_UUID(),
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    };
    const response = await mgtvRequest.post(
      '/ShortMovie/ShortMovieList',
      da,
      {
        headers,
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );
    if (response.data) {
      const textDecoder = new TextDecoder();
      const text = textDecoder.decode(response.data);
      const decryptedPassword = AES_Decrypt(text);
      const list99 = JSON.parse(decryptedPassword);
      console.log('短句视频列表99:', list99);
      const list100 = list99?.data?.items || [];
      console.log('短句视频列表:', list100);
      // 处理每个视频
      const result = list100.map((element: any) => {
        const mm = getm3u8(PLAYDOMAIN, element['playUrl']);
        return {
          src: mm,
          title: element['title'],
          type: 'application/x-mpegURL', // 设置视频类型为 m3u8
        };
      });
      return result;
    }
    return [];
  } catch (error) {
    console.error('获取短剧视频失败:', error);
    return [];
  }
};

//短剧详情 ShortMovie/ShortMovieDetail

export const pojie = (str: any) => {
  // const textDecoder = new TextDecoder();
  // const text = textDecoder.decode(str);
  const decryptedPassword = AES_Decrypt(str);
  const list99 = JSON.parse(decryptedPassword);
  console.log(list99);
}