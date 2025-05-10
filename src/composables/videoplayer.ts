import { CapacitorVideoPlayer } from 'capacitor-video-player';
import { Capacitor } from '@capacitor/core';

export interface VideoPlayerOuput  {
    result?: boolean;
    method?: string;
    value?: any;
    message?: string;
}
interface PlayerData {
    mode: string,
    url: string,
    playerId: string,
    componentTag: string, 
    width?: number | null,
    height?: number | null,
    subtitle?: string | null,
    language?: string | null,
    subtitleOptions?: any | null
}

export type VideoPlayerProps = {
    onReady?: (fromPlayerId: string, currentTime?: number,
               message?: string) => void;
    onPlay?: (fromPlayerId: string, currentTime?: number,
               message?: string) => void;
    onPause?: (fromPlayerId: string, currentTime?: number,
               message?: string) => void;
    onEnded?: (fromPlayerId: string, currentTime?: number,
               message?: string) => void;
    onExit?: (dismiss: boolean) => void;
}

export interface VideoPlayerHook {
    echo: (value: string) => Promise<{value: string}>;
    initPlayer: (mode: string, url: string, playerId: string,
        componenTag: string, subTitleUrl?: string, 
        subTitleLangage?: string, subTitleOptions?: any, 
        width?:number, height?:number) => 
        Promise<VideoPlayerOuput>;
    isPlaying: (playerId: string) => Promise<VideoPlayerOuput>;
    pause: (playerId: string) => Promise<VideoPlayerOuput>;
    play: (playerId: string) => Promise<VideoPlayerOuput>;
    getDuration: (playerId: string) => Promise<VideoPlayerOuput>;
    setVolume: (playerId: string, volume: number) => 
        Promise<VideoPlayerOuput>;
    getVolume: (playerId: string) => Promise<VideoPlayerOuput>;
    setMuted: (playerId: string, muted: boolean) => 
        Promise<VideoPlayerOuput>;
    getMuted: (playerId: string) => Promise<VideoPlayerOuput>;
    setCurrentTime: (playerId: string, seektime: number) => 
        Promise<VideoPlayerOuput>;
    getCurrentTime: (playerId: string) => Promise<VideoPlayerOuput>;
    stopAllPlayers: () => Promise<VideoPlayerOuput>;
    removeListeners: () => Promise<void>;
    getPlatform: () => Promise<{platform: string}>;
}

