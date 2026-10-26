import os
import shutil
import zipfile
import re
import subprocess

def build_web_assets():
    print("Building web assets using 'npm run build'...")
    try:
        # Run npm run build
        result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
        if result.returncode != 0:
            print("Web build failed:")
            print(result.stderr)
            return False
        print("Web build completed successfully.")
        return True
    except Exception as e:
        print(f"Error during web build: {e}")
        return False

def setup_android_structure():
    base_dir = "android-project"
    
    # Ensure clean start
    if os.path.exists(base_dir):
        shutil.rmtree(base_dir)
        
    os.makedirs(base_dir)
    print("Created android-project directory structure...")

    # Define directories to create
    dirs = [
        "gradle/wrapper",
        "app/src/main/java/com/managruham/realapp",
        "app/src/main/res/values",
        "app/src/main/res/xml",
        "app/src/main/assets"
    ]
    
    for d in dirs:
        os.makedirs(os.path.join(base_dir, d), exist_ok=True)
        
    return base_dir

def write_gradle_wrapper_properties(base_dir):
    content = """distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
"""
    filepath = os.path.join(base_dir, "gradle/wrapper/gradle-wrapper.properties")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_settings_gradle_kts(base_dir):
    content = """pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ManaGruham_RealApp"
include(":app")
"""
    filepath = os.path.join(base_dir, "settings.gradle.kts")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_settings_gradle_groovy(base_dir):
    content = """// Groovy version of settings.gradle for backward-compatibility
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ManaGruham_RealApp"
include ':app'
"""
    filepath = os.path.join(base_dir, "settings.gradle")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_local_properties(base_dir):
    content = """# Local properties generated for Android Studio compilation
# Location of the SDK. This is only used by Gradle.
#
# Default paths for common operating systems:
# macOS: sdk.dir=/Users/<username>/Library/Android/sdk
# Windows: sdk.dir=C\\\\:\\\\Users\\\\<username>\\\\AppData\\\\Local\\\\Android\\\\Sdk
# Linux: sdk.dir=/home/<username>/Android/Sdk

sdk.dir=/Users/android/Library/Android/sdk
"""
    filepath = os.path.join(base_dir, "local.properties")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_project_build_gradle_kts(base_dir):
    content = """// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}
"""
    filepath = os.path.join(base_dir, "build.gradle.kts")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_gradle_properties(base_dir):
    content = """org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
"""
    filepath = os.path.join(base_dir, "gradle.properties")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_app_build_gradle_kts(base_dir):
    content = """plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.managruham.realapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.managruham.realapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.webkit:webkit:1.9.0")
    
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
"""
    filepath = os.path.join(base_dir, "app/build.gradle.kts")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_proguard_rules(base_dir):
    content = """# Add project specific Proguard rules here.
# By default, the flags in this file are appended to flags specified
# in /Users/android/Library/Android/sdk/tools/proguard/proguard-android.txt
"""
    filepath = os.path.join(base_dir, "app/proguard-rules.pro")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_android_manifest(base_dir):
    content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.managruham.realapp">

    <!-- Permissions required for WebView and Internet connection -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ManaGruhamRealApp"
        android:networkSecurityConfig="@xml/network_security_config"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.ManaGruhamRealApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
"""
    filepath = os.path.join(base_dir, "app/src/main/AndroidManifest.xml")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_network_security_config(base_dir):
    content = """<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
