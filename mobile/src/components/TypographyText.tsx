import { StyleSheet, Text as NativeText } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';
import { useAppSettings } from '../context/AppSettings';
import { fontFamilies } from '../theme';

type Weight = 'regular' | 'medium' | 'semiBold' | 'bold';
type TypographyTextProps = TextProps & {
  variant?: 'body' | 'display';
};

function getWeight(fontWeight: TextStyle['fontWeight']): Weight {
  if (fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900') return 'bold';
  if (fontWeight === '600') return 'semiBold';
  if (fontWeight === '500') return 'medium';
  return 'regular';
}

export function TypographyText({ variant = 'body', style, ...props }: TypographyTextProps) {
  const { locale } = useAppSettings();
  const fontWeight = StyleSheet.flatten(style)?.fontWeight ?? '400';
  const weight = getWeight(fontWeight);
  const fontFamily = locale === 'ar'
    ? fontFamilies.arabic[weight]
    : variant === 'display'
      ? fontFamilies.display[weight]
      : fontFamilies.sans[weight];

  return <NativeText {...props} style={[style, { fontFamily }]} />;
}
