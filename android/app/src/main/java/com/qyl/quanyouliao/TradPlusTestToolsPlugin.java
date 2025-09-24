package com.qyl.quanyouliao;

import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "TradPlusTestTools")
public class TradPlusTestToolsPlugin extends Plugin {
    private static final String TAG = "TradPlusTestTools";

    @PluginMethod
    public void showTestTools(PluginCall call) {
        String appId = call.getString("appId");

        Log.d(TAG, "🔧 开始启动 TradPlus 测试工具，App ID: " + appId);
        sendLogEvent("🔧 开始启动 TradPlus 测试工具，App ID: " + appId);

        if (appId == null || appId.isEmpty()) {
            String error = "App ID 参数为空或未提供";
            Log.e(TAG, "❌ " + error);
            sendLogEvent("❌ " + error);
            call.reject(error);
            return;
        }

        // 使用反射来避免在 release 版本中引用测试工具
        try {
            Log.d(TAG, "🔍 尝试通过反射加载测试工具类...");
            sendLogEvent("🔍 尝试通过反射加载测试工具类...");

            Class<?> importSDKUtil = Class.forName("com.tradplusad.importSDK.util.ImportSDKUtil");
            Log.d(TAG, "✅ 成功加载 ImportSDKUtil 类");
            sendLogEvent("✅ 成功加载 ImportSDKUtil 类");

            Object instance = importSDKUtil.getMethod("getInstance").invoke(null);
            Log.d(TAG, "✅ 成功获取 ImportSDKUtil 实例");
            sendLogEvent("✅ 成功获取 ImportSDKUtil 实例");

            importSDKUtil.getMethod("showTestTools", android.content.Context.class, String.class)
                        .invoke(instance, getActivity(), appId);

            Log.i(TAG, "🚀 测试工具启动成功！");
            sendLogEvent("🚀 测试工具启动成功！");
            call.resolve();
        } catch (ClassNotFoundException e) {
            String error = "测试工具类未找到 (可能在 release 版本中): " + e.getMessage();
            Log.w(TAG, "⚠️ " + error);
            sendLogEvent("⚠️ " + error);
            call.reject(error);
        } catch (NoSuchMethodException e) {
            String error = "测试工具方法未找到: " + e.getMessage();
            Log.e(TAG, "❌ " + error);
            sendLogEvent("❌ " + error);
            call.reject(error);
        } catch (Exception e) {
            String error = "启动测试工具时发生未知错误: " + e.getClass().getSimpleName() + " - " + e.getMessage();
            Log.e(TAG, "❌ " + error, e);
            sendLogEvent("❌ " + error);
            call.reject(error);
        }
    }

    @PluginMethod
    public void isTestToolsAvailable(PluginCall call) {
        Log.d(TAG, "🔍 检查测试工具可用性...");
        sendLogEvent("🔍 检查测试工具可用性...");

        try {
            Class<?> importSDKUtil = Class.forName("com.tradplusad.importSDK.util.ImportSDKUtil");
            Log.i(TAG, "✅ 测试工具可用");
            sendLogEvent("✅ 测试工具可用 (调试版本)");
            call.resolve(new JSObject().put("available", true));
        } catch (ClassNotFoundException e) {
            Log.i(TAG, "ℹ️ 测试工具不可用 (可能在 release 版本中)");
            sendLogEvent("ℹ️ 测试工具不可用 (可能在 release 版本中)");
            call.resolve(new JSObject().put("available", false));
        } catch (Exception e) {
            String error = "检查测试工具可用性时发生错误: " + e.getMessage();
            Log.e(TAG, "❌ " + error);
            sendLogEvent("❌ " + error);
            call.resolve(new JSObject().put("available", false));
        }
    }

    /**
     * 发送日志事件到前端
     */
    private void sendLogEvent(String message) {
        JSObject logData = new JSObject();
        logData.put("message", "[TradPlus测试工具] " + message);
        logData.put("timestamp", System.currentTimeMillis());
        notifyListeners("testToolsLog", logData);
    }
}