package com.managruham.realapp

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
                
                // Handle WhatsApp, Razorpay or other external intent URIs
                if (url.startsWith("whatsapp:") || url.contains("wa.me") || url.startsWith("tel:") || url.startsWith("mailto:") || url.contains("rzp.io") || url.contains("razorpay.com") || url.startsWith("rzp:")) {
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
