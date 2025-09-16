package com.qyl.quanyouliao.ads;

import android.app.Activity;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.startapp.sdk.adsbase.Ad;
import com.startapp.sdk.adsbase.adlisteners.AdEventListener;
import com.startapp.sdk.adsbase.StartAppAd;

@CapacitorPlugin(name = "StartioAds")
public class StartioAdsPlugin extends Plugin {
    private static final String TAG = "StartioAds";

    private StartAppAd interstitialAd;
    private StartAppAd rewardedAd;

    @Override
    public void load() {
        super.load();
        // Initialize Start.io SDK when plugin loads
        StartAppSDK.init(getContext(), "208466650", false);
        StartAppSDK.setTestAdsEnabled(true);
        StartAppSDK.setUserConsent(getContext(), "pas", System.currentTimeMillis(), true);
        Log.d(TAG, "StartioAds plugin loaded and SDK initialized");
    }

    @PluginMethod
    public void init(PluginCall call) {
        Log.d(TAG, "StartioAds plugin initialized");
        // 发送日志到前端
        JSObject logData = new JSObject();
        logData.put("message", "StartioAds plugin initialized");
        notifyListeners("debugLog", logData);
        
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void loadInterstitial(PluginCall call) {
        Activity activity = getActivity();
        if (interstitialAd == null) {
            interstitialAd = new StartAppAd(activity);
        }
        Log.d(TAG, "Loading interstitial ad...");
        // 发送日志到前端
        JSObject logData = new JSObject();
        logData.put("message", "Loading interstitial ad...");
        notifyListeners("debugLog", logData);
        
        interstitialAd.loadAd(StartAppAd.AdMode.AUTOMATIC, new AdEventListener() {
            @Override
            public void onReceiveAd(Ad ad) {
                Log.d(TAG, "Interstitial ad loaded successfully");
                // 发送成功日志到前端
                JSObject logData = new JSObject();
                logData.put("message", "✅ Interstitial ad loaded successfully");
                notifyListeners("debugLog", logData);
                
                JSObject data = new JSObject();
                data.put("event", "loaded");
                notifyListeners("interstitialEvent", data);
                call.resolve();
            }
            @Override
            public void onFailedToReceiveAd(Ad ad) {
                Log.e(TAG, "Failed to load interstitial ad");
                // 发送失败日志到前端
                JSObject logData = new JSObject();
                logData.put("message", "❌ Failed to load interstitial ad");
                notifyListeners("debugLog", logData);
                
                JSObject data = new JSObject();
                data.put("event", "failed");
                notifyListeners("interstitialEvent", data);
                call.reject("interstitial_failed");
            }
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        Activity activity = getActivity();
        boolean isReady = interstitialAd != null && interstitialAd.isReady();
        Log.d(TAG, "Attempting to show interstitial ad. Ready: " + isReady);
        
        // 发送状态日志到前端
        JSObject logData = new JSObject();
        logData.put("message", "🔄 Attempting to show interstitial ad. Ready: " + isReady);
        notifyListeners("debugLog", logData);
        
        if (isReady) {
            Log.d(TAG, "Showing interstitial ad");
            logData.put("message", "📺 Showing interstitial ad");
            notifyListeners("debugLog", logData);
            interstitialAd.showAd();
            call.resolve();
        } else {
            Log.w(TAG, "Interstitial ad not ready");
            logData.put("message", "⚠️ Interstitial ad not ready");
            notifyListeners("debugLog", logData);
            call.reject("interstitial_not_ready");
        }
    }

    @PluginMethod
    public void loadRewarded(PluginCall call) {
        Activity activity = getActivity();
        if (rewardedAd == null) {
            rewardedAd = new StartAppAd(activity);
        }
        Log.d(TAG, "Loading rewarded ad...");
        // 发送日志到前端
        JSObject logData = new JSObject();
        logData.put("message", "Loading rewarded ad...");
        notifyListeners("debugLog", logData);
        
        rewardedAd.loadAd(StartAppAd.AdMode.VIDEO, new AdEventListener() {
            @Override
            public void onReceiveAd(Ad ad) {
                Log.d(TAG, "Rewarded ad loaded successfully");
                // 发送成功日志到前端
                JSObject logData = new JSObject();
                logData.put("message", "✅ Rewarded ad loaded successfully");
                notifyListeners("debugLog", logData);
                
                JSObject data = new JSObject();
                data.put("event", "loaded");
                notifyListeners("rewardedEvent", data);
                call.resolve();
            }
            @Override
            public void onFailedToReceiveAd(Ad ad) {
                Log.e(TAG, "Failed to load rewarded ad");
                // 发送失败日志到前端
                JSObject logData = new JSObject();
                logData.put("message", "❌ Failed to load rewarded ad");
                notifyListeners("debugLog", logData);
                
                JSObject data = new JSObject();
                data.put("event", "failed");
                notifyListeners("rewardedEvent", data);
                call.reject("rewarded_failed");
            }
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        boolean isReady = rewardedAd != null && rewardedAd.isReady();
        Log.d(TAG, "Attempting to show rewarded ad. Ready: " + isReady);
        
        // 发送状态日志到前端
        JSObject logData = new JSObject();
        logData.put("message", "🔄 Attempting to show rewarded ad. Ready: " + isReady);
        notifyListeners("debugLog", logData);
        
        if (isReady) {
            Log.d(TAG, "Showing rewarded ad");
            logData.put("message", "📺 Showing rewarded ad");
            notifyListeners("debugLog", logData);
            rewardedAd.showAd(new com.startapp.sdk.adsbase.adlisteners.AdDisplayListener() {
                @Override
                public void adHidden(Ad ad) {
                    // noop
                }
                @Override
                public void adDisplayed(Ad ad) {
                    // noop
                }
                @Override
                public void adClicked(Ad ad) {
                    // noop
                }
                @Override
                public void adNotDisplayed(Ad ad) {
                    // noop
                }
            });
            call.resolve();
        } else {
            Log.w(TAG, "Rewarded ad not ready");
            logData.put("message", "⚠️ Rewarded ad not ready");
            notifyListeners("debugLog", logData);
            call.reject("rewarded_not_ready");
        }
    }
} 