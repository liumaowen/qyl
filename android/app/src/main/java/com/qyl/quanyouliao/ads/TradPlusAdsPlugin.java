package com.qyl.quanyouliao.ads;

import android.app.Activity;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.tradplus.ads.base.bean.TPAdError;
import com.tradplus.ads.base.bean.TPAdInfo;
import com.tradplus.ads.base.util.SegmentUtils;
import com.tradplus.ads.open.LoadAdEveryLayerListener;
import com.tradplus.ads.open.TradPlusSdk;
import com.tradplus.ads.open.interstitial.InterstitialAdListener;
import com.tradplus.ads.open.interstitial.TPInterstitial;
import com.tradplus.ads.open.reward.RewardAdListener;
import com.tradplus.ads.open.reward.TPReward;
import com.qyl.quanyouliao.utils.TradPlusConstants;

// 添加以下导入用于获取GAID
import com.google.android.gms.ads.identifier.AdvertisingIdClient;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;

import java.util.HashMap;

@CapacitorPlugin(name = "TradPlusAds")
public class TradPlusAdsPlugin extends Plugin {
    private static final String TAG = "TradPlusAds";

    private TPInterstitial mTPInterstitial;
    private TPReward mTPReward;

    @PluginMethod
    public void init(PluginCall call) {
        Activity activity = getActivity();
        String appId = call.getString("appId", TradPlusConstants.APPID);

        Log.d(TAG, "Initializing TradPlus SDK with App ID: " + appId);

        // 发送日志到前端
        JSObject logData = new JSObject();
        logData.put("message", "Initializing TradPlus SDK with App ID: " + appId);
        notifyListeners("debugLog", logData);

        try {
            if (!TradPlusSdk.getIsInit()) {
                // 初始化是否成功 （可选）
                TradPlusSdk.setTradPlusInitListener(new TradPlusSdk.TradPlusInitListener() {
                    @Override
                    public void onInitSuccess() {
                        Log.d(TAG, "TradPlus SDK initialized successfully");

                        JSObject logData = new JSObject();
                        logData.put("message", "✅ TradPlus SDK initialized successfully");
                        notifyListeners("debugLog", logData);

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        call.resolve(ret);
                    }
                });

                // 初始化SDK
                TradPlusSdk.initSdk(activity, appId);
            } else {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "SDK already initialized");
                call.resolve(ret);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error initializing TradPlus SDK", e);
            call.reject("init_error", e.getMessage());
        }
    }

