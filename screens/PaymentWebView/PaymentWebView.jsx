import React, { useState } from "react";
import { SafeAreaView, ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";
import { styles } from "./styles";
import Toast from "react-native-toast-message";

export default function PaymentWebView({ route, navigation }) {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState) => {
    console.log("Current URL:", navState.url);

    // Xử lý URL trả về từ VNPay
    if (navState.url.includes("vnp_ResponseCode")) {
      try {
        const params = new URLSearchParams(navState.url.split("?")[1]);
        const responseCode = params.get("vnp_ResponseCode");
        console.log("VNPay Response Code:", responseCode);

        if (responseCode === "00") {
          Toast.show({
            type: "success",
            text1: "Payment Successful",
            text2: "Your payment has been processed successfully",
            visibilityTime: 2000,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Payment Failed",
            text2: "Payment was not successful",
            visibilityTime: 2000,
          });
        }

        // Navigate back in both cases
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
        return false;
      } catch (error) {
        console.error("Error processing payment response:", error);
      }
    }

    // Kiểm tra lỗi kết nối
    if (navState.url.includes("ERR_CONNECTION_REFUSED")) {
      Toast.show({
        type: "error",
        text1: "Connection Error",
        text2: "Unable to connect to payment service",
        visibilityTime: 2000,
      });
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
      return false;
    }

    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        originWhitelist={["*"]}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error:", nativeEvent);
          // Chỉ hiển thị lỗi nếu không phải là redirect
          if (!nativeEvent.url?.includes("vnp_ResponseCode")) {
            Toast.show({
              type: "error",
              text1: "Connection Error",
              text2: "Unable to load payment page",
              visibilityTime: 2000,
            });
            navigation.goBack();
          }
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4a6ee0" />
        </View>
      )}
    </SafeAreaView>
  );
}
