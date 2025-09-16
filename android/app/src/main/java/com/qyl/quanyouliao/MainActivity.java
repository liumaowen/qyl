package com.qyl.quanyouliao;

import android.os.Bundle;
import java.util.ArrayList;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.qyl.quanyouliao.ads.StartioAdsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize plugins list
        ArrayList<Class<? extends Plugin>> additionalPlugins = new ArrayList<>();
        additionalPlugins.add(StartioAdsPlugin.class);
        init(savedInstanceState, additionalPlugins);
    }
}