"""
    filepath = os.path.join(base_dir, "app/src/main/res/xml/network_security_config.xml")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_colors_xml(base_dir):
    content = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="amber_500">#FFF59E0B</color>
    <color name="stone_950">#FF0C0A09</color>
</resources>
"""
    filepath = os.path.join(base_dir, "app/src/main/res/values/colors.xml")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_strings_xml(base_dir):
    content = """<resources>
    <string name="app_name">మనం గృహం</string>
</resources>
"""
    filepath = os.path.join(base_dir, "app/src/main/res/values/strings.xml")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_themes_xml(base_dir):
    content = """<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->
    <style name="Theme.ManaGruhamRealApp" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <!-- Primary brand color. -->
        <item name="colorPrimary">@color/amber_500</item>
        <item name="colorPrimaryVariant">@color/stone_950</item>
        <item name="colorOnPrimary">@color/white</item>
        <!-- Status bar color. -->
        <item name="android:statusBarColor">@color/stone_950</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
"""
    filepath = os.path.join(base_dir, "app/src/main/res/values/themes.xml")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_main_activity_kt(base_dir):
    content = """package com.managruham.realapp

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_RESULT_CODE = 1

    // Live production URL from the application context
    private val liveUrl = "https://ais-pre-h6q6uvhlkysrts2zjytsqs-130060079220.asia-southeast1.run.app"
    private val fallbackLocalUrl = "file:///android_asset/index.html"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Dynamic layout creation so it works standalone out of the box without XML layout binding issues
        val relativeLayout = android.widget.RelativeLayout(this)
        relativeLayout.layoutParams = android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
        )
        relativeLayout.setBackgroundColor(android.graphics.Color.parseColor("#0C0A09")) // match stone-950

        webView = WebView(this)
        webView.layoutParams = android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
        )
        webView.visibility = View.INVISIBLE // Show only when fully loaded

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal)
        val progressParams = android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
            12
        )
        progressParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP)
        progressBar.layoutParams = progressParams
        progressBar.progressDrawable.setColorFilter(
            android.graphics.Color.parseColor("#F59E0B"), // amber-500
            android.graphics.PorterDuff.Mode.SRC_IN
        )
        progressBar.max = 100

        // Elegant Splash logo overlay
        val splashContainer = android.widget.LinearLayout(this)
        splashContainer.orientation = android.widget.LinearLayout.VERTICAL
        splashContainer.gravity = android.view.Gravity.CENTER
        val splashParams = android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
        )
        splashContainer.layoutParams = splashParams
        splashContainer.setBackgroundColor(android.graphics.Color.parseColor("#0C0A09"))

        val splashText = android.widget.TextView(this)
        splashText.text = "మనం గృహం"
        splashText.textSize = 28f
        splashText.setTextColor(android.graphics.Color.parseColor("#F59E0B"))
        splashText.typeface = android.graphics.Typeface.DEFAULT_BOLD
        splashText.gravity = android.view.Gravity.CENTER
        
        val splashSubtext = android.widget.TextView(this)
        splashSubtext.text = "Mana Gruham Real App"
        splashSubtext.textSize = 14f
        splashSubtext.setTextColor(android.graphics.Color.parseColor("#A8A29E"))
        splashSubtext.gravity = android.view.Gravity.CENTER
        splashSubtext.setPadding(0, 16, 0, 0)

        splashContainer.addView(splashText)
        splashContainer.addView(splashSubtext)

        relativeLayout.addView(webView)
        relativeLayout.addView(progressBar)
        relativeLayout.addView(splashContainer)

        setContentView(relativeLayout)

        // Webview Settings configuration
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // Custom WebViewClient
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                progressBar.progress = 10
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                // Smoothly reveal WebView and fade out Splash
                splashContainer.animate().alpha(0f).setDuration(500).withEndAction {
                    splashContainer.visibility = View.GONE
                    webView.visibility = View.VISIBLE
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                
                // Handle WhatsApp or external intent URIs
                if (url.startsWith("whatsapp:") || url.contains("wa.me") || url.startsWith("tel:") || url.startsWith("mailto:")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "పరికరంలో తగిన అప్లికేషన్ కనుగొనబడలేదు", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }
                
                // Standard internal navigation stays inside WebView
                return false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                // If live URL fails, load local offline fallback
                val url = request?.url?.toString()
                if (url != null && url.startsWith(liveUrl)) {
                    webView.loadUrl(fallbackLocalUrl)
                }
            }
        }

        // Custom WebChromeClient for dialogs, progress, file uploads
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar.progress = newProgress
            }

            // Support photo and document uploads from WebView
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback = filePathCallback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                }
                startActivityForResult(
                    Intent.createChooser(intent, "చిత్రాన్ని ఎంచుకోండి"),
                    FILE_CHOOSER_RESULT_CODE
                )
                return true
            }
        }

        // Setup back button press routing to handle WebView navigation history
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Initial Load
        webView.loadUrl(liveUrl)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (fileUploadCallback == null) return
            val results = if (resultCode == RESULT_OK && data != null) {
                val dataString = data.dataString
                if (dataString != null) arrayOf(Uri.parse(dataString)) else null
            } else null
            fileUploadCallback?.onReceiveValue(results)
            fileUploadCallback = null
        }
    }
}
"""
    filepath = os.path.join(base_dir, "app/src/main/java/com/managruham/realapp/MainActivity.kt")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def write_gradlew_scripts(base_dir):
    # gradlew script (linux)
    content_linux = """#!/bin/sh
# Basic wrapper script for gradle
exec gradle "$@"
"""
    # gradlew.bat (windows)
    content_windows = """@echo off
gradle %*
"""
    
    with open(os.path.join(base_dir, "gradlew"), "w", encoding="utf-8") as f:
        f.write(content_linux)
    os.chmod(os.path.join(base_dir, "gradlew"), 0o755)
    
    with open(os.path.join(base_dir, "gradlew.bat"), "w", encoding="utf-8") as f:
        f.write(content_windows)