export function useVideoPlayer(onVPEvents?: VideoPlayerProps): VideoPlayerHook {
    const platform = Capacitor.getPlatform();
    const vpPlugin: any = CapacitorVideoPlayer;
    // Add Listeners
    let playListener: any = null;
    let pauseListener: any = null;
    let endedListener: any = null;
    let exitListener: any = null;
    let readyListener: any = null;

    if( onVPEvents ) { 
        if(onVPEvents.onPlay && vpPlugin) playListener =
            vpPlugin.addListener('jeepCapVideoPlayerPlay',
            (e: any) => {
                if(typeof onVPEvents.onPlay !== 'undefined')
                    onVPEvents.onPlay(e.fromPlayerId, e.currentTime);
            });
        if(onVPEvents.onPause && vpPlugin) pauseListener =
            vpPlugin.addListener('jeepCapVideoPlayerPause',
            (e: any) => {
                if(typeof onVPEvents.onPause !== 'undefined')
                    onVPEvents.onPause(e.fromPlayerId, e.currentTime);
            });
        if(onVPEvents.onEnded && vpPlugin) endedListener =
            vpPlugin.addListener('jeepCapVideoPlayerEnded',
            (e: any) => {
                if(typeof onVPEvents.onEnded !== 'undefined')
                    onVPEvents.onEnded(e.fromPlayerId, e.currentTime);
            });
        if(onVPEvents.onExit && vpPlugin) exitListener =
            vpPlugin.addListener('jeepCapVideoPlayerExit',
            (e: any) => {
                if(typeof onVPEvents.onExit !== 'undefined')
                    onVPEvents.onExit(e.dismiss);
            });
        if(onVPEvents.onReady && vpPlugin) readyListener =
            vpPlugin.addListener('jeepCapVideoPlayerReady',
            (e: any) => {
                if(typeof onVPEvents.onReady !== 'undefined')
                    onVPEvents.onReady(e.fromPlayerId, e.currentTime);
            });
    }
    /**
     * Remove Json Listeners
     */
    const removeListeners = async (): Promise<void> => {
            playListener.remove();
            pauseListener.remove();
            endedListener.remove();
            exitListener.remove();
            readyListener.remove();
    };
    /**
     * Echo value
     * @param value 
     */
    const echo = async (value: string): Promise<{value: string}> => {
        const ret = {value: ""};
        if(value) {
            const r = await vpPlugin.echo(value);
            if(r) {
                return r;
            }
            return ret;    
        } else {
            ret.value = "Echo: failed";
            return ret;
        }
    };
    /**
     * Get Platform
     */
    const getPlatform = async (): Promise<any> => {
        return {platform: platform};
    };
    /**
     * Method initPlayer
     * Init the player
     * @param mode 
     * @param url 
     * @param playerId 
     * @param componentTag 
     * @param subTitleUrl 
     * @param subTitleLangage 
     * @param subTitleOptions 
     * @param width 
     * @param height 
     * @returns 
     */
    const initPlayer = async (mode: string, url : string,
        playerId: string, componentTag: string,
        subTitleUrl?: string , subTitleLangage?: string, subTitleOptions?: any) => {
        const playerData: PlayerData = {mode: mode, url: url, 
            playerId: playerId, componentTag: componentTag}
        playerData.subtitle = subTitleUrl != null ? subTitleUrl : null; 
        playerData.language = subTitleLangage != null ? subTitleLangage : null;
        if(subTitleOptions != null) {
            playerData.subtitleOptions = {};
            if(subTitleOptions.backgroundColor != null)
                playerData.subtitleOptions.backgroundColor = subTitleOptions.backgroundColor;
            if(subTitleOptions.fontSize != null)
                playerData.subtitleOptions.fontSize = subTitleOptions.fontSize;
            if(subTitleOptions.foregroundColor != null)
                playerData.subtitleOptions.foregroundColor = subTitleOptions.foregroundColor;
            
        } else {
            playerData.subtitleOptions = null;
        }
        const r = await vpPlugin.initPlayer(playerData);
        if (r) {
            if( typeof r.result != 'undefined') {
                return r;
            }
        }
        return {result: false, method: "initPlayer", 
                message: "initPlayer failed"};
    }; 
    /**
     * Method isPlaying 
     * @param playerId string
     */
     const isPlaying = async (playerId: string) => {
        const r = await vpPlugin.isPlaying({ playerId:playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "isPlaying",
            message: "isPlaying failed" };

    };

    /**
     * Method pause 
     * pause the videoplayer 
     * @param playerId string
     */
    const pause = async (playerId: string) => {
        const r = await vpPlugin.pause({ playerId: playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "pause",
            message: "pause failed" };

    };

    /**
     * Method play 
     * play the videoplayer 
     * @param playerId string
     */
    const play = async (playerId: string) => {
        const r = await vpPlugin.play({ playerId: playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "play",
            message: "play failed" };

    };

    /**
     * Method getDuration 
     * get the video duration
     * @param playerId string
     */
    const getDuration = async (playerId: string) => {
        const r = await vpPlugin.getDuration({ 
            playerId: playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "getDuration",
            message: "getDuration failed" };

    };

    /**
     * Method setVolume 
     * set the video volume
     * @param playerId string
     * @param volume number
     */
    const setVolume = async (playerId: string,
            volume: number) => {
        const r = await vpPlugin.setVolume({ playerId: playerId,
            volume: volume });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "setVolume",
            message: "setVolume failed" };

    };

    /**
     * Method getVolume 
     * get the video volume
     * @param playerId string
     */
    const getVolume = async (playerId: string) => {
        const r = await vpPlugin.getVolume({ 
                playerId: playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
    return { result: false, method: "getVolume",
        message: "getVolume failed" };

    };

    /**
     * Method setMuted 
     * set the video muted parameter
     * @param playerId string
     * @param muted boolean
     */
    const setMuted = async (playerId: string,
            muted: boolean) => {
        const r = await vpPlugin.setMuted({ 
                playerId: playerId, muted: muted });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "setMuted",
            message: "setMuted failed" };

    };

    /**
     * Method getMuted 
     * get the video muted parameter
     * @param playerId string
     */
    const getMuted = async (playerId: string) => {
        const r = await vpPlugin.getMuted({ playerId: playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "getMuted",
            message: "getMuted failed" };

    };

    /**
     * Method setCurrentTime 
     * set the video current time
     * @param playerId string
     * @param seektime number
     */
    const setCurrentTime = async (playerId: string,
                seektime: number) => {
        const r = await vpPlugin.setCurrentTime({ 
            playerId: playerId, seektime: seektime });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "setCurrentTime",
            message: "setCurrentTime failed" };

    };

    /**
     * Method getCurrentTime 
     * get the video current time
     * @param playerId string
     */
    const getCurrentTime = async (playerId: string) => {
        const r = await vpPlugin.getCurrentTime({ 
            playerId: playerId });
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "getCurrentTime",
            message: "getCurrentTime failed" };

    };

    /**
     * Method stopAllPlayers
     * stop all players
     */
    const stopAllPlayers = async () => {
        const r = await vpPlugin.stopAllPlayers();
        if (r) {
            if (typeof r.result != 'undefined') {
                return r;
            }
        }
        return { result: false, method: "stopAllPlayers",
            message: "stopAllPlayers failed" };

    };
    
    
    return {echo, initPlayer, isPlaying, play, pause, getDuration,
        setVolume, getVolume, setMuted, getMuted, setCurrentTime, 
        getCurrentTime, stopAllPlayers, removeListeners, getPlatform };
}

