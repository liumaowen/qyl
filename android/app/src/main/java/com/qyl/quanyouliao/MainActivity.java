package com.qyl.quanyouliao;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.startapp.sdk.adsbase.StartAppSDK;
import com.qyl.quanyouliao.ads.StartioAdsPlugin;
import com.qyl.quanyouliao.ads.TradPlusAdsPlugin;
import com.qyl.quanyouliao.utils.TradPlusConstants;
import com.qyl.quanyouliao.TradPlusTestToolsPlugin;

// TradPlus imports based on official demo
import com.google.android.ump.ConsentForm;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;
import com.tradplus.ads.base.common.TPPrivacyManager;
import com.tradplus.ads.open.TradPlusSdk;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        // Register custom plugins
        registerPlugin(StartioAdsPlugin.class);
        registerPlugin(TradPlusAdsPlugin.class);
        registerPlugin(TradPlusTestToolsPlugin.class);
        super.onCreate(savedInstanceState);

        // Initialize Start.io SDK with APP ID
        StartAppSDK.init(this, "208466650", false);
        // Enable test ads for debugging
        // StartAppSDK.setTestAdsEnabled(true);
        // Set user consent (required for GDPR compliance)
        StartAppSDK.setUserConsent(this, "pas", System.currentTimeMillis(), true);

        // Initialize TradPlus with privacy compliance based on official demo
        setPrivacyConsent();
    }

    /**
     * 隐私合规处理 - 基于官方demo最佳实践
     */
    private void setPrivacyConsent() {
        // Google UMP (User Messaging Platform) for GDPR compliance
        ConsentRequestParameters params = new ConsentRequestParameters
                .Builder()
                // 指示用户是否低于同意年龄; true 低于同意年龄
                // 未满同意年龄的用户不会收到 GDPR 消息表单
                .setTagForUnderAgeOfConsent(false)
                .build();

        ConsentInformation consentInformation = UserMessagingPlatform.getConsentInformation(this);
        consentInformation.requestConsentInfoUpdate(
                this, params, (ConsentInformation.OnConsentInfoUpdateSuccessListener) () -> {
                    UserMessagingPlatform.loadAndShowConsentFormIfRequired(this,
                            (ConsentForm.OnConsentFormDismissedListener) loadAndShowError -> {
                                if (loadAndShowError != null) {
                                    // Consent gathering failed.
                                    Log.e(TAG, "Consent gathering failed: " + loadAndShowError.getMessage());
                                }

                                // Consent has been gathered.
                                if (consentInformation.canRequestAds()) {
                                    Log.i(TAG, "授权完成,初始化TradPlus SDK");
                                    // 授权完成,初始化SDK
                                    initTPSDK();
                                }
                            });
                }, (ConsentInformation.OnConsentInfoUpdateFailureListener) requestConsentError -> {
                    // Consent gathering failed.
                    Log.e(TAG, "Consent info update failed: " + requestConsentError.getMessage());
                    // 即使授权失败也初始化SDK (用于测试)
                    initTPSDK();
                });

        // 用户已经进行过UMP选择
        if (consentInformation.canRequestAds()) {
            Log.i(TAG, "用户已授权，直接初始化TradPlus SDK");
            // 授权完成,初始化SDK
            initTPSDK();
        }
    }

    /**
     * 初始化TradPlus SDK - 基于官方demo
     */
    private void initTPSDK() {
        if (!TradPlusSdk.getIsInit()) {
            Log.i(TAG, "开始初始化TradPlus SDK, App ID: " + TradPlusConstants.APPID);

            // 初始化是否成功 （可选）
            TradPlusSdk.setTradPlusInitListener(new TradPlusSdk.TradPlusInitListener() {
                @Override
                public void onInitSuccess() {
                    Log.i(TAG, "✅ TradPlus SDK 初始化成功");
                }
            });

            // 初始化SDK
            TradPlusSdk.initSdk(this, TradPlusConstants.APPID);
        } else {
            Log.i(TAG, "TradPlus SDK 已经初始化");
        }
    }
}
