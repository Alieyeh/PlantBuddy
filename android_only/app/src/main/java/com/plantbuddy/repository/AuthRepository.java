package com.plantbuddy.repository;

import com.plantbuddy.model.*;
import com.plantbuddy.network.ApiService;
import com.plantbuddy.network.dto.*;
import com.plantbuddy.storage.SessionManager;
import retrofit2.*;

public class AuthRepository {
    private final ApiService apiService; private final SessionManager sessionManager;
    public AuthRepository(ApiService apiService, SessionManager sessionManager) { this.apiService = apiService; this.sessionManager = sessionManager; }
    public void login(String usernameOrEmail, String password, RepositoryCallback<AuthPayload> callback) {
        apiService.login(new LoginRequest(usernameOrEmail, password)).enqueue(new Callback<>() {
            @Override public void onResponse(Call<ApiResponse<AuthPayload>> call, Response<ApiResponse<AuthPayload>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) { AuthPayload payload = response.body().getData(); sessionManager.saveSession(payload.getAccessToken(), payload.getUser()); callback.onSuccess(payload); }
                else callback.onError(response.body() != null ? response.body().getMessage() : "Something went wrong");
            }
            @Override public void onFailure(Call<ApiResponse<AuthPayload>> call, Throwable t) { callback.onError(t.getMessage() != null ? t.getMessage() : "Network error"); }
        });
    }
    public void register(String username, String email, String password, String displayName, RepositoryCallback<AuthPayload> callback) {
        apiService.register(new RegisterRequest(username, email, password, displayName)).enqueue(new Callback<>() {
            @Override public void onResponse(Call<ApiResponse<AuthPayload>> call, Response<ApiResponse<AuthPayload>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) { AuthPayload payload = response.body().getData(); sessionManager.saveSession(payload.getAccessToken(), payload.getUser()); callback.onSuccess(payload); }
                else callback.onError(response.body() != null ? response.body().getMessage() : "Something went wrong");
            }
            @Override public void onFailure(Call<ApiResponse<AuthPayload>> call, Throwable t) { callback.onError(t.getMessage() != null ? t.getMessage() : "Network error"); }
        });
    }
    public boolean isLoggedIn() { return sessionManager.isLoggedIn(); }
    public void logout() { sessionManager.clear(); }
}
