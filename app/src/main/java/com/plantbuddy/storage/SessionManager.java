package com.plantbuddy.storage;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;
import com.plantbuddy.model.User;

public class SessionManager {
    private static final String PREF_NAME = "plantbuddy_secure_prefs";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USERNAME = "username";
    private final SharedPreferences prefs;

    public SessionManager(Context context) {
        try {
            MasterKey masterKey = new MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build();
            prefs = EncryptedSharedPreferences.create(context, PREF_NAME, masterKey, EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize secure storage", e);
        }
    }
    public void saveSession(String token, User user) { prefs.edit().putString(KEY_TOKEN, token).putLong(KEY_USER_ID, user.getId()).putString(KEY_USERNAME, user.getUsername()).apply(); }
    public String getAccessToken() { return prefs.getString(KEY_TOKEN, null); }
    public boolean isLoggedIn() { return getAccessToken() != null; }
    public void clear() { prefs.edit().clear().apply(); }
}
