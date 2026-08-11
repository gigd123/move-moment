import { StyleSheet, Text } from 'react-native';

import { colors } from '../utils/colors';

interface ScoreStarsProps {
  score: number;
  color?: string;
  size?: number;
}

export default function ScoreStars({ score, color = colors.accent, size = 16 }: ScoreStarsProps) {
  const filled = Math.max(0, Math.min(5, Math.round(score / 20)));
  const stars = '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);

  return (
    <Text style={[styles.stars, { color, fontSize: size }]} accessibilityLabel={`${filled} / 5 顆星`}>
      {stars}
    </Text>
  );
}

const styles = StyleSheet.create({
  stars: { letterSpacing: 2, fontWeight: '600' },
});
