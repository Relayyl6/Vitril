import React from "react";
import { View } from "react-native";
import Avatar from "./Avatar";

interface Member {
  name?: string;
  image?: string;
}

interface Props {
  members: Member[];
  size?: number;
}

export default function GroupAvatar({ members, size = 52 }: Props) {
  const visible = members.slice(0, 4);

  const small = size * 0.62;

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      {visible.map((member, index) => {
        const positions = [
          {
            top: 0,
            left: 0,
          },
          {
            top: 0,
            right: 0,
          },
          {
            bottom: 0,
            left: 0,
          },
          {
            bottom: 0,
            right: 0,
          },
        ];

        return (
          <View
            key={index}
            style={{
              position: "absolute",
              ...positions[index],
            }}
          >
            <Avatar
              name={member.name || "?"}
              image={member.image}
              size={small}
            />
          </View>
        );
      })}
    </View>
  );
}
