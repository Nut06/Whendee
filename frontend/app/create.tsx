import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { eventApi } from "./lib/api";

type OptionField = { id: string; value: string };

const randomId = () => Math.random().toString(36).slice(2, 9);

export default function CreateScreen() {
  const router = useRouter();
  const [organizerId, setOrganizerId] = useState("user_123");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("2025-06-01T09:00:00.000Z");
  const [endsAt, setEndsAt] = useState("2025-06-01T12:00:00.000Z");
  const [options, setOptions] = useState<OptionField[]>([
    { id: randomId(), value: "Option A" },
    { id: randomId(), value: "Option B" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: randomId(), value: "" }]);
  };

  const handleChangeOption = (id: string, value: string) => {
    setOptions((prev) => prev.map((opt) => (opt.id === id ? { ...opt, value } : opt)));
  };

  const handleSubmit = async () => {
    if (!organizerId.trim() || !title.trim() || !location.trim()) {
      Alert.alert("Missing data", "Organizer, title, and location are required");
      return;
    }

    const preparedOptions = options
      .map((opt, index) => ({ label: opt.value.trim(), order: index }))
      .filter((opt) => opt.label.length > 0);

    if (preparedOptions.length < 2) {
      Alert.alert("Poll needs options", "Please provide at least two poll options");
      return;
    }

    try {
      setSubmitting(true);
      const eventResult = await eventApi.createEvent({
        organizerId: organizerId.trim(),
        title: title.trim(),
        description: description.trim() || "",
        location: location.trim(),
        startsAt: startsAt.trim(),
        endsAt: endsAt.trim(),
      });

      const eventId = eventResult.data.eventId;

      await eventApi.createPoll(eventId, {
        organizerId: organizerId.trim(),
        options: preparedOptions,
      });

      Alert.alert("Success", "Event created successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/(main)/plan"),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a new plan</Text>

      <Text style={styles.label}>Organizer ID</Text>
      <TextInput
        style={styles.input}
        value={organizerId}
        onChangeText={setOrganizerId}
        placeholder="user_123"
      />

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="ISE Workshop"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your plan"
        multiline
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Innovation Lab"
      />

      <Text style={styles.label}>Starts At (ISO)</Text>
      <TextInput
        style={styles.input}
        value={startsAt}
        onChangeText={setStartsAt}
        placeholder="2025-06-01T09:00:00.000Z"
      />

      <Text style={styles.label}>Ends At (ISO)</Text>
      <TextInput
        style={styles.input}
        value={endsAt}
        onChangeText={setEndsAt}
        placeholder="2025-06-01T12:00:00.000Z"
      />

      <View style={styles.optionsHeader}>
        <Text style={styles.optionsTitle}>Poll Options</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
          <Ionicons name="add" size={18} color="#2b7cff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {options.map((option, index) => (
        <TextInput
          key={option.id}
          style={styles.input}
          value={option.value}
          onChangeText={(value) => handleChangeOption(option.id, value)}
          placeholder={`Option ${index + 1}`}
        />
      ))}

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={() => void handleSubmit()}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>{submitting ? "Creating..." : "Create"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 80,
    backgroundColor: "#f6f7fb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    color: "#111827",
  },
  label: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  optionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  optionsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderColor: "#cfe4ff",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addButtonText: {
    marginLeft: 4,
    color: "#2b7cff",
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: "#2b7cff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#2b7cff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
