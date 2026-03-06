package com.plantbuddy.network;

import com.plantbuddy.model.*;
import com.plantbuddy.network.dto.*;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {
    @POST("api/auth/register") Call<ApiResponse<AuthPayload>> register(@Body RegisterRequest request);
    @POST("api/auth/login") Call<ApiResponse<AuthPayload>> login(@Body LoginRequest request);
    @GET("api/me") Call<ApiResponse<User>> me();
    @GET("api/plants") Call<ApiResponse<List<Plant>>> getPlants();
    @GET("api/plants/{id}") Call<ApiResponse<Plant>> getPlant(@Path("id") long id);
    @POST("api/plants") Call<ApiResponse<Plant>> createPlant(@Body PlantRequest request);
    @PUT("api/plants/{id}") Call<ApiResponse<Plant>> updatePlant(@Path("id") long id, @Body PlantRequest request);
    @DELETE("api/plants/{id}") Call<ApiResponse<Void>> deletePlant(@Path("id") long id);
}
