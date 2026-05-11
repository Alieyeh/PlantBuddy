import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: 'plantbuddy_token',
  USER_ID: 'plantbuddy_user_id',
  USERNAME: 'plantbuddy_username',
};

export const SessionManager = {
  async saveSession(token, user) {
    await AsyncStorage.multiSet([
      [KEYS.TOKEN, token],
      [KEYS.USER_ID, String(user.id)],
      [KEYS.USERNAME, user.username],
    ]);
  },

  async getAccessToken() {
    return AsyncStorage.getItem(KEYS.TOKEN);
  },

  async isLoggedIn() {
    const token = await AsyncStorage.getItem(KEYS.TOKEN);
    return token !== null;
  },

  async clear() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
