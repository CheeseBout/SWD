import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Dimensions,
} from "react-native";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import blogServices from "../../services/blogServices";
import { WebView } from "react-native-webview";
import { Linking } from "react-native";

export default function BlogDetail({ route, navigation }) {
  const { slug } = route.params;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState(300);

  useEffect(() => {
    fetchBlogDetail();
  }, [slug]);

  const fetchBlogDetail = async () => {
    setLoading(true);
    try {
      const response = await blogServices.getPostBySlug(slug);
      console.log("Blog detail API response:", response.data);

      if (response.data && response.data.data) {
        setBlog(response.data.data);
        // Fetch related blogs nếu cần
      }
    } catch (error) {
      console.error("Error fetching blog detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <Image
          source={{
            uri:
              blog?.coverPhoto ||
              "https://via.placeholder.com/800x400?text=No+Cover+Image",
          }}
          style={styles.coverImage}
        />

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Category and Read Time */}
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{blog?.category}</Text>
            <Text style={styles.readTime}>3 min read</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{blog?.title}</Text>

          {/* Author Info */}
          <View style={styles.authorContainer}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {blog?.author?.name || "Unknown Author"}
              </Text>
              <Text style={styles.date}>{formatDate(blog?.postDate)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Blog Content */}
          <WebView
            originWhitelist={["*"]}
            source={{
              html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                    <style>
                      body {
                        font-family: -apple-system, Roboto, sans-serif;
                        padding: 20px;
                        margin: 0;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #444;
                      }
                      img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 10px 0;
                      }
                      p {
                        margin-bottom: 15px;
                      }
                    </style>
                  </head>
                  <body>
                    ${blog?.content?.html || "<p>No content available</p>"}
                  </body>
                </html>
              `,
            }}
            style={{
              height: webViewHeight,
              width: Dimensions.get("window").width - 40,
              backgroundColor: "transparent",
            }}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            onNavigationStateChange={(event) => {
              if (event.url !== "about:blank") {
                Linking.openURL(event.url);
                return false;
              }
            }}
            onMessage={(event) => {
              try {
                const { height } = JSON.parse(event.nativeEvent.data);
                setWebViewHeight(height);
              } catch (error) {
                console.log("Error adjusting WebView height:", error);
              }
            }}
            injectedJavaScript={`
              window.ReactNativeWebView.postMessage(JSON.stringify({
                height: document.documentElement.scrollHeight
              }));
              true;
            `}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
