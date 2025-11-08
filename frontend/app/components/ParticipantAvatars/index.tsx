import { View, Text } from 'react-native';

interface ParticipantAvatarsProps {
  participants: string[];
}

const ParticipantAvatars = ({ participants }: ParticipantAvatarsProps) => {
  return (
    <View className="flex-row">
      {participants.map((participant, index) => (
        <View
          key={participant}
          style={{
            marginLeft: index > 0 ? -8 : 0,
            zIndex: participants.length - index,
          }}
        >
          <View 
            className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-xs text-gray-600">{participant[0]}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ParticipantAvatars;