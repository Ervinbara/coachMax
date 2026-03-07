import { useWindowDimensions } from "react-native";

const MOBILE_MAX = 767;
const TABLET_MAX = 1199;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isMobile = width <= MOBILE_MAX;
  const isTablet = width > MOBILE_MAX && width <= TABLET_MAX;
  const isDesktop = width > TABLET_MAX;

  return { width, isMobile, isTablet, isDesktop };
}
