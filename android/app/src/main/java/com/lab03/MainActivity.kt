package com.lab03

import android.os.Bundle   // ← обовʼязковий імпорт
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "lab03"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        // Повернути AppTheme (SplashTheme був у Manifest)
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
    }
}
