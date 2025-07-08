import { AES_Decrypt, AES_Encrypt, getm3u8, AES_UUID,fetchAndDecrypt } from '@/utils/crypto';
import { apiopenRequest, mmpRequest, mgtvRequest,ipapiRequest } from './http';
import { PLAYDOMAIN, ShortVideoConfigType, shortVideoConfig } from '@/store/state';
import { type AnalyticsData } from '@/utils/userAnalytics';

export interface VideoItem {
  src: string;
  poster?: string; // 可选属性，某些视频可能没有封面
  type?: string; // 视频类型 ad:广告
  videotype?: string; // 视频类型 dm:短剧
  title?: string; // 视频标题
  duration?: number; // 广告时长（秒）
  isAdlook?: boolean; // 是否看过当前广告
  id?: string;
  info?: {
    count: number;
  };
}
export interface Ipitem {
  ip:string,
  addr:string
}
export interface MovieDetail{
  id: string;
  title?: string;
  type?: string;
  collectionIndex:string;
  src:string;
  poster?: string;
}
export interface VersionItem {
  id: number;
  versionName: string;
  downloadUrl: string;
  createdAt: string;
  updatedLog: string;
}
export interface ConfigItem {
  id: number;
  key: string;
  value: string;
}
export interface AdItem {
  id: number;
  link: string;
  description: string;
}
export interface resultItem {
  result: boolean;
}

export interface FormType {
  PageIndex: string;
  PageSize: string;
  VideoType: string;
  SortType: string;
}
export interface MovieFormType {
  PageIndex: number,
  PageSize: number,
  ChannelId: string,
  GenderChannelType: string
}
// 口令验证接口
export interface PasswordVerifyResponse {
  result: boolean;
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
// 获取本地IP
export const getip = async (): Promise<Ipitem> => {
  try {
    const response = await mmpRequest.get('/ipapi/ipJson.jsp',{
        params: { json:true }
      });
      return response.data;
  } catch (error) {
    console.error('获取视频1失败:', error);
    return {} as Ipitem;
  }
};
// 自己的接口
export const fetchVideo1 = async (): Promise<VideoItem[]> => {
  try {
    const response = await ipapiRequest.get(`/api/ksvideo`);
    return (response.data || []).map((item: any) => ({
      src: item.link,
    }));
  } catch (error) {
    console.error('获取视频1失败:', error);
    return [];
  }
};
// 获取版本号
export const getVersion = async (): Promise<VersionItem> => {
  const version: VersionItem = {
    id: 0,
    versionName: '0.0.0',
    downloadUrl: '',
    createdAt: '',
    updatedLog: ''
  };
  try {
    const response = await mmpRequest.get(`/api/versions/latest`);  // 获取最新版本
    version.versionName = response.data.versionName;
    version.downloadUrl = response.data.downloadUrl;
    version.createdAt = response.data.createdAt;
    version.updatedLog = response.data.updatedLog;
    version.id = response.data.id;
    return version;
  } catch (error) {
    console.error('获取版本号失败:', error);
    return version;
  }
};
// 获取广告
export const getAd = async (): Promise<AdItem[]> => {
  let list: AdItem[] = [];
  try {
    const response = await mmpRequest.get(`/api/ads`);
    if (response.data) {
      list = response.data;
    }
    return list;
  } catch (error) {
    console.error('获取广告失败:', error);
    return list;
  }
};
// 保存设备信息
export const savedevice = async (device:AnalyticsData,timeout:number): Promise<AnalyticsData> => {
  try {
    const headers = {
      "content-type": "application/json"
    };
    const response = await mmpRequest.post(
      `/api/savedevice`,
      device,
      {
      headers,
      timeout: timeout // 毫秒
      }
    );
    return response.data;
  } catch (error) {
    console.error('保存设备信息失败:', error);
    return {} as AnalyticsData;
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
      "x-auth-uuid": AES_UUID(),
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

      // 使用 Promise.all 并行处理异步 map
      const result: VideoItem[] = await Promise.all(list100.map(async (element: any) => {
        const mm = getm3u8(PLAYDOMAIN, element['playUrl']);
        const picblob = await fetchAndDecrypt(PLAYDOMAIN + element['imgUrl']);
        return {
          src: mm,
          poster: URL.createObjectURL(picblob),
          title: element['title'],
          type: 'application/x-mpegURL',
        };
      }));
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
      const result = await Promise.all(list100.map(async (element: any) => {
        const mm = getm3u8(PLAYDOMAIN, element['first']['playUrl']);
        const picblob = await fetchAndDecrypt(PLAYDOMAIN + element['imgUrl']);
        return {
          src: mm,
          id: element['id'],
          poster: URL.createObjectURL(picblob),
          videotype:'dm',
          title: element['title'],
          type: 'application/x-mpegURL', // 设置视频类型为 m3u8
        };
      }));
      return result;
    }
    return [];
  } catch (error) {
    console.error('获取短剧视频失败:', error);
    return [];
  }
};
// 获取短剧详情
export const getShortdetail = async (id:string): Promise<MovieDetail[]> => {
  try {
    const da = AES_Encrypt(JSON.stringify({Id:id}));
    const headers = {
      "authorization": "Bearer null",
      "Accept": "application/json, text/plain, */*",
      "x-auth-uuid": AES_UUID(),
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    };
    const response = await mgtvRequest.post(
      '/ShortMovie/ShortMovieDetail',
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
      console.log('短剧详情99:', list99);
      const list100 = list99?.data?.items || [];
      console.log('短句视频列表:', list100);
      // list100
      //collectionIndex :  "2",
      //duration :  "544"
      //id :  "35677"
      //playUrl :  "MGTV/20250604/bd4494ebc035c1ba401f531789325993/index2.m3u8"
      // 处理每个视频
      const result:MovieDetail[] = list100.map((element: any) => {
        const mm = getm3u8(PLAYDOMAIN, element['playUrl']);
        return {
          src: mm,
          id: element['id'],
          collectionIndex: element['collectionIndex'],
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
}

export const verifyPassword = async (password: string): Promise<PasswordVerifyResponse> => {
  try {
    const response = await mmpRequest.get('/api/config/yanzheng', {
      params: { value: password }
    });
    return response.data;
  } catch (error) {
    console.error('口令验证失败:', error);
    throw error;
  }
};

export const pojie = (str: any) => {
  // const textDecoder = new TextDecoder();
  // const text = textDecoder.decode(str);
  const decryptedPassword = AES_Decrypt(str);
  const list99 = JSON.parse(decryptedPassword);
  console.log(list99);
}