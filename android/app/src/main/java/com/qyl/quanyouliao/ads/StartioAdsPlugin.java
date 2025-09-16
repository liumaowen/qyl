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

    @PluginMethod
    public void init(PluginCall call) {
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
        interstitialAd.loadAd(StartAppAd.AdMode.AUTOMATIC, new AdEventListener() {
            @Override
            public void onReceiveAd(Ad ad) {
                JSObject data = new JSObject();
                data.put("event", "loaded");
                notifyListeners("interstitialEvent", data);
                call.resolve();
            }
            @Override
            public void onFailedToReceiveAd(Ad ad) {
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
        if (interstitialAd != null && interstitialAd.isReady()) {
            interstitialAd.showAd();
            call.resolve();
        } else {
            call.reject("interstitial_not_ready");
        }
    }

    @PluginMethod
    public void loadRewarded(PluginCall call) {
        Activity activity = getActivity();
        if (rewardedAd == null) {
            rewardedAd = new StartAppAd(activity);
        }
        rewardedAd.loadAd(StartAppAd.AdMode.REWARDED_VIDEO, new AdEventListener() {
            @Override
            public void onReceiveAd(Ad ad) {
                JSObject data = new JSObject();
                data.put("event", "loaded");
                notifyListeners("rewardedEvent", data);
                call.resolve();
            }
            @Override
            public void onFailedToReceiveAd(Ad ad) {
                JSObject data = new JSObject();
                data.put("event", "failed");
                notifyListeners("rewardedEvent", data);
                call.reject("rewarded_failed");
            }
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        if (rewardedAd != null && rewardedAd.isReady()) {
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
                public void adNotDisplayed(Ad ad) {
                    // noop
                }
            });
            call.resolve();
        } else {
            call.reject("rewarded_not_ready");
        }
    }
} 