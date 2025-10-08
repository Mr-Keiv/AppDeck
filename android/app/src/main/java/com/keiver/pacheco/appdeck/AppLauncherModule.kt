package com.keiver.pacheco.appdeck

import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppLauncherModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppLauncher"
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm: PackageManager = reactApplicationContext.packageManager
            
            // Método 1: Intentar con getLaunchIntentForPackage (el más común)
            var intent: Intent? = pm.getLaunchIntentForPackage(packageName)
            
            if (intent == null) {
                // Método 2: Buscar la actividad LAUNCHER manualmente (como hace monkey)
                Log.d("AppLauncher", "getLaunchIntentForPackage retornó null, buscando LAUNCHER manualmente")
                
                val mainIntent = Intent(Intent.ACTION_MAIN, null)
                mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
                mainIntent.setPackage(packageName)
                
                val resolveInfoList = pm.queryIntentActivities(mainIntent, 0)
                
                if (resolveInfoList.isNotEmpty()) {
                    val resolveInfo = resolveInfoList[0]
                    val activityInfo = resolveInfo.activityInfo
                    
                    intent = Intent(Intent.ACTION_MAIN)
                    intent.addCategory(Intent.CATEGORY_LAUNCHER)
                    intent.setComponent(
                        ComponentName(
                            activityInfo.packageName,
                            activityInfo.name
                        )
                    )
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    
                    Log.d("AppLauncher", "Encontrada actividad LAUNCHER: ${activityInfo.name}")
                }
            }
            
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.reject("APP_NOT_FOUND", "No se pudo encontrar una actividad LAUNCHER para $packageName")
            }
        } catch (e: Exception) {
            Log.e("AppLauncher", "Error al abrir app: ${e.message}", e)
            promise.reject("ERROR", e.message ?: "Error desconocido")
        }
    }
}