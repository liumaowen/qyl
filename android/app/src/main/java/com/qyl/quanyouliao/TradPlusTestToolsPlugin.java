package com.qyl.quanyouliao;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TradPlusTestTools")
public class TradPlusTestToolsPlugin extends Plugin {

    @PluginMethod
    public void showTestTools(PluginCall call) {
        String appId = call.getString("appId");

        if (appId == null || appId.isEmpty()) {
            call.reject("App ID is required");
            return;
        }

        // 使用反射来避免在 release 版本中引用测试工具
        try {
            Class<?> importSDKUtil = Class.forName("com.tradplusad.importSDK.util.ImportSDKUtil");
            Object instance = importSDKUtil.getMethod("getInstance").invoke(null);
            importSDKUtil.getMethod("showTestTools", android.content.Context.class, String.class)
                        .invoke(instance, getActivity(), appId);
            call.resolve();
        } catch (Exception e) {
            // 如果测试工具不存在（如在 release 版本中），返回错误
            call.reject("TradPlus test tools not available in this build: " + e.getMessage());
        }
    }

    @PluginMethod
    public void isTestToolsAvailable(PluginCall call) {
        try {
            Class<?> importSDKUtil = Class.forName("com.tradplusad.importSDK.util.ImportSDKUtil");
            call.resolve(new com.getcapacitor.JSObject().put("available", true));
        } catch (Exception e) {
            call.resolve(new com.getcapacitor.JSObject().put("available", false));
        }
    }
}