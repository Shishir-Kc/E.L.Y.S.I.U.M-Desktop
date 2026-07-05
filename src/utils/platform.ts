/**
 * Shared platform helpers. RN core already exposes Platform.OS, this just adds
 * graceful web detection and a couple of helpers.
 */
import { Platform } from 'react-native';

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isNative(): boolean {
  return Platform.OS !== 'web';
}

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Select value based on platform. Useful for styling & API base URL defaults.
 */
export function selectByPlatform<T>(opts: { web?: T; android?: T; ios?: T; native?: T; default: T }): T {
  switch (Platform.OS) {
    case 'web':    return opts.web ?? opts.default;
    case 'android': return opts.android ?? opts.native ?? opts.default;
    case 'ios':    return opts.ios ?? opts.native ?? opts.default;
    default:       return opts.default;
  }
}
