package com.plantbuddy.network;

import com.google.gson.GsonBuilder;
import com.plantbuddy.BuildConfig;
import com.plantbuddy.storage.SessionManager;
import java.util.concurrent.TimeUnit;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    private static RetrofitClient instance;
    private final ApiService apiService;
    private RetrofitClient(SessionManager sessionManager) {
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(BuildConfig.HTTP_LOGGING ? HttpLoggingInterceptor.Level.BODY : HttpLoggingInterceptor.Level.NONE);
        OkHttpClient client = new OkHttpClient.Builder().addInterceptor(new AuthInterceptor(sessionManager)).addInterceptor(loggingInterceptor)
                .connectTimeout(30, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).writeTimeout(30, TimeUnit.SECONDS).build();
        apiService = new Retrofit.Builder().baseUrl(BuildConfig.BASE_URL).client(client)
                .addConverterFactory(GsonConverterFactory.create(new GsonBuilder().create())).build().create(ApiService.class);
    }
    public static synchronized RetrofitClient getInstance(SessionManager sessionManager) { if (instance == null) instance = new RetrofitClient(sessionManager); return instance; }
    public ApiService getApiService() { return apiService; }
}