def copy_and_adapt_web_assets(base_dir):
    dist_dir = "dist"
    assets_target_dir = os.path.join(base_dir, "app/src/main/assets")
    
    if not os.path.exists(dist_dir):
        print(f"Error: {dist_dir} does not exist. Cannot copy web assets.")
        return False
        
    print(f"Copying web assets from {dist_dir} to {assets_target_dir}...")
    
    # Re-create targets empty
    if os.path.exists(assets_target_dir):
        shutil.rmtree(assets_target_dir)
    os.makedirs(assets_target_dir, exist_ok=True)
    
    # Copy all files
    for root, dirs, files in os.walk(dist_dir):
        # Create corresponding directories in target
        relative_path = os.path.relpath(root, dist_dir)
        if relative_path == ".":
            dest_dir = assets_target_dir
        else:
            dest_dir = os.path.join(assets_target_dir, relative_path)
            os.makedirs(dest_dir, exist_ok=True)
            
        for file in files:
            src_file = os.path.join(root, file)
            dest_file = os.path.join(dest_dir, file)
            shutil.copy2(src_file, dest_file)
            
    # Modify index.html to use relative paths for offline loading
    index_path = os.path.join(assets_target_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            html = f.read()
            
        # Replace absolute /assets/ with ./assets/
        adapted_html = html.replace('="/assets/', '="./assets/')
        adapted_html = adapted_html.replace('href="/assets/', 'href="./assets/')
        adapted_html = adapted_html.replace('src="/assets/', 'src="./assets/')
        adapted_html = adapted_html.replace('="/favicon.ico"', '="./favicon.ico"')
        adapted_html = adapted_html.replace('="/icon.png"', '="./icon.png"')
        
        # Write modified index.html back
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(adapted_html)
            
        print("Successfully adapted index.html for relative offline loading.")
    return True

def zip_project(base_dir):
    zip_dir = "public"
    os.makedirs(zip_dir, exist_ok=True)
    zip_filename = os.path.join(zip_dir, "ManaGruham_AndroidProject.zip")
    
    print(f"Creating ZIP archive {zip_filename}...")
    
    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                filepath = os.path.join(root, file)
                archive_name = os.path.relpath(filepath, base_dir)
                # Put everything inside a top-level folder 'ManaGruham_AndroidProject' in the zip
                zipf.write(filepath, os.path.join("ManaGruham_AndroidProject", archive_name))
                
    print(f"Zip completed: {zip_filename}")
    return zip_filename

def main():
    if not build_web_assets():
        print("Web build failed! We will proceed with generating project structure, but web assets might be empty.")
        
    base_dir = setup_android_structure()
    write_gradle_wrapper_properties(base_dir)
    write_settings_gradle_kts(base_dir)
    write_settings_gradle_groovy(base_dir)
    write_local_properties(base_dir)
    write_project_build_gradle_kts(base_dir)
    write_gradle_properties(base_dir)
    write_app_build_gradle_kts(base_dir)
    write_proguard_rules(base_dir)
    write_android_manifest(base_dir)
    write_network_security_config(base_dir)
    write_colors_xml(base_dir)
    write_strings_xml(base_dir)
    write_themes_xml(base_dir)
    write_main_activity_kt(base_dir)
    write_gradlew_scripts(base_dir)
    
    # Copy web assets if they exist
    copy_and_adapt_web_assets(base_dir)
    
    # Zip the project
    zip_path = zip_project(base_dir)
    
    # Copy to public folder with a second easy name for accessibility
    shutil.copy2(zip_path, os.path.join("public", "android_project.zip"))
    
    print("\n=============================================")
    print("SUCCESS: Android Studio Project generation complete!")
    print(f"Download zip available at: {zip_path}")
    print("=============================================")

if __name__ == "__main__":
    main()