    @PluginMethod
    public void loadInterstitial(PluginCall call) {
        Activity activity = getActivity();
        String unitId = call.getString("unitId", TradPlusConstants.INTERSTITIAL_ADUNITID);

        Log.d(TAG, "Loading TradPlus interstitial ad with Unit ID: " + unitId);

        JSObject logData = new JSObject();
        logData.put("message", "Loading TradPlus interstitial ad...");
        notifyListeners("debugLog", logData);

        if (mTPInterstitial == null) {
            mTPInterstitial = new TPInterstitial(activity, unitId);

            //进入广告场景，广告场景ID后台创建
            mTPInterstitial.entryAdScenario(TradPlusConstants.ENTRY_AD_INTERSTITIAL);

            // 流量分组
            HashMap<String, String> customMap = new HashMap<>();
            customMap.put("user_gender", "male");
            customMap.put("user_level", "10");
            SegmentUtils.initPlacementCustomMap(unitId, customMap);

            // 监听广告的不同状态
            mTPInterstitial.setAdListener(new InterstitialAdListener() {
                @Override
                public void onAdLoaded(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus interstitial ad loaded successfully");

                    JSObject logData = new JSObject();
                    logData.put("message", "✅ TradPlus interstitial ad loaded successfully");
                    notifyListeners("debugLog", logData);

                    JSObject data = new JSObject();
                    data.put("event", "loaded");
                    data.put("source", "tradplus");
                    notifyListeners("interstitialEvent", data);
                    call.resolve();
                }

                @Override
                public void onAdClicked(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus interstitial ad clicked: " + tpAdInfo.adSourceName);
                    JSObject data = new JSObject();
                    data.put("event", "clicked");
                    data.put("source", "tradplus");
                    notifyListeners("interstitialEvent", data);
                }

                @Override
                public void onAdImpression(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus interstitial ad impression: " + tpAdInfo.adSourceName);
                    JSObject data = new JSObject();
                    data.put("event", "shown");
                    data.put("source", "tradplus");
                    notifyListeners("interstitialEvent", data);
                }

                @Override
                public void onAdFailed(TPAdError tpAdError) {
                    Log.e(TAG, "Failed to load TradPlus interstitial ad: " + tpAdError.getErrorMsg());

                    JSObject logData = new JSObject();
                    logData.put("message", "❌ Failed to load TradPlus interstitial ad: " + tpAdError.getErrorMsg());
                    notifyListeners("debugLog", logData);

                    JSObject data = new JSObject();
                    data.put("event", "failed");
                    data.put("source", "tradplus");
                    data.put("error", tpAdError.getErrorMsg());
                    notifyListeners("interstitialEvent", data);
                    call.reject("load_failed", tpAdError.getErrorMsg());
                }

                @Override
                public void onAdClosed(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus interstitial ad closed: " + tpAdInfo.adSourceName);
                    JSObject data = new JSObject();
                    data.put("event", "closed");
                    data.put("source", "tradplus");
                    notifyListeners("interstitialEvent", data);
                }

                @Override
                public void onAdVideoError(TPAdInfo tpAdInfo, TPAdError tpAdError) {
                    Log.e(TAG, "TradPlus interstitial video error: " + tpAdError.getErrorMsg());
                }

                @Override
                public void onAdVideoStart(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus interstitial video started");
                }

                @Override
                public void onAdVideoEnd(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus interstitial video ended");
                }
            });

            // 监听每一层广告的加载情况
            mTPInterstitial.setAllAdLoadListener(new LoadAdEveryLayerListener() {
                @Override
                public void onAdAllLoaded(boolean hasSuccess) {
                    Log.d(TAG, "All interstitial ads loaded, has success: " + hasSuccess);
                }

                @Override
                public void oneLayerLoadFailed(TPAdError tpAdError, TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Interstitial layer failed: " + tpAdInfo.adSourceName + " - " + tpAdError.getErrorMsg());
                }

                @Override
                public void oneLayerLoaded(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Interstitial layer loaded: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onAdStartLoad(String s) {
                    Log.d(TAG, "Interstitial start load: " + s);
                }

                @Override
                public void oneLayerLoadStart(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Interstitial layer start: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onBiddingStart(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Interstitial bidding start: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onBiddingEnd(TPAdInfo tpAdInfo, TPAdError tpAdError) {
                    Log.d(TAG, "Interstitial bidding end: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onAdIsLoading(String s) {
                    Log.d(TAG, "Interstitial is loading: " + s);
                }
            });
        }

        mTPInterstitial.loadAd();
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        if (mTPInterstitial != null && mTPInterstitial.isReady()) {
            Log.d(TAG, "Showing TradPlus interstitial ad");

            JSObject logData = new JSObject();
            logData.put("message", "📺 Showing TradPlus interstitial ad");
            notifyListeners("debugLog", logData);

            mTPInterstitial.showAd(getActivity(), "");
            call.resolve();
        } else {
            Log.w(TAG, "TradPlus interstitial ad not ready");

            JSObject logData = new JSObject();
            logData.put("message", "⚠️ TradPlus interstitial ad not ready");
            notifyListeners("debugLog", logData);

            call.reject("ad_not_ready");
        }
    }

    @PluginMethod
    public void loadRewarded(PluginCall call) {
        Activity activity = getActivity();
        String unitId = call.getString("unitId", TradPlusConstants.REWARDED_ADUNITID);

        Log.d(TAG, "Loading TradPlus rewarded ad with Unit ID: " + unitId);

        JSObject logData = new JSObject();
        logData.put("message", "Loading TradPlus rewarded ad...");
        notifyListeners("debugLog", logData);

        if (mTPReward == null) {
            mTPReward = new TPReward(activity, unitId);

            //进入广告场景
            mTPReward.entryAdScenario(TradPlusConstants.ENTRY_AD_REWARD);

            // 流量分组
            HashMap<String, String> customMap = new HashMap<>();
            customMap.put("user_gender", "male");
            customMap.put("user_level", "10");
            SegmentUtils.initPlacementCustomMap(unitId, customMap);

            // 监听广告的不同状态
            mTPReward.setAdListener(new RewardAdListener() {
                @Override
                public void onAdLoaded(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded ad loaded successfully");

                    JSObject logData = new JSObject();
                    logData.put("message", "✅ TradPlus rewarded ad loaded successfully");
                    notifyListeners("debugLog", logData);

                    JSObject data = new JSObject();
                    data.put("event", "loaded");
                    data.put("source", "tradplus");
                    notifyListeners("rewardedEvent", data);
                    call.resolve();
                }

                @Override
                public void onAdClicked(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded ad clicked: " + tpAdInfo.adSourceName);
                    JSObject data = new JSObject();
                    data.put("event", "clicked");
                    data.put("source", "tradplus");
                    notifyListeners("rewardedEvent", data);
                }

                @Override
                public void onAdImpression(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded ad impression: " + tpAdInfo.adSourceName);
                    JSObject data = new JSObject();
                    data.put("event", "shown");
                    data.put("source", "tradplus");
                    notifyListeners("rewardedEvent", data);
                }

                @Override
                public void onAdFailed(TPAdError tpAdError) {
                    Log.e(TAG, "Failed to load TradPlus rewarded ad: " + tpAdError.getErrorMsg());

                    JSObject logData = new JSObject();
                    logData.put("message", "❌ Failed to load TradPlus rewarded ad: " + tpAdError.getErrorMsg());
                    notifyListeners("debugLog", logData);

                    JSObject data = new JSObject();
                    data.put("event", "failed");
                    data.put("source", "tradplus");
                    data.put("error", tpAdError.getErrorMsg());
                    notifyListeners("rewardedEvent", data);
                    call.reject("load_failed", tpAdError.getErrorMsg());
                }

                @Override
                public void onAdClosed(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded ad closed: " + tpAdInfo.adSourceName);
                    JSObject data = new JSObject();
                    data.put("event", "closed");
                    data.put("source", "tradplus");
                    notifyListeners("rewardedEvent", data);
                }

                @Override
                public void onAdReward(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded ad - reward granted: " + tpAdInfo.currencyName + " x " + tpAdInfo.amount);

                    JSObject logData = new JSObject();
                    logData.put("message", "🎁 TradPlus rewarded ad - reward granted: " + tpAdInfo.currencyName + " x " + tpAdInfo.amount);
                    notifyListeners("debugLog", logData);

                    JSObject data = new JSObject();
                    data.put("event", "rewarded");
                    data.put("source", "tradplus");
                    data.put("currency", tpAdInfo.currencyName);
                    data.put("amount", tpAdInfo.amount);
                    notifyListeners("rewardedEvent", data);
                }

                @Override
                public void onAdVideoStart(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded video started");
                }

                @Override
                public void onAdVideoEnd(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "TradPlus rewarded video ended");
                }

                @Override
                public void onAdVideoError(TPAdInfo tpAdInfo, TPAdError tpAdError) {
                    Log.e(TAG, "TradPlus rewarded video error: " + tpAdError.getErrorMsg());
                }
            });

            // 监听每一层广告的加载情况
            mTPReward.setAllAdLoadListener(new LoadAdEveryLayerListener() {
                @Override
                public void onAdAllLoaded(boolean hasSuccess) {
                    Log.d(TAG, "All rewarded ads loaded, has success: " + hasSuccess);
                }

                @Override
                public void oneLayerLoadFailed(TPAdError tpAdError, TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Rewarded layer failed: " + tpAdInfo.adSourceName + " - " + tpAdError.getErrorMsg());
                }

                @Override
                public void oneLayerLoaded(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Rewarded layer loaded: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onAdStartLoad(String s) {
                    Log.d(TAG, "Rewarded start load: " + s);
                }

                @Override
                public void oneLayerLoadStart(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Rewarded layer start: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onBiddingStart(TPAdInfo tpAdInfo) {
                    Log.d(TAG, "Rewarded bidding start: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onBiddingEnd(TPAdInfo tpAdInfo, TPAdError tpAdError) {
                    Log.d(TAG, "Rewarded bidding end: " + tpAdInfo.adSourceName);
                }

                @Override
                public void onAdIsLoading(String s) {
                    Log.d(TAG, "Rewarded is loading: " + s);
                }
            });
        }

        mTPReward.loadAd();
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        if (mTPReward != null && mTPReward.isReady()) {
            Log.d(TAG, "Showing TradPlus rewarded ad");

            JSObject logData = new JSObject();
            logData.put("message", "📺 Showing TradPlus rewarded ad");
            notifyListeners("debugLog", logData);

            mTPReward.showAd(getActivity(), "");
            call.resolve();
        } else {
            Log.w(TAG, "TradPlus rewarded ad not ready");

            JSObject logData = new JSObject();
            logData.put("message", "⚠️ TradPlus rewarded ad not ready");
            notifyListeners("debugLog", logData);

            call.reject("ad_not_ready");
        }
    }

    @PluginMethod
    public void isInterstitialReady(PluginCall call) {
        boolean isReady = mTPInterstitial != null && mTPInterstitial.isReady();
        JSObject ret = new JSObject();
        ret.put("ready", isReady);
        call.resolve(ret);
    }

    @PluginMethod
    public void isRewardedReady(PluginCall call) {
        boolean isReady = mTPReward != null && mTPReward.isReady();
        JSObject ret = new JSObject();
        ret.put("ready", isReady);
        call.resolve(ret);
    }

    
    // 添加获取GAID的方法
    @PluginMethod
    public void getGAID(PluginCall call) {
        Log.d(TAG, "Getting GAID");
        
        // 在后台线程中获取GAID
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    AdvertisingIdClient.Info advertisingIdInfo = AdvertisingIdClient.getAdvertisingIdInfo(getActivity());
                    String gaid = advertisingIdInfo.getId();
                    
                    JSObject ret = new JSObject();
                    ret.put("gaid", gaid);
                    ret.put("success", true);
                    call.resolve(ret);
                    
                    // 同时发送到调试日志
                    JSObject logData = new JSObject();
                    logData.put("message", "📱 Device GAID: " + gaid);
                    notifyListeners("debugLog", logData);
                } catch (Exception e) {
                    Log.e(TAG, "Error getting GAID", e);
                    
                    JSObject ret = new JSObject();
                    ret.put("success", false);
                    ret.put("error", e.getMessage());
                    call.resolve(ret);
                    
                    // 同时发送到调试日志
                    JSObject logData = new JSObject();
                    logData.put("message", "❌ Error getting GAID: " + e.getMessage());
                    notifyListeners("debugLog", logData);
                }
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();

        if (mTPInterstitial != null) {
            mTPInterstitial.onDestroy();
        }

        if (mTPReward != null) {
            mTPReward.onDestroy();
        }
    }
}