import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import blogServices from "../../services/blogServices";

const categories = [
  "All",
  "Family",
  "Category",
  "Pre-Marriage",
  "Wedding Planning",
  "Relationships",
  "Finance",
  "Health",
];

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogServices.getPosts();

      console.log("Blog API Response:", response.data);

      // Phân tích cấu trúc đúng của response
      if (response.data && response.data.data) {
        console.log("Blog data to set:", response.data.data);
        setBlogs(response.data.data.reverse());
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  // Đếm số comments và likes ngẫu nhiên (tạm thời)
  const getRandomStat = () => {
    return Math.floor(Math.random() * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Trích xuất đoạn mô tả từ HTML content (loại bỏ tags)
  const extractExcerpt = (htmlContent) => {
    if (!htmlContent) return "";
    const text = htmlContent.replace(/<[^>]+>/g, " ");
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  };

  const filteredBlogs = blogs.filter((blog) => {
    // Lọc theo danh mục
    const categoryMatch =
      selectedCategory === "All" || blog.category === selectedCategory;

    // Lọc theo từ khóa tìm kiếm
    const titleMatch = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const authorMatch =
      blog.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    return categoryMatch && (titleMatch || authorMatch);
  });

  const renderBlogItem = ({ item }) => {
    console.log("Rendering blog item:", item);
    return (
      <TouchableOpacity
        style={styles.blogCard}
        onPress={() => navigation.navigate("BlogDetail", { slug: item.slug })}
      >
        <Image
          source={{
            uri:
              item.coverPhoto ||
              "https://via.placeholder.com/400x200?text=No+Image",
          }}
          style={styles.blogImage}
        />
        <View style={styles.blogCategory}>
          <Text style={styles.blogCategoryText}>
            {item.category || "Uncategorized"}
          </Text>
        </View>
        <View style={styles.blogContent}>
          <Text style={styles.blogTitle}>{item.title}</Text>
          <Text style={styles.blogExcerpt}>
            {extractExcerpt(item.content?.html)}
          </Text>
          <View style={styles.blogMeta}>
            <View style={styles.authorContainer}>
              <Text style={styles.blogAuthor}>
                {item.author?.name || "Unknown Author"}
              </Text>
              <Text style={styles.blogDate}>{formatDate(item.postDate)}</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={16} color="#4a6ee0" />
                <Text style={styles.statText}>{getRandomStat()}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={16} color="#4a6ee0" />
                <Text style={styles.statText}>{getRandomStat()}</Text>
              </View>
              <Text style={styles.readTime}>3 min read</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.categoryItemActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.categoryTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marriage Blog</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4a6ee0" />
        </View>
      ) : (
        <FlatList
          data={filteredBlogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.blogsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No articles found</Text>
              <Text style={styles.emptySubText}>
                Try changing your search or filters
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
