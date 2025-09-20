package com.qyl.quanyouliao;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.startapp.sdk.adsbase.StartAppSDK;
import com.qyl.quanyouliao.ads.StartioAdsPlugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        
        // Register custom plugins
        registerPlugin(StartioAdsPlugin.class);
        super.onCreate(savedInstanceState);
        
        // Initialize Start.io SDK with APP ID
        StartAppSDK.init(this, "208466650", false);
        // Enable test ads for debugging
        // StartAppSDK.setTestAdsEnabled(true);
        // Set user consent (required for GDPR compliance)
        StartAppSDK.setUserConsent(this, "pas", System.currentTimeMillis(), true);
    }
}
