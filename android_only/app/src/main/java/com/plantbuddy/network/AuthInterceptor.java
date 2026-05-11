package com.plantbuddy.network;

import com.plantbuddy.storage.SessionManager;
import java.io.IOException;
import okhttp3.*;

public class AuthInterceptor implements Interceptor {
    private final SessionManager sessionManager;
    public AuthInterceptor(SessionManager sessionManager) { this.sessionManager = sessionManager; }
    @Override public Response intercept(Chain chain) throws IOException {
        Request original = chain.request(); String token = sessionManager.getAccessToken();
        if (token == null || token.isBlank()) return chain.proceed(original);
        return chain.proceed(original.newBuilder().header("Authorization", "Bearer " + token).build());
    }
}
