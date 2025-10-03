import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";

type Plan = {
  id: string;
  title: string;
  date?: string; // อาจจะว่างได้
  participants: string[];
  location?: string;
  type: "no-selected" | "no-date" | "upcoming";
};

const plans: Plan[] = [
  {
    id: "1",
    title: "New year trip",
    participants: ["A", "B", "C", "D", "E"],
    type: "no-selected",
  },
  {
    id: "2",
    title: "Develop a new website page",
    participants: ["A", "B", "C", "D", "E"],
    location: "Semarang Regency, Central Java",
    type: "no-date",
  },
  {
    id: "3",
    title: "Batman Movie",
    date: "Mon 10 Sep | 10:00 AM - 1:30 PM",
    participants: ["A", "B", "C", "D", "E"],
    location: "Major Cineplex, Semarang",
    type: "upcoming",
  },
  {
    id: "4",
    title: "Batman Movie",
    date: "Mon 10 Sep | 10:00 AM - 1:30 PM",
    participants: ["A", "B", "C", "D", "E"],
    location: "Major Cineplex, Semarang",
    type: "upcoming",
  },
];

export default function PlansScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Section: No selected plans */}
      <Text style={styles.sectionTitle}>No selected plans (1)</Text>
      {plans
        .filter((p) => p.type === "no-selected")
        .map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>
              {item.participants.length} participants
            </Text>
          </View>
        ))}

      {/* Section: No date selected plans */}
      <Text style={styles.sectionTitle}>No date selected plans (1)</Text>
      {plans
        .filter((p) => p.type === "no-date")
        .map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.location}</Text>
            <Text style={styles.subtitle}>
              {item.participants.length} participants
            </Text>
          </View>
        ))}

      {/* Section: Upcoming Plans */}
      <Text style={styles.sectionTitle}>Upcoming Plans (2)</Text>
      {plans
        .filter((p) => p.type === "upcoming")
        .map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.location}</Text>
            <Text style={styles.subtitle}>
              {item.participants.length} participants
            </Text>
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 13,
    color: "#2563EB",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
